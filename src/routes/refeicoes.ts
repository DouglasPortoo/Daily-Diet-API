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

    if (user.id !== mealsExist.user_id) {
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

    return replay.status(200).send({
      name: name === "" ? mealsExist.name : name,
      description: description === "" ? mealsExist.description : description,
      isDiet,
    });
  });

  app.delete("/:id", async (req, replay) => {
    const queryParamsSchema = z.object({
      id: z.string(),
    });

    const { id } = queryParamsSchema.parse(req.query);

    const mealsExist = await knex("meals").where({ id }).first();

    if (!mealsExist) {
      return replay
        .status(422)
        .send("problema com os dados enviados na solicitação");
    }

    const { sessionId } = req.cookies;
    const user = await knex("users").where("session_id", sessionId).first();

    if (user.id !== mealsExist.user_id) {
      return replay
        .status(422)
        .send("Voce nao pode edita uma refeição que nao é sua");
    }

    await knex("meals").where("id", id).del();

    return replay.status(204).send();
  });

  app.get("/:id", async (req, replay) => {
    const queryParamsSchema = z.object({
      id: z.string(),
    });

    const { id } = queryParamsSchema.parse(req.query);

    const mealsExist = await knex("meals").where({ id }).first();

    if (!mealsExist) {
      return replay
        .status(422)
        .send("problema com os dados enviados na solicitação");
    }

    const { sessionId } = req.cookies;
    const user = await knex("users").where("session_id", sessionId).first();

    if (user.id !== mealsExist.user_id) {
      return replay
        .status(422)
        .send("Voce nao pode edita uma refeição que nao é sua");
    }

    return replay.status(200).send(mealsExist);
  });

  app.get("/all", async (req, replay) => {
    const { sessionId } = req.cookies;
    const user = await knex("users").where("session_id", sessionId).first();

    if (!user) {
      return replay.status(404).send("Usuario nao encontrado");
    }

    const meals = await knex("meals").where({ user_id: user.id });

    return replay.status(200).send(meals);
  });

  app.get("/metrics", async (req, replay) => {
    const { sessionId } = req.cookies;
    const user = await knex("users").where("session_id", sessionId).first();


    const { total_refeicoes } = await knex("meals")
      .count("* as total_refeicoes")
      .where({ user_id: user.id })
      .first();

    const { refeicoes_dentro_dieta } = await knex("meals")
      .count("* as refeicoes_dentro_dieta")
      .where({ user_id: user.id, is_diet: true })
      .first();

    const { refeicoes_fora_dieta } = await knex("meals")
      .count("* as refeicoes_fora_dieta")
      .where({ user_id: user.id, is_diet: false })
      .first();

    const refeicoes = await knex("meals").where({ user_id: user.id });

    let maxSequencia = 0;
    let sequenciaAtual = 0;

    for (const refeicao of refeicoes) {
      if (refeicao.is_diet) {
        sequenciaAtual++;
        if (sequenciaAtual > maxSequencia) {
          maxSequencia = sequenciaAtual;
        }
      } else {
        sequenciaAtual = 0;
      }
    }

    const result = {
      totalRefeicoes: total_refeicoes,
      refeicoesDentroDieta: refeicoes_dentro_dieta,
      refeicoesForaDieta: refeicoes_fora_dieta,
      melhorSequencia: maxSequencia,
    };

    return replay.status(200).send(result);
  });
}
