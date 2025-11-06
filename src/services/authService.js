import http from './http';

// خروجی‌های واقعی بک‌اند ممکنه فرق کنه؛ اینجا چند حالت پوشش داده میشه
function extractToken(data) {
  if (!data) return '';
  return (
    data.token ||
    data.accessToken ||
    data.jwt ||
    (typeof data === 'string' ? data : '')
  );
}

export async function apiRegister({ username, password }) {
  const res = await http.post('/admin/register', { username, password });
  return res.data;
}

export async function apiLogin({ username, password }) {
  const res = await http.post('/admin/login', { username, password });
  return res.data; // انتظار: { token: '...' } یا مشابه
}

export async function apiValidate() {
  const res = await http.get('/admin/validate');
  return res.data; // OK یا اطلاعات ادمین
}

// در صورت نیاز از بیرون هم می‌تونی استفاده کنی
export { extractToken };
