import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionIdExists(
  req: FastifyRequest,
  replay: FastifyReply
) {
  const { sessionId } = req.cookies;

  if (!sessionId) {
    replay.status(401).send({
      error: "Unauthorized",
    });
  }
}
