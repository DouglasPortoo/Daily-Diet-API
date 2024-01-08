import {knex as setupKnex} from "knex"

export const config = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection:{
    filename:"./db/app.db",
  },
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
}

export const knex = setupKnex(config)