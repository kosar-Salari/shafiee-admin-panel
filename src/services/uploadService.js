
import http from './http';


export function extractToken(data) {
  if (!data) return '';
  return (
    data.token ||
    data.accessToken ||
    data.jwt ||
    (typeof data === 'string' ? data : '')
  );
}

/**
 * Upload file to S3 via backend
 * @param {File} file
 * @param {{ folder?: string, onProgress?: (n:number)=>void }} [opts]
 * @returns {Promise<string>} - public URL
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

/* ──────────────────────────────────────────────────────────────
   Auth (در صورت نیاز)
────────────────────────────────────────────────────────────── */
export async function apiRegister({ username, password }) {
  const res = await http.post('/admin/register', { username, password });
  return res.data;
}
export async function apiLogin({ username, password }) {
  const res = await http.post('/admin/login', { username, password });
  return res.data;
}
export async function apiValidate() {
  const res = await http.get('/admin/validate');
  return res.data;
}
