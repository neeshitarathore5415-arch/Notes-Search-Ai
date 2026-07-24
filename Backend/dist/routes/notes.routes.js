"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const upload_service_1 = require("../services/upload.service");
const pdf_processing_service_1 = require("../services/pdf-processing.service");
const document_service_1 = require("../services/document.service");
const vector_service_1 = require("../services/vector.service");
const search_service_1 = require("../services/search.service");
const chat_service_1 = require("../services/chat.service");
const notesRoutes = new hono_1.Hono();
notesRoutes.post("/upload", async (c) => {
    try {
        console.log("Request received");
        const body = await c.req.parseBody();
        console.log("Body parsed");
        const file = body.file;
        if (!(file instanceof File)) {
            return c.json({
                success: false,
                message: "No PDF uploaded",
            }, 400);
        }
        console.log("File received:", file.name);
        const filePath = await (0, upload_service_1.savePdf)(file);
        console.log("1. PDF Saved");
        const { text, chunks, embeddings } = await (0, pdf_processing_service_1.processPdf)(filePath);
        console.log("2. PDF Processed");
        const document = await (0, document_service_1.saveDocument)(file.name.replace(".pdf", ""), file.name, chunks);
        console.log("3. Document Saved");
        await (0, vector_service_1.createCollection)(embeddings[0].length);
        console.log("4. Collection Created");
        await (0, vector_service_1.storeVectors)(document.id, chunks, embeddings);
        console.log("5. Vectors Stored");
        return c.json({
            success: true,
            message: "PDF uploaded successfully",
            document,
            extractedCharacters: text.length,
            totalChunks: chunks.length,
        });
    }
    catch (err) {
        console.error("UPLOAD ERROR:", err);
        return c.json({
            success: false,
            error: String(err),
        }, 500);
    }
});
notesRoutes.post("/search", async (c) => {
    const { query } = await c.req.json();
    if (!query) {
        return c.json({
            success: false,
            message: "Query is required",
        }, 400);
    }
    const results = await (0, search_service_1.searchNotes)(query);
    const context = results
        .map((item) => item.payload?.content)
        .join("\n\n");
    const answer = await (0, chat_service_1.generateAnswer)(query, context);
    return c.json({
        success: true,
        answer,
        results,
    });
});
exports.default = notesRoutes;
