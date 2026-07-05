import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import prisma from "./config/prisma";
import notesRoutes from "./routes/notes.routes";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: "*",
    })
);

app.get("/", async (c) => {
    const count = await prisma.document.count();

    return c.json({
        success: true,
        totalDocuments: count,
        message: "Notes Search Assistant API is running",
    });
});

app.route("/notes", notesRoutes);

serve({
    fetch: app.fetch,
    port: 5000,
});

console.log("Server is running on 5000");