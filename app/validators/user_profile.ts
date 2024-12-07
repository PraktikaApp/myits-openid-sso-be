import vine from '@vinejs/vine'

export default class UserProfileValidator {
  static createSchema = vine.object({
    myits_id: vine.string(),
    full_name: vine.string(),
    profile_picture: vine.string(),
    redirect_uri: vine.string(),
  })
}
