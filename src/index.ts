import { Elysia } from "elysia";
import authRoutes from "./routes/auth.routes";
import prisma from "./utils/prisma";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(authRoutes)
  .get("/", () => "Hello Elysia")
  .get("/api", async () => {
    const posts = await prisma.post.findMany();
    return { posts: posts, message: "Hello from the API!" };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
