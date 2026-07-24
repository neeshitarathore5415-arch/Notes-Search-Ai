"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPdf = processPdf;
const pdf_service_1 = require("./pdf.service");
const chunk_service_1 = require("./chunk.service");
const embedding_service_1 = require("./embedding.service");
async function processPdf(filePath) {
    // Extract text from uploaded PDF
    const text = await (0, pdf_service_1.extractPdfText)(filePath);
    console.log("========== EXTRACTED TEXT ==========");
    console.log(text.substring(0, 2000));
    // Split extracted text into chunks
    const chunks = (0, chunk_service_1.chunkText)(text);
    console.log("========== FIRST 10 CHUNKS ==========");
    console.log(chunks.slice(0, 10));
    // Generate embeddings
    const embeddings = await (0, embedding_service_1.generateEmbeddings)(chunks);
    console.log("Total Embeddings:", embeddings.length);
    console.log("Vector Size:", embeddings[0].length);
    return {
        text,
        chunks,
        embeddings,
    };
}
