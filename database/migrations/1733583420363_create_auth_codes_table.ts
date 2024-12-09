import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_codes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code').notNullable()
      table.string('client_id').unsigned().references('oauth_clients.client_id')
      table.integer('user_id').unsigned().references('users.id')
      table.string('nonce').nullable()
      table.string('state').nullable()
      table.string('scopes').notNullable().defaultTo('openid,profile,email')
      table.string('redirect_uri').notNullable()
      table.timestamp('expires_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
