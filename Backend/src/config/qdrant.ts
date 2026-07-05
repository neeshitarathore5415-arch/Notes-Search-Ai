import { QdrantClient } from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    checkCompatibility: false,
});

export default qdrant;