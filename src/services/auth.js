import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (username, password) => {
  try {
    console.log('Sending credentials:', { username, password });
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });

    const data = response.data;

    if (!data.accessToken || typeof data.accessToken !== 'string') {
      throw new Error('Invalid access token received from the API');
    }

    const decoded = jwtDecode(data.accessToken);
    const roles = decoded?.roles || [];
    const userId = decoded?.userId;

    const user = {
      token: data.accessToken,
      username,
      roles,
      userId
    };

    sessionStorage.setItem('user', JSON.stringify(user));

    return user;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred during login' };
  }
};

export const register = async ({ username, password, age, displayName, nationality }) => {
  try {
    console.log('Registering user:', { username, age, displayName, nationality });
    const response = await axios.post(`${API_URL}/register`, {
      updateId: 1,
      roles: "SPECTATOR_PLAYER",
      username,
      password,
      age,
      displayName,
      nationality,
      playerElo: 600,
      isChatBanned: false,
      isGameBanned: false,
      noOfGamesPlayed: 0,
      hasPass: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('An error occurred during registration');
  }
};

export const logout = () => {
  sessionStorage.removeItem('user');
};

// Get current user object from sessionStorage
export const getCurrentUser = () => {
  const userStr = sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return !!user?.token;
};

// Check if the user has a specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.roles?.includes(role);
};

// Setup Axios interceptor to include JWT token in headers
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
      (config) => {
        const user = getCurrentUser();
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
  );
};
