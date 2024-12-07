import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'oauth_clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('client_id').unique().notNullable()
      table.string('client_secret').notNullable()
      table.string('redirect_uri').notNullable()
      table.string('allowed_scopes').notNullable().defaultTo('openid profile email')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
