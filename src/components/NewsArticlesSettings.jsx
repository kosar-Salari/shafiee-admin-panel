// src/components/NewsArticlesSettings.jsx
import React, { useEffect, useRef, useState } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';

// ──────────────────────────────
// Modal component (inline)
// ──────────────────────────────
function ResultModal({ open, type = 'success', title, message, details = [], onClose }) {
  if (!open) return null;
  const isSuccess = type === 'success';

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-[fadeIn_.2s_ease]">
        <div className={`flex items-center gap-3 px-5 py-4 rounded-t-2xl ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {isSuccess ? (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 4.93l14.14 14.14" />
              )}
            </svg>
          </div>
          <h3 className={`text-lg font-bold ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>
            {title || (isSuccess ? 'عملیات با موفقیت انجام شد' : 'خطا در ذخیره‌سازی')}
          </h3>
        </div>

        <div className="px-5 py-4">
          {message && <p className="text-sm text-gray-700 leading-6">{message}</p>}

          {Array.isArray(details) && details.length > 0 && (
            <div className="mt-3 max-h-52 overflow-auto rounded border border-gray-200">
              <ul className="divide-y divide-gray-100 text-sm">
                {details.map((line, idx) => (
                  <li key={idx} className="px-3 py-2 text-gray-800">
                    {typeof line === 'string' ? line : JSON.stringify(line)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-5 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:opacity-90"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────
// Main component
// ──────────────────────────────
export default function NewsArticlesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('success'); // 'success' | 'error'
  const [modalTitle, setModalTitle] = useState('');
  const [modalMsg, setModalMsg] = useState('');
  const [modalDetails, setModalDetails] = useState([]);

  const [newsSettings, setNewsSettings] = useState({
    showNews: true,
    newsCount: 4,
    showArticles: true,
    articlesCount: 4,
  });

  // نگهداری خام سرور برای ارسال Full payload
  const serverSettingsRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getSettings();
        if (!mounted) return;
        serverSettingsRef.current = data;
        setNewsSettings({
          showNews: !!data.newsActive,
          newsCount: Number(data.newsCount ?? 4),
          showArticles: !!data.articlesActive,
          articlesCount: Number(data.articlesCount ?? 4),
        });
      } catch (e) {
        openErrorModal('خطا در دریافت تنظیمات', extractReadableError(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const withDefaults = (s = {}) => ({
    logo: s.logo ?? "",
    mainBanner: s.mainBanner ?? "",
    rightBanner: s.rightBanner ?? "",
    leftBanner: s.leftBanner ?? "",
    newsActive: !!s.newsActive,
    articlesActive: !!s.articlesActive,
    newsCount: Number(s.newsCount ?? 5),
    articlesCount: Number(s.articlesCount ?? 5),
    footerColumns: Array.isArray(s.footerColumns) ? s.footerColumns : [],
    menuItems: Array.isArray(s.menuItems) ? s.menuItems : [],
    imageLinks1: Array.isArray(s.imageLinks1) ? s.imageLinks1 : [],
    imageLinks2: Array.isArray(s.imageLinks2) ? s.imageLinks2 : [],
    disableCommentsForPages: s.disableCommentsForPages || null,

  });

  // Helpers: open success/error modals
  function openSuccessModal(message, details = []) {
    setModalType('success');
    setModalTitle('تغییرات با موفقیت ذخیره شد');
    setModalMsg(message || 'تنظیمات اخبار و مقالات به‌روزرسانی شد.');
    setModalDetails(details);
    setModalOpen(true);
  }
  function openErrorModal(title = 'خطا در ذخیره‌سازی', details = []) {
    setModalType('error');
    setModalTitle(title);
    setModalMsg('ذخیره‌سازی انجام نشد. لطفاً موارد زیر را بررسی کنید.');
    setModalDetails(Array.isArray(details) ? details : [String(details)]);
    setModalOpen(true);
  }

  // استخراج پیام‌های قابل‌خواندن از خطای Axios/ولیدیشن
  function extractReadableError(err) {
    const res = err?.response;
    const data = res?.data;

    // حالت express-validator: { errors: [ { msg, path, ... } ] }
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((e) => {
        if (e?.path && e?.msg) return `${e.path}: ${e.msg}`;
        return JSON.stringify(e);
      });
    }

    // پیام متنی ساده
    if (typeof data === 'string') return [data];
    if (typeof data?.message === 'string') return [data.message];

    // Fallback
    return ['خطای ناشناخته از سرور دریافت شد.'];
  }

  // ذخیره دستی — ارسال و نمایش نتیجه در مدال
  const saveNow = async () => {
    if (!serverSettingsRef.current) return;
    setSaving(true);

    try {
      const base = withDefaults(serverSettingsRef.current);
      const payload = {
        ...base,
        newsActive: !!newsSettings.showNews,
        articlesActive: !!newsSettings.showArticles,
        newsCount: Number(newsSettings.newsCount ?? base.newsCount),
        articlesCount: Number(newsSettings.articlesCount ?? base.articlesCount),
      };

      const resp = await updateSettings(payload);
      serverSettingsRef.current = payload;

      // تلاش برای استخراج پیام/جزییات از پاسخ سرور
      const serverMsg =
        resp?.message ||
        resp?.data?.message ||
        'سرور تغییرات را پذیرفت.';
      const serverEcho = [
        `اخبار: ${payload.newsActive ? 'فعال' : 'غیرفعال'} (${payload.newsCount})`,
        `مقالات: ${payload.articlesActive ? 'فعال' : 'غیرفعال'} (${payload.articlesCount})`,
      ];

      openSuccessModal(serverMsg, serverEcho);
    } catch (e) {
      openErrorModal('خطا هنگام ذخیره تنظیمات', extractReadableError(e));
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 relative">
        {/* لایه بارگذاری */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <span className="text-sm text-gray-700">در حال بارگذاری…</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            تنظیمات نمایش اخبار و مقالات
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={saveNow}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:opacity-90 disabled:opacity-60"
              disabled={loading || saving}
            >
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* News */}
          <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-900">📰 جدیدترین اخبار</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsSettings.showNews}
                  onChange={(e) => setNewsSettings((p) => ({ ...p, showNews: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {newsSettings.showNews ? (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">تعداد اخبار نمایشی:</label>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNewsSettings((p) => ({ ...p, newsCount: num }))}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                        newsSettings.newsCount === num
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  {newsSettings.newsCount} خبر جدید نمایش داده می‌شود
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">نمایش اخبار غیرفعال است</p>
            )}
          </div>

          {/* Articles */}
          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-purple-900">📝 جدیدترین مقالات</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsSettings.showArticles}
                  onChange={(e) => setNewsSettings((p) => ({ ...p, showArticles: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {newsSettings.showArticles ? (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">تعداد مقالات نمایشی:</label>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNewsSettings((p) => ({ ...p, articlesCount: num }))}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                        newsSettings.articlesCount === num
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  {newsSettings.articlesCount} مقاله جدید نمایش داده می‌شود
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">نمایش مقالات غیرفعال است</p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-bold mb-2 text-gray-800">📊 خلاصه تنظیمات:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${newsSettings.showNews ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>اخبار: {newsSettings.showNews ? `فعال (${newsSettings.newsCount} عدد)` : 'غیرفعال'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${newsSettings.showArticles ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>مقالات: {newsSettings.showArticles ? `فعال (${newsSettings.articlesCount} عدد)` : 'غیرفعال'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal
        open={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMsg}
        details={modalDetails}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
