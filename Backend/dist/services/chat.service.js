"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnswer = generateAnswer;
const axios_1 = __importDefault(require("axios"));
const cohere_1 = __importDefault(require("../config/cohere"));
async function generateAnswer(query, context) {
    try {
        const response = await cohere_1.default.post("/chat", {
            model: "command-a-03-2025",
            messages: [
                {
                    role: "system",
                    content: "Answer only from the provided context. If the answer is not present, say you don't know.",
                },
                {
                    role: "user",
                    content: `Context:
                    
                    ${context}
                    
                    Question:
                    ${query}`,
                },
            ],
        }, {
            headers: {
                Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
            },
        });
        console.log(response.data);
        return response.data.message.content[0].text;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.log("Status:", error.response?.status);
            console.log("Data:", error.response?.data);
        }
        throw error;
    }
}
