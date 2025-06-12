import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Fetches the 5 latest OfficialNews items from the back-end.
 *
 * @returns {Promise<OfficialNews[]>} array of { title, link, description, author, publishedDate }
 * @throws {string} error message if not authenticated or fetch fails
 */
export async function fetchLatestNews() {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = user?.token;

    try {
        console.log('→ Fetching latest news');
        const response = await axios.get(`${API_URL}/chess`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        console.log('← News received:', response.data);
        return response.data;
    } catch (err) {
        console.error('Failed to fetch news:', err);
        // try to pull a backend message, otherwise generic
        throw (
            err.response?.data?.message ||
            'Please log in as Admin to view Official News'
        );
    }
}

/**
 * Sends the selected news items to the back-end to create them.
 *
 * Request DTO expects an array of objects:
 * { title, link, publishedDate, description, author }
 *
 * @param {OfficialNews[]} newsItems
 * @returns {Promise<any>}
 * @throws {string}
 */
export async function createNews(newsItems) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = user?.token;

    try {
        console.log('→ Creating news:', newsItems);
        const response = await axios.post(
            `${API_URL}/news`,
            newsItems,
            {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }
        );
        console.log('← Create response:', response.data);
        return response.data;
    } catch (err) {
        console.error('Failed to create news:', err);
        throw (
            err.response?.data?.message ||
            'Failed to create news — please try again.'
        );
    }
}

export async function fetchOfficialNews(page = 0, size = 5) {
    const userStr = sessionStorage.getItem('user');
    const user    = userStr ? JSON.parse(userStr) : null;
    const token   = user?.token;

    try {
        console.log(`→ [newsService] GET /api/news?page=${page}&size=${size}`);
        const resp = await axios.get(`${API_URL}/news`, {
            params: { page, size },
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        console.log('← [newsService] raw resp.data:', resp.data);

        const data = resp.data || {};
        // Prefer 'officialNews' key, then fallback to 'content' if provided
        const content = Array.isArray(data.officialNews)
            ? data.officialNews
            : Array.isArray(data.content)
                ? data.content
                : [];

        return {
            content,
            totalPages: data.totalPages ?? data.total_pages ?? 0,
            totalItems: data.totalItems ?? data.total_items ?? 0,
            currentPage: data.currentPage ?? data.page ?? page,
        };
    } catch (err) {
        console.error('❌ [newsService] fetchOfficialNews failed:', err);
        throw err.response?.data?.message || 'Error fetching Official News';
    }
}
