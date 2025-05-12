import axios from 'axios';
import { User } from './types/User';

const axiosInstance = axios.create({
  headers: { 'content-type': 'application/json' },
});

interface RefreshToken {
  token: string;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest.isRetry) {
      originalRequest.isRetry = true;
      try {
        // if !user ??
        const user: User = JSON.parse(localStorage.getItem('user') || '');
        const refreshToken: RefreshToken = { token: user?.refreshToken };
        if (!refreshToken) return Promise.reject(error);
        const refreshResponse = await axios.post('Auth/Refresh', refreshToken);
        const newToken = refreshResponse.data;

        // prevent overriding refresh token in development environment
        // because StrictMode sends refresh request twice
        // and one of them can fail and return empty string
        if (newToken.refreshToken) {
          console.log(`new token: ${newToken.refreshToken}`);
          user.refreshToken = newToken.refreshToken;
          localStorage.setItem('user', JSON.stringify(user));
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log(refreshError);
        // logout? nav?
        return Promise.reject(refreshError);
      }
    }
    // logout? nav to login?
    return Promise.reject(error);
  }
);

export default axiosInstance;
