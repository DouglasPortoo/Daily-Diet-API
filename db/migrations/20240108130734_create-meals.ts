import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("meals", function (table) {
    table.uuid("id").primary();
    table.string("name").notNullable(); // Campo name, não pode ser nulo
    table.text("description"); // Descrição da refeição
    table.dateTime("datetime").notNullable(); // Data e Hora da refeição
    table.boolean("is_diet").notNullable(); // Se está dentro da dieta ou não

    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("id").inTable("users"); // Define a chave estrangeira referenciando a tabela users

    table.timestamps(true, true); // Adiciona campos created_at e updated_at automaticamente
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("meals"); // Reverte a criação da tabela se for necessário fazer rollback
}
