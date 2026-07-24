"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = createCollection;
exports.storeVectors = storeVectors;
const qdrant_1 = __importDefault(require("../config/qdrant"));
async function createCollection(vectorSize) {
    const exists = await qdrant_1.default.collectionExists("notes");
    if (exists.exists) {
        console.log("Collection already exists");
        return;
    }
    await qdrant_1.default.createCollection("notes", {
        vectors: {
            size: vectorSize,
            distance: "Cosine",
        },
    });
    console.log("Qdrant collection created");
}
async function storeVectors(documentId, chunks, embeddings) {
    await qdrant_1.default.upsert("notes", {
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
