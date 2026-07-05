import axios from "axios";
import api from "../config/cohere";

export async function generateAnswer(
    query: string,
    context: string
) {
    try {

        const response = await api.post(
            "/chat",
            {
                model: "command-a-03-2025",

                messages: [
                    {
                        role: "system",
                        content:
                            "Answer only from the provided context. If the answer is not present, say you don't know.",
                    },
                    {
                        role: "user",
                        content: `Context:
                    
                    ${context}
                    
                    Question:
                    ${query}`,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
                },
            }
        );

        console.log(response.data);

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log("Status:", error.response?.status);
            console.log("Data:", error.response?.data);
        }

        throw error;
    }
}