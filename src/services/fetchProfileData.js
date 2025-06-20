import axios from 'axios';
import { getCurrentUser } from './auth';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchUserProfileWithComments = async () => {
    const user = getCurrentUser();
    if (!user || !user.token) throw new Error('User not authenticated');

    const response = await axios.get(`${API_URL}/users/profile/${user.username}`, {
        headers: {
            Authorization: `Bearer ${user.token}`
        }
    });

    return response.data;
};