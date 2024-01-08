import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkSessionIdExists } from "../../middlewares/check-session-id-exists";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [checkSessionIdExists] }, async (req,replay) => {
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
}
