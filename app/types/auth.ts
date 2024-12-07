export interface JWTConfig {
  secret: string
  algorithm: 'RS256'
  issuer: string
  maxAge: string
}

export interface TokenProviderContract {
  create(user: any, scopes: string[], options?: any): Promise<TokenResponse>
  verify(token: string): Promise<VerifyResponse | null>
}

export interface TokenResponse {
  type: 'bearer'
  value: {
    access_token: string
    id_token: string
    token_type: 'Bearer'
    expires_in: number
    scope: string
  }
  expiresAt: string
}

export interface VerifyResponse {
  user: any
  token: {
    value: string
    type: 'bearer'
    meta: any
  }
}

export interface OpenIDClaims {
  sub: string
  email: string
  email_verified: boolean
  auth_time: number
  nonce?: string
}
