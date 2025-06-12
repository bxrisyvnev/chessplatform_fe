import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function createArticle({ articleTitle, imageUrl, contentText, authorId }) {
    const payload = {
        articleTitle,
        imageUrl,
        contentText,
    };

    // Only add authorId if it's present
    if (authorId !== null && authorId !== undefined) {
        payload.authorId = authorId;
    }

    const response = await axios.post(`${API_URL}/articles`, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.data;
}