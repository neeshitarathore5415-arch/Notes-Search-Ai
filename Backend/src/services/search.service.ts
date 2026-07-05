import { generateEmbeddings } from "./embedding.service";
import qdrant from "../config/qdrant";

export async function searchNotes(query: string) {

    // Generate embedding for user's question
    const embeddings = await generateEmbeddings([query]);

    const queryVector = embeddings[0];

    const result = await qdrant.search("notes", {
        vector: queryVector,
        limit: 5,
    });

    return result;
}