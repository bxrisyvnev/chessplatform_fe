import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchLatestArticles(page = 0, size = 5) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = user?.token;

    try {
        console.log("→ Fetching page:", page, "with size:", size);

        const response = await axios.get(`${API_URL}/articles`, {
            params: { page, size },
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Failed to fetch articles:", error);
        throw error.response?.data?.message || "Please log in to view Articles";
    }
}
