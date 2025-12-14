// src/services/newsService.js
import http from './http';

// تبدیل امن به عدد
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// درآوردن لیست از شکل‌های مختلف
const unwrapList = (d) =>
  Array.isArray(d?.items) ? d.items :
  Array.isArray(d?.data?.items) ? d.data.items :
  Array.isArray(d?.data) ? d.data :
  Array.isArray(d) ? d :
  [];

// درآوردن یک آیتم
const unwrapItem = (d) => {
  if (!d) return d;
  if (d.item) return d.item;
  if (d.data && !Array.isArray(d.data)) return d.data;
  return d;
};

// 👈 مپ خبر از API به مدل UI (با featuredImage)
function toUiNews(n = {}) {
  return {
    id: n.id ?? n._id ?? '',
    title: n.title ?? '',
    slug: n.slug ?? '',
    categoryId: toNum(n.categoryId ?? n.category_id),

    createdAt:
      n.createdAt ??
      n.created_at ??
      n.updatedAt ??
      n.updated_at ??
      new Date().toISOString(),

    content: n.content ?? null,

    // 🎯 تصویر شاخص
    featuredImage:
      n.featuredImage ??
      n.featured_image ??
      n.thumbnail ??
      null,

    // 🎯 نام نویسنده
    authorName: n.authorName ?? n.author_name ?? null,
  };
}

// ===============================
// لیست اخبار
// ===============================
export async function getNews() {
  try {
    const res = await http.get('/admin/manage-news/');
    const payload = res?.data;
    const list = unwrapList(payload);
    return list.map(toUiNews);
  } catch (error) {
    console.error('خطا در دریافت اخبار:', error.response?.data || error.message);
    throw error;
  }
}

// ===============================
// گرفتن یک خبر با id
// ===============================
export async function getNewsById(id) {
  try {
    const res = await http.get(`/admin/manage-news/${toNum(id)}`);

    console.log('RAW getNewsById response:', res.data);
    const item = unwrapItem(res.data);
    console.log('UNWRAPPED news item:', item);

    return toUiNews(item);
  } catch (error) {
    console.error('خطا در دریافت خبر:', error.response?.data || error.message);
    throw error;
  }
}

// ===============================
// ایجاد خبر جدید
// ===============================
export async function createNews(payload) {
  try {
    let content;

    if (payload.content && typeof payload.content === 'object') {
      // ✅ از PageBuilder: { html, css, featuredImage, ... }
      content = payload.content;
    } else if (typeof payload.content === 'string') {
      content = payload.content;
    } else {
      const html = payload.html || '';
      const css = payload.css || '';
      content = `<style>${css}</style>${html}`;
    }

    const body = {
      title: payload.title,
      slug: payload.slug,
      categoryId: toNum(payload.categoryId),
      content,
    };

    // اضافه کردن authorName اگر وجود دارد
    if (payload.authorName) {
      body.authorName = payload.authorName;
    }

    console.log('ارسال به API (createNews):', body);

    const { data } = await http.post('/admin/manage-news/', body);
    return toUiNews(unwrapItem(data));
  } catch (error) {
    console.error('خطا در ایجاد خبر (جزئیات کامل):', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    if (error?.response?.data) {
      console.log(
        '🔎 SERVER VALIDATION DETAILS:',
        JSON.stringify(error.response.data, null, 2)
      );
    }

    throw {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    };
  }
}

// ===============================
// آپدیت خبر
// ===============================
export async function updateNews(id, payload) {
  try {
    let content;

    if (payload.content && typeof payload.content === 'object') {
      content = payload.content;
    } else if (typeof payload.content === 'string') {
      content = payload.content;
    } else {
      const html = payload.html || '';
      const css = payload.css || '';
      content = `<style>${css}</style>${html}`;
    }

    const body = {
      title: payload.title,
      slug: payload.slug,
      categoryId: toNum(payload.categoryId),
      content,
    };

    // اضافه کردن authorName اگر وجود دارد
    if (payload.authorName) {
      body.authorName = payload.authorName;
    }

    console.log('به‌روزرسانی خبر:', body);

    const { data } = await http.put(
      `/admin/manage-news/${toNum(id)}`,
      body
    );
    return toUiNews(unwrapItem(data));
  } catch (error) {
    console.error(
      'خطا در به‌روزرسانی خبر:',
      error.response?.data || error.message
    );
    throw error;
  }
}

// ===============================
// حذف خبر
// ===============================
export async function deleteNews(id) {
  try {
    const { data } = await http.delete(`/admin/manage-news/${toNum(id)}`);
    return data ?? { ok: true };
  } catch (error) {
    console.error('خطا در حذف خبر:', error.response?.data);
    throw error;
  }
}
