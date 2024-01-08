import fastify from "fastify";
import { userRoutes } from "./routes/usuario";
import {mealsRoutes } from "./routes/refeicoes"


export const app = fastify();

app.register(userRoutes, {
  prefix: "user",
});

app.register(mealsRoutes, {
  prefix: "meals",
});