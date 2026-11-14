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

        return response.data.message.content[0].text;
    } catch (error) {
        throw error;
    }
}
