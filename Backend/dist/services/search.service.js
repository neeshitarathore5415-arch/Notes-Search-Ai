"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNotes = searchNotes;
const embedding_service_1 = require("./embedding.service");
const qdrant_1 = __importDefault(require("../config/qdrant"));
async function searchNotes(query) {
    // Generate embedding for user's question
    const embeddings = await (0, embedding_service_1.generateEmbeddings)([query]);
    const queryVector = embeddings[0];
    const result = await qdrant_1.default.search("notes", {
        vector: queryVector,
        limit: 5,
    });
    return result;
}
