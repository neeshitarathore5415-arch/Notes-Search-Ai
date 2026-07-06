import axios from "axios";

const api = axios.create({
    baseURL: "https://notes-search-ai.onrender.com",
});

export default api;