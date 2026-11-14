import axios from "axios";

const api = axios.create({
    baseURL:
        process.env.NODE_ENV === "development"
            ? "http://localhost:5000"
            : "https://notes-search-ai.onrender.com",
});

export default api;
