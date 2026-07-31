"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkQdrantHealth = checkQdrantHealth;
const js_client_rest_1 = require("@qdrant/js-client-rest");
function normalizeQdrantUrl(rawUrl) {
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
const qdrant = new js_client_rest_1.QdrantClient({
    url: qdrantUrl,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false,
});
async function checkQdrantHealth() {
    console.log(`[Qdrant] Checking REST endpoint: ${qdrantUrl}`);
    try {
        const collections = await qdrant.getCollections();
        console.log("[Qdrant] getCollections() succeeded:", collections);
        return collections;
    }
    catch (error) {
        console.error("[Qdrant] getCollections() failed with full error:");
        console.error(error);
        throw error;
    }
}
exports.default = qdrant;
