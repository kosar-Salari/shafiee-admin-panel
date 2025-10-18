import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pencil, Trash2, CheckCircle2, Circle, Plus } from 'lucide-react';

// Badge وضعیت
const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
      active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
    }`}
  >
    {active ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
    {active ? 'فعال' : 'غیرفعال'}
  </span>
);

// سوییچ وضعیت با UI بهتر
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange?.(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-green-500' : 'bg-gray-300'
    }`}
    aria-pressed={checked}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-1'
      }`}
    />
  </button>
);

// نوار جستجو (سمت چپ هدر)
const SearchBar = ({ value, onChange }) => (
  <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
    <Search className="w-4 h-4 text-gray-500" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="جستجو بر اساس نام یا عنوان…"
      className="flex-1 outline-none text-sm bg-transparent"
    />
  </div>
);

const formatDateFA = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return iso;
  }
};

export default function Pages() {
  const navigate = useNavigate();

  const [pages, setPages] = useState([
    { id: '1', slug: 'landing',  title: 'صفحه لندینگ', createdAt: '2025-10-10T12:00:00Z', active: true },
    { id: '2', slug: 'pricing',  title: 'قیمت‌ها',      createdAt: '2025-10-12T09:30:00Z', active: false },
    { id: '3', slug: 'about-us', title: 'درباره ما',    createdAt: '2025-10-15T18:20:00Z', active: true },
  ]);

  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) => p.slug.toLowerCase().includes(q) || (p.title ?? '').toLowerCase().includes(q)
    );
  }, [pages, query]);

  const handleDelete = async (page) => {
    const ok = confirm(`صفحه «${page.title || page.slug}» حذف شود؟`);
    if (!ok) return;
    setPages((prev) => prev.filter((x) => x.id !== page.id));
  };

  const handleToggleActive = (page, next) => {
    setPages((prev) => prev.map((x) => (x.id === page.id ? { ...x, active: next } : x)));
  };

  const goEdit = (slug) => navigate(`/builder/${slug}`);

  const handleCreate = async () => {
    if (!newSlug.trim()) return alert('آدرس صفحه را وارد کنید');
    if (!/^[a-z0-9-]+$/.test(newSlug)) return alert('آدرس فقط با حروف کوچک انگلیسی، عدد و خط تیره');

    setCreating(true);
    try {
      const payload = { slug: newSlug.trim(), title: newTitle.trim() || newSlug.trim() };
      const local = {
        id: crypto.randomUUID?.() || String(Date.now()),
        slug: payload.slug,
        title: payload.title,
        createdAt: new Date().toISOString(),
        active: true,
      };
      setPages((prev) => [local, ...prev]);
      setShowModal(false);
      setNewSlug('');
      setNewTitle('');
      goEdit(local.slug);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* هدر: عنوان راست، سرچ + افزودن چپ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center mb-6 gap-3">
          <h1 className="text-xl font-bold text-gray-800 sm:justify-self-start">صفحات من</h1>
          <div className="flex items-center gap-2 justify-self-start sm:justify-self-end w-full sm:w-auto">
            <div className="flex-1 sm:flex-none min-w-[220px]">
              <SearchBar value={query} onChange={setQuery} />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              افزودن صفحه جدید
            </button>
          </div>
        </div>

        {/* لیست کارت‌ها */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="p-6 bg-white border border-gray-200 rounded-xl text-center text-gray-500">
              نتیجه‌ای پیدا نشد.
            </div>
          )}

          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">نام:</span>
                    <span className="font-semibold" dir="ltr">{p.slug}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">عنوان:</span>
                    <span className="font-medium text-gray-800">{p.title || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">تاریخ ایجاد:</span>
                    <span className="text-gray-700">{formatDateFA(p.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">وضعیت:</span>
                    <StatusBadge active={p.active} />
                    <Toggle checked={p.active} onChange={(next) => handleToggleActive(p, next)} />
                  </div>

                  <button
                    onClick={() => goEdit(p.slug)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Pencil className="w-4 h-4" />
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal ساخت صفحه جدید */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !creating && setShowModal(false)} />
          <div className="relative bg-white w-[95%] max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">ساخت صفحه جدید</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">آدرس (Slug)</label>
                <input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: landing-page"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">فقط حروف کوچک انگلیسی، عدد و -</p>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">عنوان</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: صفحه لندینگ"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={creating}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating ? 'در حال ساخت…' : 'ساخت'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
