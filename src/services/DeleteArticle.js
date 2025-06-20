import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export async function deleteArticle(articleId) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.token) {
        console.warn('User not logged in or token missing.');
        return false;
    }

    try {
        await axios.delete(`${API_URL}/articles/${articleId}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        return true;
    } catch (err) {
        console.error('Error deleting article:', err);
        return false;
    }
}
