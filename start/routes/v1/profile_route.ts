const UserProfileController = () => import('#controllers/user_profiles_controller')
import router from '@adonisjs/core/services/router'

export default function userProfileRoute() {
  router
    .group(() => {
      router.post('/', [UserProfileController, 'store'])
    })
    .prefix('/user_profiles')
}
