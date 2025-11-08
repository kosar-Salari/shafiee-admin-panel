// src/services/newsCategoriesService.js
import http from './http';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? [];
}

// اگر ورودی تبدیل شد به عدد معتبر، برگردان؛ وگرنه undefined
function toNum(val) {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

// GET /admin/manage-categories/news
export async function fetchNewsCategories() {
  const res = await http.get('/admin/manage-categories/news');
  const raw = unwrap(res);
  return Array.isArray(raw) ? raw : (raw.items ?? []);
}

// POST /admin/manage-categories/news
// نکته: برای ریشه parentId نفرستیم؛ برای زیردسته حتماً عدد بفرستیم
export async function createNewsCategory({ name, parentId }) {
  const payload = { name: String(name).trim() };
  const pid = toNum(parentId);
  if (pid !== undefined) payload.parentId = pid; // ← عددی
  const res = await http.post('/admin/manage-categories/news', payload);
  return unwrap(res);
}

// GET /admin/manage-categories/news/{id}
export async function getNewsCategory(id) {
  const res = await http.get(`/admin/manage-categories/news/${id}`);
  return unwrap(res);
}

// PUT /admin/manage-categories/news/{id}
export async function updateNewsCategory(id, { name, parentId }) {
  const payload = { name: String(name).trim() };
  const pid = toNum(parentId);
  if (pid !== undefined) payload.parentId = pid; // ← عددی
  const res = await http.put(`/admin/manage-categories/news/${id}`, payload);
  return unwrap(res);
}

// DELETE /admin/manage-categories/news/{id}
export async function deleteNewsCategory(id) {
  const res = await http.delete(`/admin/manage-categories/news/${id}`);
  return unwrap(res);
}
