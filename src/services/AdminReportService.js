import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

function authHeaders() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    return {
        Authorization: `Bearer ${user?.token ?? ''}`,
        'Content-Type': 'application/json',
    };
}

export async function fetchReports(page = 0, size = 5) {
    const res = await axios.get(`${BASE}/reports`, {
        params: { page, size },
        headers: authHeaders(),
    });
    return res.data;
}

export async function removeReport(id) {
    await axios.delete(`${BASE}/reports/${id}`, { headers: authHeaders() });
}

export default { fetchReports, removeReport };
