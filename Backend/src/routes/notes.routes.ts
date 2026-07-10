import { Hono } from "hono";
import { savePdf } from "../services/upload.service";
import { processPdf } from "../services/pdf-processing.service";
import { saveDocument } from "../services/document.service";
import { createCollection, storeVectors } from "../services/vector.service";
import { searchNotes } from "../services/search.service";
import { generateAnswer } from "../services/chat.service";


const notesRoutes = new Hono();

notesRoutes.post("/upload", async (c) => {
    try {

        console.log("Request received");

        const body = await c.req.parseBody();
        console.log("Body parsed");

        const file = body.file;

        if (!(file instanceof File)) {
            return c.json(
                {
                    success: false,
                    message: "No PDF uploaded",
                },
                400
            );
        }

        console.log("File received:", file.name);

        const filePath = await savePdf(file);
        console.log("1. PDF Saved");

        const { text, chunks, embeddings } = await processPdf(filePath);
        console.log("2. PDF Processed");

        const document = await saveDocument(
            file.name.replace(".pdf", ""),
            file.name,
            chunks
        );
        console.log("3. Document Saved");

        await createCollection(embeddings[0].length);
        console.log("4. Collection Created");

        await storeVectors(
            document.id,
            chunks,
            embeddings
        );
        console.log("5. Vectors Stored");

        return c.json({
            success: true,
            message: "PDF uploaded successfully",
            document,
            extractedCharacters: text.length,
            totalChunks: chunks.length,
        });

    } catch (err) {
        console.error("UPLOAD ERROR:", err);

        return c.json(
            {
                success: false,
                error: String(err),
            },
            500
        );
    }
});

notesRoutes.post("/search", async (c) => {

    const { query } = await c.req.json();

    if (!query) {
        return c.json(
            {
                success: false,
                message: "Query is required",
            },
            400
        );
    }

    const results = await searchNotes(query);

    const context = results
        .map((item: any) => item.payload?.content)
        .join("\n\n");

    const answer = await generateAnswer(query, context);

    return c.json({
        success: true,
        answer,
        results,
    });
});

export default notesRoutes;