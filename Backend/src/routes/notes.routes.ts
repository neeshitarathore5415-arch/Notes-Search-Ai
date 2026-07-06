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
        const body = await c.req.parseBody();

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

        console.log("1. File received");

        const filePath = await savePdf(file);
        console.log("2. File saved");

        const { text, chunks, embeddings } = await processPdf(filePath);
        console.log("3. PDF processed");

        const document = await saveDocument(
            file.name.replace(".pdf", ""),
            file.name,
            chunks
        );
        console.log("4. Saved to DB");

        await createCollection(embeddings[0].length);
        console.log("5. Collection ready");

        await storeVectors(document.id, chunks, embeddings);
        console.log("6. Vectors stored");

        return c.json({
            success: true,
        });

    } catch (err) {
        console.error(err);

        return c.json(
            {
                success: false,
                error: err instanceof Error ? err.message : "Unknown error",
            },
            500
        );
    }
});

export default notesRoutes;