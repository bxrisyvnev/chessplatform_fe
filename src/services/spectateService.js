import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function fetchStreams(page = 0, size = 5) {
    const response = await axios.get(`${API_URL}/spectate?page=${page}&size=${size}`);
    return response.data;
}