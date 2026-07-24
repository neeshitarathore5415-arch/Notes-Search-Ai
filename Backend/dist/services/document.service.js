"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDocument = saveDocument;
const prisma_1 = __importDefault(require("../config/prisma"));
async function saveDocument(title, filename, chunks) {
    // Store document metadata
    const document = await prisma_1.default.document.create({
        data: {
            title,
            filename,
        },
    });
    await prisma_1.default.chunk.createMany({
        data: chunks.map((chunk, index) => ({
            content: chunk,
            chunkIndex: index,
            documentId: document.id,
        })),
    });
    return document;
}
