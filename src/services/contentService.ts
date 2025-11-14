// یک لایه‌ی نازک برای انتزاع CRUD سه نوع محتوا
import http from './http';

type EntityType = 'article' | 'news' | 'page';

type SavePayload = {
  title: string;
  slug: string;
  content: string;       // (ترجیحاً HTML شامل <style>…</style>)
  categoryId?: number;   // فقط برای مقاله/خبر در صورت نیاز
  // هر فیلد متای دیگری که بک‌اندت می‌خواهد اینجا اضافه کن
};

// مسیرهای هر نوع را اینجا مپ کن
const routes: Record<EntityType, { base: string; byId: (id: number) => string }> = {
  article: {
    base: '/admin/manage-articles',
    byId: (id: number) => `/admin/manage-articles/${id}`,
  },
  news: {
    base: '/admin/manage-news',
    byId: (id: number) => `/admin/manage-news/${id}`,
  },
  page: {
    base: '/admin/manage-pages',
    byId: (id: number) => `/admin/manage-pages/${id}`,
  },
};

// خواندن یک آیتم
export async function getItem(type: EntityType, id: number) {
  const url = routes[type].byId(id);
  const res = await http.get(url);
  return res.data; // انتظار: { id, title, slug, content, categoryId?, ... }
}

// ساخت آیتم جدید
export async function createItem(type: EntityType, payload: SavePayload) {
  const url = routes[type].base;
  const res = await http.post(url, payload);
  return res.data; // انتظار: { id, ... }
}

// بروزرسانی آیتم
export async function updateItem(type: EntityType, id: number, payload: Partial<SavePayload>) {
  const url = routes[type].byId(id);
  const res = await http.put(url, payload);
  return res.data;
}
