const OauthClientsController = () => import('#controllers/oauth_clients_controller')
import router from '@adonisjs/core/services/router'

export default function oauthClientsRoute() {
  router
    .group(() => {
      router.get('/', [OauthClientsController, 'index'])
      router.post('/', [OauthClientsController, 'store'])
      router.get('/:name', [OauthClientsController, 'show'])
    })
    .prefix('/oauth/clients')
}
