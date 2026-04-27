import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getLoginRedirectUrl } from '@/utils/redirectUrl';

const BASE_URL = process.env.NEXT_PUBLIC_TRADING_JOURNAL_SERVER;
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL; // http://localhost:8080

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const authAxiosInstance = axios.create({
  baseURL: AUTH_URL,
  withCredentials: true,
});

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add interceptors to both instances
[axiosInstance, authAxiosInstance].forEach(instance => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => instance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axiosInstance.post('/api/v1/auth/refresh-token?redirectTo=/dashboard');
        
        if (response.data.success) {
          processQueue(null, response.data.data.token);
          return instance(originalRequest);
        } else {
          processQueue(new Error('Refresh failed'), null);
          window.location.href = getLoginRedirectUrl();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        window.location.href = getLoginRedirectUrl();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
});
