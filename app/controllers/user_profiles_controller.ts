import type { HttpContext } from '@adonisjs/core/http'
import UserProfile from '#models/user_profile'
import vine from '@vinejs/vine'
import UserProfileValidator from '#validators/user_profile'
import messagesProvider from '#helpers/validation_messages_provider'

export default class UserProfilesController {
  async store({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const userId = user.id

    const data = await vine
      .compile(UserProfileValidator.createSchema)
      .validate(request.all(), { messagesProvider })

    const profile = await UserProfile.create({
      user_id: Number(userId),
      ...data,
    })

    return response.ok({
      success: true,
      message: 'Profile created successfully.',
      data: profile,
    })
  }
}
