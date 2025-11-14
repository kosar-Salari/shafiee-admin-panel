
import http from './http';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const unwrapList = (d) =>
  Array.isArray(d?.items) ? d.items : Array.isArray(d) ? d : [];

const unwrapItem = (d) => {
  if (!d) return d;
  if (d.item) return d.item;   
  if (d.data) return d.data;   
  return d;
};

function toUiArticle(a) {
  return {
    id: a.id ?? a._id ?? '',
    title: a.title ?? '',
    slug: a.slug ?? '',
    categoryId: toNum(a.categoryId ?? a.category_id),
    createdAt:
      a.createdAt ??
      a.created_at ??
      a.updatedAt ??
      a.updated_at ??
      new Date().toISOString(),
    content: a.content ?? null,
  };
}

export async function getArticles() {
  try {
    const res = await http.get('/admin/manage-articles/');

    const payload = res?.data;

    const list =
      Array.isArray(payload?.items) ? payload.items :
      Array.isArray(payload?.data?.items) ? payload.data.items :
      Array.isArray(payload?.data) ? payload.data :
      Array.isArray(payload) ? payload :
      [];

    return list.map(toUiArticle);
  } catch (error) {
    console.error('خطا در دریافت مقالات:', error.response?.data || error.message);
    throw error;
  }
}

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

    const content =
      typeof payload.content === 'string'
        ? payload.content
        : (() => {
            const html = payload.html || payload.content?.html || '';
            const css = payload.css || payload.content?.css || '';
            return `<style>${css}</style>${html}`;
          })();

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
    const content =
      typeof payload.content === 'string'
        ? payload.content
        : (() => {
            const html = payload.html || payload.content?.html || '';
            const css = payload.css || payload.content?.css || '';
            return `<style>${css}</style>${html}`;
          })();

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

