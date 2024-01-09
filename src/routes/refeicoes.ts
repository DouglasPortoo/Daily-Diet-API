import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkSessionIdExists } from "../../middlewares/check-session-id-exists";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [checkSessionIdExists] }, async (req, replay) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    });

    const { name, description, isDiet } = createMealBodySchema.parse(req.body);

    const { sessionId } = req.cookies;
    const user = await knex("users").where("session_id", sessionId).first();

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      is_diet: isDiet,
      user_id: user.id,
    });

    return replay.status(201).send();
  });

  app.put("/:id", async (req, replay) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    });

    const queryParamsSchema = z.object({
      id: z.string(),
    });

    let { name, description, isDiet } = createMealBodySchema.parse(req.body);
    const { id } = queryParamsSchema.parse(req.query);

    const mealsExist = await knex("meals").where({ id }).first();

    if (!mealsExist) {
      return replay
        .status(422)
        .send("problema com os dados enviados na solicitação");
    }

    const { sessionId } = req.cookies;
    const user = await knex("users").where("session_id", sessionId).first();

    if(user.id !== mealsExist.user_id){
      return replay
        .status(422)
        .send("Voce nao pode edita uma refeição que nao é sua");
    }

    await knex("meals")
      .where("id", id)
      .update({
        name: name === "" ? mealsExist.name : name,
        description: description === "" ? mealsExist.description : description,
        is_diet: isDiet,
      });

    return replay
      .status(200)
      .send({
        name: name === "" ? mealsExist.name : name,
        description: description === "" ? mealsExist.description : description,
        isDiet,
      });
  });
}
