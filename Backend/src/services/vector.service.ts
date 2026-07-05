import qdrant from "../config/qdrant";

export async function createCollection(vectorSize: number) {
    const exists = await qdrant.collectionExists("notes");

    if (exists.exists) {
        console.log("Collection already exists");
        return;
    }

    await qdrant.createCollection("notes", {
        vectors: {
            size: vectorSize,
            distance: "Cosine",
        },
    });

    console.log("Qdrant collection created");
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