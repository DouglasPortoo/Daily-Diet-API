import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", function (table) {
    table.uuid("id").primary();
    table.string("name").notNullable(); // Campo name, não pode ser nulo
    table.string("email").notNullable().unique(); // Campo email, não pode ser nulo e deve ser único
    table.string("password").notNullable(); // Campo password, não pode ser nulo
    // Outros campos necessários podem ser adicionados aqui
    // Exemplo: table.string('avatar_url');

    table.timestamps(true, true); // Adiciona campos created_at e updated_at automaticamente
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users"); // Reverte a criação da tabela se for necessário fazer rollback
}
