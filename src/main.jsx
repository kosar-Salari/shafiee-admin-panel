import React from 'react';
import ReactDOM from 'react-dom/client';  // از react-dom/client استفاده کنید
import App from './App';
import './index.css';  // استایل‌های عمومی پروژه
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// ساخت یک تم پیش‌فرض (اختیاری)
const theme = createTheme({
  palette: {
    mode: 'light', // یا 'dark' برای تم تاریک
  },
});

// استفاده از createRoot برای رندر کردن اپ
const root = ReactDOM.createRoot(document.getElementById('root')); // اینجا تغییر دهید
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />  {/* برای ریست کردن استایل‌ها */}
    <App />
  </ThemeProvider>
);
