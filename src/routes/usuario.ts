import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto from "node:crypto";
import { knex } from "../database";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", async (req, replay) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    });

    const { name, email, password } = createUserBodySchema.parse(req.body);

    const userExist = await knex("users").where("email", email).first();

    let sessionId = randomUUID();

    replay.cookie("sessionId", sessionId, {
      path: "/",
      maxAge: 1000 * 60 * 30, // 30 minutos
    });

    if (!userExist) {
      const hash = crypto.createHash("sha256").update(password).digest("hex");

      await knex("users").insert({
        id: randomUUID(),
        name,
        email,
        password: hash,
        session_id: sessionId,
      });

      return { name, email, password };
    } else {
      const newSessionId = (userExist.session_id = sessionId);
      await knex("users").where("id", userExist.id).update("session_id", newSessionId);
    }
  });
}
