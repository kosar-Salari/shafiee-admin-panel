// src/services/filesService.js
import http from './http';

export async function uploadFileToS3(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await http.post('/admin/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },

    // ⏱ تایم‌اوت بزرگ برای فایل‌های حجیم (۱۰ دقیقه)
    timeout: 10 * 60 * 1000,

    // 📊 نمایش درصد پیشرفت آپلود
    onUploadProgress: (event) => {
      if (!onProgress) return;

      if (event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    }
  });

  return data.url || data.location || data.fileUrl;
}
