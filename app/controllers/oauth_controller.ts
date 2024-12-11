import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import User from '#models/user'
import AuthCode from '#models/auth_code'
import OauthClient from '#models/oauth_client'
import AuthValidator from '#validators/auth'
import { v4 as uuidv4 } from 'uuid'
import messagesProvider from '#helpers/validation_messages_provider'

export default class OauthController {
  private validateScopes(requestedScopes: string, allowedScopes: string[]): string[] | null {
    const requested = requestedScopes.split(' ').filter(Boolean)
    if (requested.length === 0) return null
    const isValid = requested.every((scope) => allowedScopes.includes(scope))
    return isValid ? requested : null
  }

  private async validateOauthClient(clientId: string, scopes: string, redirectUri: string) {
    const oauthClient = await OauthClient.findBy('client_id', clientId)
    if (!oauthClient) return null

    const allowedScopes = oauthClient.allowed_scopes.split(',').map((s) => s.trim())
    const validScopes = this.validateScopes(scopes, allowedScopes)
    if (!validScopes) return null

    if (!oauthClient.redirect_uri.startsWith('http')) {
      return null
    }
    const allowedUri = new URL(oauthClient.redirect_uri)
    const requestedUri = new URL(redirectUri)
    if (
      allowedUri.origin !== requestedUri.origin ||
      !requestedUri.pathname.startsWith(allowedUri.pathname)
    ) {
      return null
    }
    return oauthClient
  }

  async authorize({ request, response }: HttpContext) {
    const {
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      response_type: responseType,
      state,
      nonce,
    } = request.qs()

    if (!clientId || !redirectUri || !scope || !state) {
      return response.unprocessableEntity({
        success: false,
        message: 'Missing required parameters.',
      })
    }

    if (responseType !== 'code') {
      return response.unauthorized({
        success: false,
        message: 'Invalid response_type. Only "code" is allowed.',
      })
    }

    const oauthClient = await this.validateOauthClient(clientId, scope, redirectUri)

    if (!oauthClient) {
      return response.unauthorized({
        success: false,
        message: 'Invalid client_id, scope, or redirect_uri.',
      })
    }

    try {
      const data = await vine
        .compile(AuthValidator.loginSchema)
        .validate(request.all(), { messagesProvider })

      const user = await User.verifyCredentials(data.email, data.password)
      if (!user) {
        return response.unauthorized({
          success: false,
          message: 'Invalid email or password.',
        })
      }
      const authCode = await AuthCode.create({
        code: uuidv4(),
        clientId: oauthClient.client_id,
        userId: user.id,
        scopes: scope,
        nonce: nonce || null,
        state: state,
        redirectUri: redirectUri,
        expiresAt: DateTime.utc().plus({ minutes: 5 }),
      })

      return response.ok({
        success: true,
        message: 'Authorization code generated successfully.',
        data: {
          uri: `${redirectUri}?code=${authCode.code}&state=${state}`,
        },
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to authorize.',
        error: error.message,
      })
    }
  }

  async token({ request, response, auth }: HttpContext) {
    const {
      grant_type: grantType,
      code,
      client_id: clientId,
      client_secret: clientSecret,
    } = request.qs()

    if (!grantType || !code || !clientId || !clientSecret) {
      return response.unprocessableEntity({
        success: false,
        message: 'Missing required parameters.',
      })
    }

    if (grantType !== 'authorization_code') {
      return response.unauthorized({
        success: false,
        message: 'Invalid grant_type. Only "authorization_code" is allowed.',
      })
    }

    const oauthClient = await OauthClient.findBy('client_id', clientId)
    if (!oauthClient || oauthClient.client_secret !== clientSecret) {
      return response.unauthorized({
        success: false,
        message: 'Invalid client credentials.',
      })
    }

    const authCode = await AuthCode.findBy('code', code)
    if (!authCode || authCode.clientId !== clientId) {
      return response.unauthorized({
        success: false,
        message: 'Invalid authorization code.',
      })
    }

    if (authCode.expiresAt <= DateTime.utc()) {
      await authCode.delete()
      return response.unauthorized({
        success: false,
        message: 'Authorization code has expired.',
      })
    }
    const user = await User.find(authCode.userId)
    if (!user) {
      return response.unauthorized({
        success: false,
        message: 'Invalid user.',
      })
    }

    try {
      await authCode.delete()
      const token = await auth.use('jwt').generate(user)
      if (!token) {
        return response.unprocessableEntity({
          success: false,
          message: 'Failed to generate access token.',
        })
      }

      return response.ok({
        success: true,
        message: 'Login successful.',
        data: {
          token: token,
          state: authCode.state,
          nonce: authCode.nonce,
        },
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to generate token.',
        error: error.message,
      })
    }
  }

  async me({ auth, response }: HttpContext) {
    try {
      const userData = await auth.use('jwt').authenticate()
      return response.ok({
        valid: true,
        user: userData,
        message: 'Token is valid',
      })
    } catch (error) {
      return response.unauthorized({
        valid: false,
        message: 'Invalid token',
        error: error.message,
      })
    }
  }
}
