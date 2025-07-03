import axios, { AxiosRequestConfig } from 'axios';
import { User } from '@/types/User';
import { createUnauthorizedEvent } from './Events';
import { RefreshResponse } from '@/types/RefreshResponse';

const axiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Attach a JWT access token stored in local storage to authorization header.
 * If token is not present, emit an event signaling that user should authenticate again.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      window.dispatchEvent(createUnauthorizedEvent());
      return config;
    }

    try {
      const user: User = JSON.parse(userString);
      config.headers.Authorization = `Bearer ${user.token}`;
    } catch (e) {
      console.error(e);
      window.dispatchEvent(createUnauthorizedEvent());
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Intercept any 401 Unauthorized responses. Keep a queue of rejected requests
 * waiting for a refresh of the access token to prevent race conditions.
 * On successful refresh, retry original requests.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest.isRetry) {
      // mark any failed request as a retry
      originalRequest.isRetry = true;

      // if already refreshing a token, add request to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject, config: originalRequest });
        });
      }
      isRefreshing = true;

      try {
        // retrieve refresh token from storage
        const userString = localStorage.getItem('user');
        if (!userString) {
          window.dispatchEvent(createUnauthorizedEvent());
          processQueue(error);
          return Promise.reject(error);
        }
        const user: User = JSON.parse(userString);

        // get a new pair of access and refresh token
        const { data } = await axios.post<RefreshResponse>('Auth/Refresh', {
          token: user.refreshToken,
        });

        // prevent overriding refresh token in development environment
        if (data.refreshToken) {
          console.log(`new token: ${data.refreshToken}`);
          user.refreshToken = data.refreshToken;
          user.token = data.token;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // process all the requests waiting in the queue
        // as well as the first that triggered the refresh
        processQueue();
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error(refreshError);
        window.dispatchEvent(createUnauthorizedEvent());
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (error.response.status === 401) {
      window.dispatchEvent(createUnauthorizedEvent());
    }
    return Promise.reject(error);
  }
);

// A guard and a queue of requests waiting for token refresh.
let isRefreshing = false;
let requestQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}> = [];

/**
 * Process the queue of requests waiting on the refresh of access token.
 * If error is supplied, then the promise will fail.
 */
const processQueue = (error: unknown = null) => {
  requestQueue.forEach((req) => {
    if (error) {
      req.reject(error);
      return;
    }
    req.resolve(axiosInstance(req.config));
  });
  requestQueue = [];
};

export default axiosInstance;
