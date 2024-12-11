const OauthController = () => import('#controllers/oauth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

export default function oauthRoute() {
  router
    .group(() => {
      router.post('/authorize', [OauthController, 'authorize'])
      router.post('/token', [OauthController, 'token'])
      router
        .group(() => {
          router.get('/user', [OauthController, 'me'])
        })
        .middleware(middleware.auth({ guards: ['jwt'] }))
    })
    .prefix('/oauth')
}
