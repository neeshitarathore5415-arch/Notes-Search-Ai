"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPdfText = extractPdfText;
const promises_1 = __importDefault(require("node:fs/promises"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
async function extractPdfText(filePath) {
    const dataBuffer = await promises_1.default.readFile(filePath);
    const data = await (0, pdf_parse_1.default)(dataBuffer);
    return data.text;
}
