// src/services/searchArticle.js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches a paginated list of articles filtered by title.
 * Uses token-based auth via Authorization header.
 * @param {string} title - The search term for article titles.
 * @param {number} page - Zero-based page index.
 * @param {number} size - Number of items per page.
 * @returns {{ articles: Array, currentPage: number, totalItems: number, totalPages: number }}
 */
export async function searchArticleByTitle(title, page = 0, size = 5) {

    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = user?.token;

    try {
        const response = await axios.get(`${API_URL}/searchbar`, {
            params: { title, page, size },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data;
    } catch (error) {
        console.error('Error searching articles:', error);
        if (error.response) {
            throw new Error(`Search failed: ${error.response.status} ${error.response.statusText}`);
        }
        throw error;
    }
}