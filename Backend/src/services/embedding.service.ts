
import api from "../config/cohere";

export async function generateEmbeddings(texts: string[]) {
    const batchSize = 96;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        const response = await api.post(
            "/embed",
            {
                texts: batch,
                model: "embed-english-v3.0",
                input_type: "search_document",
                embedding_types: ["float"],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
                },
            }
        );

        allEmbeddings.push(...response.data.embeddings.float);
    }

    return allEmbeddings;
}