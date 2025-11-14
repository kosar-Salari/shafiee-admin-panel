// src/services/newsService.js
import http from './http';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const unwrapList = (d) => Array.isArray(d?.items) ? d.items : (Array.isArray(d) ? d : []);
const unwrapItem = (d) => d?.item ?? d;

function toUiNews(n) {
  return {
    id: n.id ?? n._id ?? '',
    title: n.title ?? '',
    slug: n.slug ?? '',
    categoryId: toNum(n.categoryId ?? n.category_id),
    createdAt: n.createdAt ?? n.created_at ?? n.updatedAt ?? n.updated_at ?? new Date().toISOString(),
    content: n.content ?? '',
  };
}

export async function getNews() {
  const { data } = await http.get('/admin/manage-news/');
  return unwrapList(data).map(toUiNews);
}

export async function createNews(payload) {
  const body = {
    title: payload.title,
    slug: payload.slug,
    content: payload.content ?? '',
    categoryId: toNum(payload.categoryId),
  };
  const { data } = await http.post('/admin/manage-news/', body);
  return toUiNews(unwrapItem(data));
}

export async function getNewsById(id) {
  const { data } = await http.get(`/admin/manage-news/${toNum(id)}`);
  return toUiNews(unwrapItem(data));
}

export async function updateNews(id, payload) {
  const body = {
    title: payload.title,
    slug: payload.slug,
    content: payload.content ?? '',
    categoryId: toNum(payload.categoryId),
  };
  const { data } = await http.put(`/admin/manage-news/${toNum(id)}`, body);
  return toUiNews(unwrapItem(data));
}

export async function deleteNews(id) {
  const { data } = await http.delete(`/admin/manage-news/${toNum(id)}`);
  return data ?? { ok: true };
}