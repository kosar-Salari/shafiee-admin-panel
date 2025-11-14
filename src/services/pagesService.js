// src/services/pagesService.js
import http from './http';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const unwrapList = (d) => Array.isArray(d?.items) ? d.items : (Array.isArray(d) ? d : []);
const unwrapItem = (d) => d?.item ?? d;

function toUiPage(p) {
  return {
    id: p.id ?? p._id ?? '',
    title: p.title ?? '',
    slug: p.slug ?? '',
    createdAt: p.createdAt ?? p.created_at ?? p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
    content: p.content ?? '',
  };
}

export async function getPages() {
  const { data } = await http.get('/admin/manage-pages/');
  return unwrapList(data).map(toUiPage);
}

export async function createPage(payload) {
  const body = {
    title: payload.title,
    slug: payload.slug,
    content: payload.content ?? '',
  };
  const { data } = await http.post('/admin/manage-pages/', body);
  return toUiPage(unwrapItem(data));
}

export async function getPageById(id) {
  const { data } = await http.get(`/admin/manage-pages/${toNum(id)}`);
  return toUiPage(unwrapItem(data));
}

export async function updatePage(id, payload) {
  const body = {
    title: payload.title,
    slug: payload.slug,
    content: payload.content ?? '',
  };
  const { data } = await http.put(`/admin/manage-pages/${toNum(id)}`, body);
  return toUiPage(unwrapItem(data));
}

export async function deletePage(id) {
  const { data } = await http.delete(`/admin/manage-pages/${toNum(id)}`);
  return data ?? { ok: true };
}