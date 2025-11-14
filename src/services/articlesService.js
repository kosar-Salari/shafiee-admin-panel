// src/services/articlesService.js
import http from './http';

// تبدیل امن به عدد
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// اگر جایی لازم شد لیست رو از شکل‌های مختلف دربیاریم
const unwrapList = (d) =>
  Array.isArray(d?.items) ? d.items :
  Array.isArray(d?.data?.items) ? d.data.items :
  Array.isArray(d?.data) ? d.data :
  Array.isArray(d) ? d :
  [];

// درآوردن یک آیتم از ریسپانس‌های مختلف
const unwrapItem = (d) => {
  if (!d) return d;
  if (d.item) return d.item;
  if (d.data && !Array.isArray(d.data)) return d.data;
  return d;
};

// مپ‌کردن آبجکت API به مدل قابل استفاده در UI
function toUiArticle(a = {}) {
  return {
    id: a.id ?? a._id ?? '',
    title: a.title ?? '',
    slug: a.slug ?? '',
    categoryId: toNum(a.categoryId ?? a.category_id),

    // تاریخ‌ها
    createdAt:
      a.createdAt ??
      a.created_at ??
      a.updatedAt ??
      a.updated_at ??
      new Date().toISOString(),

    // خود محتوا (می‌تونه استرینگ باشه یا بعداً آبجکت html/css)
    content: a.content ?? null,

    // 🎯 عکس شاخص (در صورت وجود)
    featuredImage:
      a.featuredImage ??
      a.featured_image ??
      a.thumbnail ??
      null,
  };
}

// ===============================
// لیست مقالات
// ===============================
export async function getArticles() {
  try {
    const res = await http.get('/admin/manage-articles/');

    const payload = res?.data;
    const list = unwrapList(payload);

    return list.map(toUiArticle);
  } catch (error) {
    console.error('خطا در دریافت مقالات:', error.response?.data || error.message);
    throw error;
  }
}

// ===============================
// گرفتن یک مقاله با id
// ===============================
export async function getArticleById(id) {
  try {
    const res = await http.get(`/admin/manage-articles/${toNum(id)}`);

    console.log('RAW getArticleById response:', res.data);
    const item = unwrapItem(res.data);
    console.log('UNWRAPPED article item:', item);

    return toUiArticle(item);
  } catch (error) {
    console.error('خطا در دریافت مقاله:', error.response?.data || error.message);
    throw error;
  }
}

export async function createArticle(payload) {
  try {
    let content;

    if (payload.content && typeof payload.content === 'object') {
      // ✅ از PageBuilder: { html, css, featuredImage, ... }
      content = payload.content;
    } else if (typeof payload.content === 'string') {
      // اگر جاهای دیگه هنوز استرینگ می‌فرستن
      content = payload.content;
    } else {
      // حالت قدیمی: html/css جدا
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

    console.log('ارسال به API (createArticle):', body);

    const { data } = await http.post('/admin/manage-articles/', body);
    return toUiArticle(unwrapItem(data));
  } catch (error) {
    console.error('خطا در ایجاد مقاله (جزئیات کامل):', {
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

export async function updateArticle(id, payload) {
  try {
    let content;

    if (payload.content && typeof payload.content === 'object') {
      // ✅ از PageBuilder
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

    console.log('به‌روزرسانی مقاله:', body);

    const { data } = await http.put(
      `/admin/manage-articles/${toNum(id)}`,
      body
    );
    return toUiArticle(unwrapItem(data));
  } catch (error) {
    console.error(
      'خطا در به‌روزرسانی مقاله:',
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function deleteArticle(id) {
  try {
    const { data } = await http.delete(`/admin/manage-articles/${toNum(id)}`);
    return data ?? { ok: true };
  } catch (error) {
    console.error('خطا در حذف مقاله:', error.response?.data);
    throw error;
  }
}
