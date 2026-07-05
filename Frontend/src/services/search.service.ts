import api from "../api/api";

export async function searchNotes(query: string) {
    const response = await api.post("/notes/search", {
        query,
    });

    return response.data;
}