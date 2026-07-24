"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePdf = savePdf;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
async function savePdf(file) {
    const uploadDir = node_path_1.default.join(process.cwd(), "uploads");
    await (0, promises_1.mkdir)(uploadDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = node_path_1.default.join(uploadDir, file.name);
    await (0, promises_1.writeFile)(filePath, buffer);
    console.log("Saved at:", filePath);
    return filePath;
}
