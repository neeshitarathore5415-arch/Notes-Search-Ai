import { QdrantClient } from "@qdrant/js-client-rest";

function normalizeQdrantUrl(rawUrl: string | undefined) {
    if (!rawUrl) {
        throw new Error("QDRANT_URL is not set");
    }

    const url = new URL(rawUrl);

    return url.toString().replace(/\/$/, "");
}

const qdrantUrl = normalizeQdrantUrl(process.env.QDRANT_URL);

if (!process.env.QDRANT_API_KEY) {
    throw new Error("QDRANT_API_KEY is not set");
}

const qdrant = new QdrantClient({
    url: qdrantUrl,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false,
});

export async function checkQdrantHealth() {
    console.log(`[Qdrant] Checking REST endpoint: ${qdrantUrl}`);

    try {
        const collections = await qdrant.getCollections();
        console.log("[Qdrant] getCollections() succeeded:", collections);
        return collections;
    } catch (error) {
        console.error("[Qdrant] getCollections() failed with full error:");
        console.error(error);
        throw error;
    }
}

export default qdrant;
