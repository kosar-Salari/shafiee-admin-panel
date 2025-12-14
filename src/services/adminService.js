// src/services/adminService.js
import http from './http';

// درآوردن لیست از ساختارهای مختلف ریسپانس
const unwrapList = (d) =>
  Array.isArray(d?.items) ? d.items :
  Array.isArray(d?.data?.items) ? d.data.items :
  Array.isArray(d?.data) ? d.data :
  Array.isArray(d) ? d :
  [];

// مپ‌کردن آبجکت API به مدل قابل استفاده در UI
function toUiAdmin(a = {}) {
  return {
    id: a.id ?? a._id ?? '',
    username: a.username ?? '',
    role: a.role ?? 'admin',
    createdAt:
      a.createdAt ??
      a.created_at ??
      a.updatedAt ??
      a.updated_at ??
      new Date().toISOString(),
  };
}

// ===============================
// لیست ادمین‌ها
// ===============================
export async function getAdmins() {
  try {
    const res = await http.get('/admin/manage-admins');
    const payload = res?.data;
    const list = unwrapList(payload);
    return list.map(toUiAdmin);
  } catch (error) {
    console.error('خطا در دریافت ادمین‌ها:', error.response?.data || error.message);
    throw error;
  }
}

// ===============================
// ایجاد ادمین جدید
// ===============================
export async function createAdmin({ username, password }) {
  try {
    const body = { username, password };
    console.log('ارسال به API (createAdmin):', body);

    const { data } = await http.post('/admin/manage-admins', body);
    return data;
  } catch (error) {
    console.error('خطا در ایجاد ادمین (جزئیات کامل):', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    throw {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    };
  }
}

// ===============================
// حذف ادمین
// ===============================
export async function deleteAdmin(id) {
  try {
    const { data } = await http.delete(`/admin/manage-admins/${id}`);
    return data ?? { ok: true };
  } catch (error) {
    console.error('خطا در حذف ادمین:', error.response?.data);
    throw error;
  }
}
