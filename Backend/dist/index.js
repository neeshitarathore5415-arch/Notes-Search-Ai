"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
const cors_1 = require("hono/cors");
const prisma_1 = __importDefault(require("./config/prisma"));
const notes_routes_1 = __importDefault(require("./routes/notes.routes"));
const app = new hono_1.Hono();
app.use("*", (0, cors_1.cors)({
    origin: "*",
}));
app.get("/", async (c) => {
    const count = await prisma_1.default.document.count();
    return c.json({
        success: true,
        totalDocuments: count,
        message: "Notes Search Assistant API is running",
    });
});
app.route("/notes", notes_routes_1.default);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: 5000,
});
console.log("Server is running on 5000");
