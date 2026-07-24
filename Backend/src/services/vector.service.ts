import qdrant from "../config/qdrant";

export async function createCollection(vectorSize: number) {
    try {
        await qdrant.getCollection("notes");
        console.log("Collection already exists");
        return;
    } catch (error: any) {
        if (error.status === 404) {
            await qdrant.createCollection("notes", {
                vectors: {
                    size: vectorSize,
                    distance: "Cosine",
                },
            });
            console.log("Qdrant collection created");
        } else {
            throw error;
        }
    }
}

export async function storeVectors(
    documentId: string,
    chunks: string[],
    embeddings: number[][]
) {
    await qdrant.upsert("notes", {
        wait: true,
        points: chunks.map((chunk, index) => ({
            id: index + 1,

            vector: embeddings[index],

            payload: {
                documentId,
                chunkIndex: index,
                content: chunk,
            },
        })),
    });

    console.log("Vectors stored in Qdrant");

}