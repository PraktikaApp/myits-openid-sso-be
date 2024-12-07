const OauthController = () => import('#controllers/oauth_controller')
import router from '@adonisjs/core/services/router'

export default function oauthRoute() {
  router
    .group(() => {
      router.post('/authorize', [OauthController, 'authorize'])
      router.post('/token', [OauthController, 'token'])
    })
    .prefix('/oauth')
}
