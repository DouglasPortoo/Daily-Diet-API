import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("meals", function (table) {
    table.uuid("id").primary(); // Chave primária autoincrementável
    table.string("name").notNullable(); // Campo name, não pode ser nulo
    table.string("description"); // Descrição da refeição
    table.dateTime("datetime").defaultTo(knex.fn.now()).notNullable(); // Data e Hora da refeição
    table.boolean("is_diet").notNullable(); // Se está dentro da dieta ou não

    // Adicionando a coluna user_id como chave estrangeira
    table.integer("user_id").references("id").inTable("users");

    table.timestamps(true, true); // Adiciona campos created_at e updated_at automaticamente
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("meals");
}
