// src/services/pagesService.js
import http from './http';

const unwrapList = (d) =>
  Array.isArray(d?.items) ? d.items :
  Array.isArray(d?.data?.items) ? d.data.items :
  Array.isArray(d?.data) ? d.data :
  Array.isArray(d) ? d :
  [];

const unwrapItem = (d) => {
  if (!d) return d;
  if (d.item) return d.item;
  if (d.data && !Array.isArray(d.data)) return d.data;
  return d;
};

function pickAuthorName(p = {}) {
  // مستقیم
  const direct =
    p.authorName ?? p.author_name ?? p.author ?? p.authorUsername ?? p.author_username;

  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  // آبجکت‌های رایج
  const candidates = [
    p.createdBy,
    p.created_by,
    p.creator,
    p.user,
    p.admin,
    p.authorObj,
    p.author_object,
  ];

  for (const c of candidates) {
    if (!c) continue;
    const u =
      c.username ??
      c.userName ??
      c.user_name ??
      c.name ??
      c.fullName ??
      c.full_name;
    if (typeof u === 'string' && u.trim()) return u.trim();
  }

  // بعضی بک‌اندها داخل content می‌گذارند
  const content = p.content;
  if (content && typeof content === 'object') {
    const u = content.authorName ?? content.author_name ?? content.author;
    if (typeof u === 'string' && u.trim()) return u.trim();
  }
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      const u = parsed?.authorName ?? parsed?.author_name ?? parsed?.author;
      if (typeof u === 'string' && u.trim()) return u.trim();
    } catch {
      // ignore
    }
  }

  return null;
}

function toUiPage(p = {}) {
  const content = p.content ?? null;

  return {
    id: p.id ?? p._id ?? '',
    title: p.title ?? '',
    slug: p.slug ?? '',
    parentId: p.parentId ?? p.parent_id ?? null,
    createdAt:
      p.createdAt ??
      p.created_at ??
      p.updatedAt ??
      p.updated_at ??
      new Date().toISOString(),
    content,
    // ✅ نویسنده از مسیرهای مختلف
    authorName: pickAuthorName(p),
  };
}

// ===============================
// لیست صفحات
// ===============================
export async function getPages() {
  try {
    const res = await http.get('/admin/manage-pages/');
    const payload = res?.data;
    const list = unwrapList(payload);
    return list.map(toUiPage);
  } catch (error) {
    console.error('خطا در دریافت صفحات:', error.response?.data || error.message);
    throw error;
  }
}

// ===============================
// گرفتن یک صفحه با id
// ===============================
export async function getPageById(id) {
  try {
    const res = await http.get(`/admin/manage-pages/${id}`);
    const item = unwrapItem(res.data);
    return toUiPage(item);
  } catch (error) {
    console.error('خطا در دریافت صفحه:', error.response?.data || error.message);
    throw error;
  }
}

// ===============================
// ایجاد صفحه جدید
// ===============================
export async function createPage(payload) {
  try {
    let content;
    if (payload.content && typeof payload.content === 'object') content = payload.content;
    else if (typeof payload.content === 'string') content = payload.content;
    else {
      const html = payload.html || '';
      const css = payload.css || '';
      content = `<style>${css}</style>${html}`;
    }

    const body = {
      title: payload.title,
      slug: payload.slug,
      content,
      // ✅ همیشه بفرست اگر مقدار دارد
      ...(payload.authorName ? { authorName: payload.authorName } : {}),
    };

    if (payload.parentId !== undefined && payload.parentId !== null && payload.parentId !== '') {
      body.parentId = payload.parentId;
    }

    const { data } = await http.post('/admin/manage-pages/', body);
    return toUiPage(unwrapItem(data));
  } catch (error) {
    throw {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    };
  }
}

// ===============================
// به‌روزرسانی صفحه
// ===============================
export async function updatePage(id, payload) {
  try {
    let content;
    if (payload.content && typeof payload.content === 'object') content = payload.content;
    else if (typeof payload.content === 'string') content = payload.content;
    else {
      const html = payload.html || '';
      const css = payload.css || '';
      content = `<style>${css}</style>${html}`;
    }

    const body = {
      title: payload.title,
      slug: payload.slug,
      content,
      ...(payload.authorName ? { authorName: payload.authorName } : {}),
    };

    if (payload.parentId !== undefined && payload.parentId !== null && payload.parentId !== '') {
      body.parentId = payload.parentId;
    }

    const { data } = await http.put(`/admin/manage-pages/${id}`, body);
    return toUiPage(unwrapItem(data));
  } catch (error) {
    console.error('خطا در به‌روزرسانی صفحه:', error.response?.data || error.message);
    throw error;
  }
}

// ===============================
// حذف صفحه
// ===============================
export async function deletePage(id) {
  try {
    const { data } = await http.delete(`/admin/manage-pages/${id}`);
    return data ?? { ok: true };
  } catch (error) {
    console.error('خطا در حذف صفحه:', error.response?.data);
    throw error;
  }
}
