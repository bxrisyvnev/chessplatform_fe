// services/articleUpdate.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getArticleById(articleId) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const res = await axios.get(`${API_URL}/articles/${articleId}`, {
        headers: {
            Authorization: `Bearer ${user?.token}`
        }
    });

    return res.data;
}

export async function updateArticle(dto) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    await axios.put(`${API_URL}/articles`, dto, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
        }
    });
}
