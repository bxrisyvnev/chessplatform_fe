import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export async function submitComment(commentText, articleId) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.userId || !user.token) {
        console.warn('User not logged in or token missing.');
        return false;
    }

    const dto = {
        text: commentText,
        userId: user.userId,
        articleId: articleId
    };

    try {
        await axios.post(`${API_URL}/comments`, dto, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        });
        return true;
    } catch (err) {
        console.error('Error posting comment:', err);
        return false;
    }
}

export async function fetchCommentsByArticleId(articleId) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.token) {
        console.warn('User not logged in or token missing.');
        return [];
    }

    try {
        const response = await axios.get(`${API_URL}/comments/${articleId}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        return response.data;
    } catch (err) {
        console.error('Error fetching comments:', err);
        return [];
    }
}

export async function deleteComment(commentId) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.token) {
        console.warn('User not logged in or token missing.');
        return false;
    }

    try {
        await axios.delete(`${API_URL}/comments/${commentId}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        return true;
    } catch (err) {
        console.error('Error deleting comment:', err);
        return false;
    }
}
