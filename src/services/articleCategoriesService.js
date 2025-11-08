// src/services/articleCategoriesService.js
import http from './http';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? [];
}

// کمک‌تابع: اگر ورودی به عدد معتبر تبدیل شد، برگردان؛ وگرنه undefined
function toNum(val) {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

// GET /admin/manage-categories/article
export async function fetchArticleCategories() {
  const res = await http.get('/admin/manage-categories/article');
  const raw = unwrap(res);
  return Array.isArray(raw) ? raw : (raw.items ?? []);
}

// POST /admin/manage-categories/article
// نکته: برای ریشه parentId نفرستیم؛ برای زیردسته حتماً عدد بفرستیم
export async function createArticleCategory({ name, parentId }) {
  const payload = { name: String(name).trim() };
  const pid = toNum(parentId);
  if (pid !== undefined) payload.parentId = pid; // ← عددی
  const res = await http.post('/admin/manage-categories/article', payload);
  return unwrap(res);
}

// GET /admin/manage-categories/article/{id}
export async function getArticleCategory(id) {
  const res = await http.get(`/admin/manage-categories/article/${id}`);
  return unwrap(res);
}

// PUT /admin/manage-categories/article/{id}
export async function updateArticleCategory(id, { name, parentId }) {
  const payload = { name: String(name).trim() };
  const pid = toNum(parentId);
  if (pid !== undefined) payload.parentId = pid; // ← عددی
  const res = await http.put(`/admin/manage-categories/article/${id}`, payload);
  return unwrap(res);
}

// DELETE /admin/manage-categories/article/{id}
export async function deleteArticleCategory(id) {
  const res = await http.delete(`/admin/manage-categories/article/${id}`);
  return unwrap(res);
}
