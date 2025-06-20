import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * POST /reports
 *
 * @param {Object} reportDTO  CreateReportDTO-shaped payload:
 *   {
 *     updateId:    number | null,
 *     description: string | null,
 *     type:        string,
 *     dateTime:    string,   // ISO-8601
 *     userId:      number
 *   }
 *
 * @returns {Promise<any>}  response body on success; throws on error
 */
export const createReport = async (reportDTO) => {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = user?.token;

    if (!token) {
        console.error('createReport → No JWT token found in sessionStorage (user.token)');
        throw new Error('Not authenticated');
    }

    try {
        const res = await axios.post(`${API_URL}/reports`, reportDTO, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data; // adjust if your backend returns nothing/boolean
    } catch (err) {
        console.error('createReport → Failed to create report', err);
        throw err;
    }
};

export default { createReport };