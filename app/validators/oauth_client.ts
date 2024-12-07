import vine from '@vinejs/vine'

export default class OauthClientValidator {
  static createSchema = vine.object({
    name: vine.string(),
    redirect_uri: vine.string(),
  })
}
