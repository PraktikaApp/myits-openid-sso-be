import type { HttpContext } from '@adonisjs/core/http'
import OauthClient from '#models/oauth_client'
import vine from '@vinejs/vine'
import OauthClientValidator from '#validators/oauth_client'
import messagesProvider from '#helpers/validation_messages_provider'
import { generateUniqueClientId, generateRandomString } from '#helpers/random_string_generator'

export default class OauthClientsController {
  async index({ response }: HttpContext) {
    try {
      const examples = await OauthClient.all()
      return response.ok({
        success: true,
        message: 'Examples retrieved successfully.',
        data: examples,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to retrieve examples.',
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const oauthClient = await OauthClient.query().where('name', params.name).first()
      if (!oauthClient) {
        return response.notFound({
          success: false,
          message: 'Oauth client not found.',
        })
      }

      return response.ok({
        success: true,
        message: 'Oauth client retrieved successfully.',
        data: oauthClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Oauth client failed to retrieve.',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    const data = await vine
      .compile(OauthClientValidator.createSchema)
      .validate(request.all(), { messagesProvider })

    try {
      const generatedClientIds = new Set<string>()

      const clientId = generateUniqueClientId(10, generatedClientIds)
      const clientSecret = generateRandomString(16)
      const oauthClient = await OauthClient.create({
        ...data,
        client_id: clientId,
        client_secret: clientSecret,
      })
      return response.created({
        success: true,
        message: 'Oauth client created successfully.',
        data: oauthClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to create oauth client.',
        error: error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const data = await vine
      .compile(OauthClientValidator.createSchema)
      .validate(request.all(), { messagesProvider })

    try {
      const oauthClient = await OauthClient.query().where('name', params.name).first()
      if (!oauthClient) {
        return response.notFound({
          success: false,
          message: 'Oauth client not found.',
        })
      }

      await oauthClient.merge(data).save()
      return response.ok({
        success: true,
        message: 'Oauth client updated successfully.',
        data: oauthClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to update oauth client.',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const oauthClient = await OauthClient.query().where('name', params.name).first()
      if (!oauthClient) {
        return response.notFound({
          success: false,
          message: 'Oauth client not found.',
        })
      }

      await oauthClient.delete()
      return response.ok({
        success: true,
        message: 'Oauth client deleted successfully.',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to delete oauth client.',
        error: error.message,
      })
    }
  }
}
