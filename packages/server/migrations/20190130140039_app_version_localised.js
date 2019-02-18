const { AppStatus, AppType } = require('../src/enums')

exports.up = async knex => {
    
    await knex.schema.createTable('app_version_localised', table => {
        table
            .increments('id')
            .unsigned()
            .primary()

        table.integer('app_version_id').unsigned()

        table
            .foreign('app_version_id')
            .references('id')
            .inTable('app_version')

        table.string('language_code', 2)

        table.string('name', 100).notNullable()

        table.text('description')

        table.string('slug', 150).notNullable()

        //One version can only have the same language once.
        table.unique(['app_version_id', 'language_code'])

        table
            .timestamp('created_at', true)
            .defaultTo(knex.fn.now())
            .notNullable()

        table
            .integer('created_by_user_id')
            .unsigned()
            .notNullable()

        table
            .foreign('created_by_user_id')
            .references('id')
            .inTable('user')
    })


}

exports.down = async knex => {
    await knex.schema.dropTable('app_version_localised')
    
}
