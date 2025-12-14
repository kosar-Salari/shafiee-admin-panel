// src/pages/Pages.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';

import {
  getPages,
  deletePage as apiDeletePage,
} from '../services/pagesService';

export default function Pages() {
  const [pages, setPages] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [loadingPages, setLoadingPages] = useState(false);
  const [errorPages, setErrorPages] = useState('');

  const [showPageModal, setShowPageModal] = useState(false);
  const [pageForm, setPageForm] = useState({ title: '', slug: '' });

  const [slugTouched, setSlugTouched] = useState(false);

  const [resultModal, setResultModal] = useState({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  // آیا اسلاگ تکراری است؟
  const slugExists = useMemo(
    () =>
      pageForm.slug &&
      pages.some(
        (p) =>
          String(p.slug).trim().toLowerCase() ===
          String(pageForm.slug).trim().toLowerCase()
      ),
    [pageForm.slug, pages]
  );

  useEffect(() => {
    refreshPages();
  }, []);

  async function refreshPages() {
    setLoadingPages(true);
    setErrorPages('');
    try {
      const list = await getPages();
      setPages(list);
    } catch (e) {
      console.error(e);
      setErrorPages('خطا در دریافت صفحات');
    } finally {
      setLoadingPages(false);
    }
  }

  const startCreatePage = () => {
    setShowPageModal(true);
    setPageForm({ title: '', slug: '' });
    setSlugTouched(false);
  };

  const confirmPageMeta = () => {
    if (!pageForm.title || !pageForm.slug || slugExists) return;

    // ⛔ اینجا createPage را صدا نمی‌زنیم
    // فقط می‌رویم داخل PageBuilder با متادیتا
    setShowPageModal(false);

    window.location.href =
      `/builder` +
      `?origin=pages` + // 👈 برای تشخیص نوع
      `&title=${encodeURIComponent(pageForm.title)}` +
      `&slug=${encodeURIComponent(pageForm.slug)}`;
  };

  const handleAskDeletePage = (pageId) => {
    setConfirmDelete({ open: true, id: pageId });
  };

  const performDelete = async (id) => {
    try {
      await apiDeletePage(id);
      await refreshPages();
      setResultModal({
        open: true,
        type: 'success',
        title: 'صفحه حذف شد',
        message: 'صفحه با موفقیت حذف شد.',
      });
    } catch (e) {
      console.error(e);
      const apiErrors = e?.data?.errors || e?.response?.data?.errors;
      const serverMsg =
        e?.data?.message ||
        e?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.data?.error;
      const msg =
        Array.isArray(apiErrors) && apiErrors.length
          ? apiErrors.map((x) => `${x.path}: ${x.msg}`).join(' | ')
          : serverMsg || 'حذف صفحه ناموفق بود.';
      setResultModal({
        open: true,
        type: 'error',
        title: 'خطا در حذف',
        message: msg,
      });
    }
  };

  const filteredPages = pages.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const dateStr = (item.createdAt || '').slice(0, 10); // YYYY-MM-DD
    const matchesDate = !filterDate || dateStr === filterDate;

    return matchesSearch && matchesDate;
  });

  // اگر در content وضعیت داشتیم (status)، برای نمایش می‌خوانیم
  const getPageStatus = (page) => {
    const c = page.content;
    if (!c) return null;

    if (typeof c === 'object' && c.status) return c.status;

    if (typeof c === 'string') {
      try {
        const parsed = JSON.parse(c);
        if (parsed && parsed.status) return parsed.status;
      } catch (e) {
        // JSON نبود، نادیده می‌گیریم
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-lahzeh" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header (شبیه مقالات، بدون تب دسته‌بندی) */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            مدیریت صفحات
          </h1>
          <div className="flex gap-4">
            <button
              onClick={startCreatePage}
              className="mr-auto px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              ایجاد صفحه جدید
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search
                className="absolute right-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="جستجو در عناوین..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* فیلتر تاریخ ایجاد */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            {/* جای خالی برای فیلترهای آینده (مثلاً فیلتر بر اساس status) */}
            <div />
          </div>

          {loadingPages ? (
            <p className="text-gray-500">در حال دریافت صفحات…</p>
          ) : errorPages ? (
            <p className="text-red-600">{errorPages}</p>
          ) : (
            <div className="space-y-4">
              {filteredPages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  صفحه‌ای یافت نشد
                </p>
              ) : (
                filteredPages.map((item) => {
                  const status = getPageStatus(item);

                  return (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start gap-4">
                        {/* متن و اطلاعات صفحه */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {item.title}
                          </h3>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar size={16} />
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString(
                                    'fa-IR'
                                  )
                                : '—'}
                            </span>

                            <span className="flex items-center gap-1">
                              <User size={16} />
                              {item.authorName || 'نامشخص'}
                            </span>

                            <span className="text-sm text-gray-500">
                            آدرس: {item.slug}/  
                            </span>



                            {status && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                وضعیت: {status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* اکشن‌ها */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const query =
                                `/builder?origin=pages` +
                                `&pageId=${item.id}` +
                                `&title=${encodeURIComponent(item.title)}` +
                                `&slug=${encodeURIComponent(item.slug)}`;
                              window.location.href = query;
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="ویرایش در صفحه‌ساز"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() =>
                              window.open(`/pages/${item.slug}`, '_blank')
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="نمایش"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => handleAskDeletePage(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal: Create Page */}
        {showPageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">ایجاد صفحه جدید</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    عنوان صفحه
                  </label>
                  <input
                    type="text"
                    placeholder="عنوان صفحه را وارد کنید"
                    value={pageForm.title}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, title: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    آدرس (Slug)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="page-slug"
                      value={pageForm.slug}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\s+/g, '-')
                          .toLowerCase();
                        setPageForm({ ...pageForm, slug: value });
                        if (!slugTouched) setSlugTouched(true);
                      }}
                      onBlur={() => setSlugTouched(true)}
                      className={
                        'flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ' +
                        (slugExists
                          ? 'border-red-400 focus:ring-red-500'
                          : 'border-gray-300')
                      }
                    />
                  </div>

                  {slugExists && (
                    <p className="mt-1 text-xs text-red-600">
                      این اسلاگ قبلاً برای صفحه دیگری ثبت شده است. لطفاً یک آدرس
                      یکتا وارد کنید.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmPageMeta}
                  disabled={!pageForm.title || !pageForm.slug || slugExists}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ادامه به صفحه‌ساز
                </button>
                <button
                  onClick={() => setShowPageModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Result */}
        {resultModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-start gap-3">
                {resultModal.type === 'success' ? (
                  <CheckCircle2 className="text-green-600 shrink-0" size={28} />
                ) : (
                  <AlertTriangle className="text-red-600 shrink-0" size={28} />
                )}
                <div>
                  <h4 className="text-lg font-bold mb-1">
                    {resultModal.title}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {resultModal.message}
                  </p>
                </div>
              </div>
              <div className="mt-6 text-left">
                <button
                  onClick={() => setResultModal((m) => ({ ...m, open: false }))}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                >
                  باشه
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
              <p className="text-lg font-bold mb-4">
                آیا از حذف این صفحه مطمئن هستید؟
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() =>
                    setConfirmDelete({ open: false, id: null })
                  }
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  خیر
                </button>
                <button
                  onClick={() => {
                    const { id } = confirmDelete;
                    setConfirmDelete({ open: false, id: null });
                    performDelete(id);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  بله
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
