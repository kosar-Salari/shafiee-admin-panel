import http from './http';
export async function getSettings() {
  console.log('%c[API] GET /admin/settings/', 'color:#2563eb;font-weight:700;');
  try {
    const res = await http.get('/admin/settings/');
    console.log('%c✅ [API OK] /admin/settings', 'color:green;font-weight:700;', res.status, res.data);
    // بک‌اندت همان فرمت داخل data برمی‌گرداند
    return res.data?.data || {};
  } catch (err) {
    console.error('%c❌ [API ERR] /admin/settings', 'color:red;font-weight:700;', err?.response?.status, err?.response?.data || err);
    throw err;
  }
}

export async function updateSettings(payload) {
  console.groupCollapsed('%c[API] PATCH /admin/settings/', 'color:#2563eb;font-weight:700;');
  console.log('📦 Payload ready to send:', payload);
  console.groupEnd();
  try {
    const res = await http.patch('/admin/settings/', payload);
    console.log('%c✅ [API OK] /admin/settings', 'color:green;font-weight:700;', res.status, res.data);
    return res.data;
  } catch (err) {
    console.error('%c❌ [API ERR] /admin/settings', 'color:red;font-weight:700;', err?.response?.status, err?.response?.data || err);
    throw err;
  }
}