import fastifyCookie from "@fastify/cookie";
import { app } from "./app";

app.register(fastifyCookie)

app.listen({
  port:3333
}).then(()=>{
  console.log("Rodando....")
})