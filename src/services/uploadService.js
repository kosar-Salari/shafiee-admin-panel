import http from './http';

/**
 * Upload file to S3 via backend
 * @param {File} file - انتخاب‌شده توسط کاربر
 * @param {Object} [opts]
 * @param {string} [opts.folder]
 * @param {(n:number)=>void} [opts.onProgress]
 * @returns {Promise<string>} - URL فایل
 */
export async function uploadFile(file, { folder, onProgress } = {}) {
  const form = new FormData();
  form.append('file', file);
  if (folder) form.append('folder', folder);

  const res = await http.post('/admin/files/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        const percent = Math.round((evt.loaded * 100) / evt.total);
        onProgress(percent);
      }
    },
  });

  const data = res?.data ?? {};
  const url =
    data.url ||
    data.Location ||
    data.fileUrl ||
    data.data?.url ||
    data.data?.Location;

  if (!url) throw new Error('Upload succeeded but no URL returned');
  return url;
}
