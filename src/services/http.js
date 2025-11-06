import axios from 'axios';
import { getToken, clearToken } from '../utils/auth';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// === Auth header از localStorage
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // اگر سمت سرور Bearer نمی‌خواهد، همون توکن خام رو بفرست:
    // config.headers.Authorization = token;
    config.headers.Authorization = token.startsWith('Bearer ')
      ? token
      : `Bearer ${token}`;
  }
  return config;
});

// === مدیریت خطاهای عمومی
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // توکن نامعتبر/منقضی
      clearToken();
      // اجازه بده کامپوننت‌ها خودشون ریدایرکت کنن
    }
    return Promise.reject(err);
  }
);

export default http;
