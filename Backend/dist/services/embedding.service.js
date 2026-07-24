"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbeddings = generateEmbeddings;
const cohere_1 = __importDefault(require("../config/cohere"));
async function generateEmbeddings(texts) {
    const batchSize = 96;
    const allEmbeddings = [];
    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const response = await cohere_1.default.post("/embed", {
            texts: batch,
            model: "embed-english-v3.0",
            input_type: "search_document",
            embedding_types: ["float"],
        }, {
            headers: {
                Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
            },
        });
        allEmbeddings.push(...response.data.embeddings.float);
    }
    return allEmbeddings;
}
