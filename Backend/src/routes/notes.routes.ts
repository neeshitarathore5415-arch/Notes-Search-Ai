import { Hono } from "hono";
import { savePdf } from "../services/upload.service";
import { processPdf } from "../services/pdf-processing.service";
import { saveDocument } from "../services/document.service";
import { createCollection, storeVectors } from "../services/vector.service";
import { searchNotes } from "../services/search.service";
import { generateAnswer } from "../services/chat.service";


const notesRoutes = new Hono();

notesRoutes.post("/upload", async (c) => {
    // Parse multipart/form-data request ------------------
    const body = await c.req.parseBody();

    const file = body.file;

    // Validate uploaded file --------------------
    if (!(file instanceof File)) {
        return c.json(
            {
                success: false,
                message: "No PDF uploaded",
            },
            400
        );
    }

    // Build file path inside uploads directory -------------
    const filePath = await savePdf(file);


    const { text, chunks, embeddings } = await processPdf(filePath);

    const document = await saveDocument(
        file.name.replace(".pdf", ""),
        file.name,
        chunks
    );

    await createCollection(embeddings[0].length);

    await storeVectors(
        document.id,
        chunks,
        embeddings
    );

    return c.json({
        success: true,
        message: "PDF uploaded successfully",
        document,
        extractedCharacters: text.length,
        totalChunks: chunks.length
    });
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
    .map((item) => item.payload?.content)
    .join("\n\n");


    const answer = await generateAnswer(
        query,
        context
    );

    return c.json({
        success: true,
        message: "Search endpoint working",
        answer,
        results,
    });
});

export default notesRoutes;