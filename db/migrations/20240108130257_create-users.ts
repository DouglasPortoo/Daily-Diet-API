import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table)=> {
    table.uuid("id").primary();
    table.string("name").notNullable(); // Campo name, não pode ser nulo
    table.string("email").notNullable(); // Campo email, não pode ser nulo
    table.string("password").notNullable(); // Campo password, não pode ser nulo
    table.uuid('session_id');

    table.timestamps(true, true); 
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users"); // Reverte a criação da tabela se for necessário fazer rollback
}
