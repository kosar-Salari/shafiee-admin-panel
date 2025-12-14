// src/services/pagesService.js
import http from './http';

// اگر لازم شد بعداً چیزی رو به عدد تبدیل کنیم (فعلاً استفاده نشده)
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// استخراج لیست از ساختارهای مختلف ریسپانس
const unwrapList = (d) =>
  Array.isArray(d?.items) ? d.items :
  Array.isArray(d?.data?.items) ? d.data.items :
  Array.isArray(d?.data) ? d.data :
  Array.isArray(d) ? d :
  [];

// استخراج یک آیتم واحد از ریسپانس
const unwrapItem = (d) => {
  if (!d) return d;
  if (d.item) return d.item;
  if (d.data && !Array.isArray(d.data)) return d.data;
  return d;
};

// مپ‌کردن آبجکت API به مدل قابل استفاده در UI
function toUiPage(p = {}) {
  let content = p.content ?? null;

  return {
    id: p.id ?? p._id ?? '',
    title: p.title ?? '',
    slug: p.slug ?? '',

    // parentId در این پروژه "آدرس والد" است
    // مثل: "/pages/xxx" یا "/articles/yyy" یا "/news/zzz"
    parentId: p.parentId ?? p.parent_id ?? null,

    // تاریخ ساخت/آپدیت برای فیلتر و نمایش
    createdAt:
      p.createdAt ??
      p.created_at ??
      p.updatedAt ??
      p.updated_at ??
      new Date().toISOString(),

    // خود محتوا (می‌تواند استرینگ یا آبجکت JSON باشد)
    content,

    // 🎯 نام نویسنده
    authorName: p.authorName ?? p.author_name ?? null,
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

    console.log('RAW getPageById response:', res.data);
    const item = unwrapItem(res.data);
    console.log('UNWRAPPED page item:', item);

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

    if (payload.content && typeof payload.content === 'object') {
      // ✅ از PageBuilder: { html, css, status?, ... }
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
      content,
    };

    // ⬇️ فقط اگر parentId مقدار واقعی دارد، به body اضافه کن
    if (
      payload.parentId !== undefined &&
      payload.parentId !== null &&
      payload.parentId !== ''
    ) {
      body.parentId = payload.parentId;
    }

    // اضافه کردن authorName اگر وجود دارد
    if (payload.authorName) {
      body.authorName = payload.authorName;
    }

    console.log('ارسال به API (createPage):', body);

    const { data } = await http.post('/admin/manage-pages/', body);
    return toUiPage(unwrapItem(data));
  } catch (error) {
    console.error('خطا در ایجاد صفحه (جزئیات کامل):', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    if (error?.response?.data) {
      console.log(
        '🔎 SERVER VALIDATION DETAILS (pages):',
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
// به‌روزرسانی صفحه
// ===============================
export async function updatePage(id, payload) {
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
      content,
    };

    // ⬇️ فقط در صورت داشتن مقدار معتبر
    if (
      payload.parentId !== undefined &&
      payload.parentId !== null &&
      payload.parentId !== ''
    ) {
      body.parentId = payload.parentId;
    }

    // اضافه کردن authorName اگر وجود دارد
    if (payload.authorName) {
      body.authorName = payload.authorName;
    }

    console.log('به‌روزرسانی صفحه:', body);

    const { data } = await http.put(
      `/admin/manage-pages/${id}`,
      body
    );
    return toUiPage(unwrapItem(data));
  } catch (error) {
    console.error(
      'خطا در به‌روزرسانی صفحه:',
      error.response?.data || error.message
    );
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
