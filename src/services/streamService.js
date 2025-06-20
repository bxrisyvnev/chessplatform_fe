import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export async function getStreamById(streamId) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const response = await axios.get(`${API_URL}/streams/${streamId}`, {
        headers: {
            Authorization: `Bearer ${user?.token}`
        }
    });

    return response.data;
}

export async function startStream(name, embedCode) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const dto = {
        updateId: 1,
        name: name,
        creationDateTime: new Date().toISOString(),
        streamUrl: embedCode,
        streamerId: user?.userId
    };

    const response = await axios.post(`${API_URL}/streams`, dto, {
        headers: {
            Authorization: `Bearer ${user?.token}`
        }
    });

    return response.data.id;
}

export async function stopStream(streamId) {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    await axios.delete(`${API_URL}/streams/${streamId}`, {
        headers: {
            Authorization: `Bearer ${user?.token}`
        }
    });
}