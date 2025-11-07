  import React, { useState, useMemo } from "react";
  import { Search, Pencil, Trash2, CheckCircle2, Circle, Plus } from "lucide-react";

  const StatusBadge = ({ active }) => (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
        active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {active ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
      {active ? "فعال" : "غیرفعال"}
    </span>
  );


const Toggle = ({ checked, onChange, rtl = true, disabled = false }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      aria-pressed={checked}
      aria-label={checked ? "غیرفعال کردن" : "فعال کردن"}
      dir={rtl ? "rtl" : "ltr"}
      className={[
        "relative inline-flex items-center h-6 w-12 rounded-full overflow-hidden",
        "transition-colors duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        checked ? "bg-green-500" : "bg-gray-300",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md border border-gray-300",
          "transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]", // انیمیشن نرم‌تر
          rtl
            ? checked
              ? "right-0.5 translate-x-0"
              : "left-0.5 translate-x-0"
            : checked
              ? "translate-x-6"
              : "translate-x-0"
        ].join(" ")}
      />
    </button>
  );
};



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
      return d.toLocaleDateString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      return iso;
    }
  };

  export default function PagesManagement({ pages, setPages }) {
    const [query, setQuery] = useState("");
    const [showPageModal, setShowPageModal] = useState(false);
    const [newSlug, setNewSlug] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [pageParentSlug, setPageParentSlug] = useState("");
    const [creating, setCreating] = useState(false);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return pages;
      return pages.filter(
        (p) => p.slug.toLowerCase().includes(q) || (p.title ?? "").toLowerCase().includes(q)
      );
    }, [pages, query]);

    const handleDeletePage = async (page) => {
      const ok = confirm(`صفحه «${page.title || page.slug}» حذف شود؟`);
      if (!ok) return;
      setPages((prev) => prev.filter((x) => x.id !== page.id));
    };

    const handleTogglePageActive = (page, next) => {
      setPages((prev) => prev.map((x) => (x.id === page.id ? { ...x, active: next } : x)));
    };

    const handleCreatePage = async () => {
      if (!newSlug.trim()) return alert("آدرس صفحه را وارد کنید");
      if (!/^[a-z0-9-]+$/.test(newSlug)) return alert("آدرس فقط با حروف کوچک انگلیسی، عدد و خط تیره");

      setCreating(true);
      try {
        const slug = newSlug.trim();
        const title = (newTitle.trim() || slug);
        const local = {
          id: crypto.randomUUID?.() || String(Date.now()),
          slug,
          title,
          parentSlug: pageParentSlug || null,
          createdAt: new Date().toISOString(),
          active: true,
        };

        setPages((prev) => [local, ...prev]);
        setShowPageModal(false);
        setNewSlug("");
        setNewTitle("");
        setPageParentSlug("");
        
        alert(`صفحه با موفقیت ساخته شد!\nآدرس: ${local.parentSlug ? `/${local.parentSlug}/${slug}` : `/${slug}`}`);
      } finally {
        setCreating(false);
      }
    };

    const handleEditPage = (page) => {
      alert(`ویرایش صفحه: ${page.title}\nآدرس: /${page.slug}`);
    };

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center mb-6 gap-3">
          <h2 className="text-lg font-bold text-gray-700 sm:justify-self-start">صفحات من</h2>
          <div className="flex items-center gap-2 justify-self-start sm:justify-self-end w-full sm:w-auto">
            <div className="flex-1 sm:flex-none min-w-[220px]">
              <SearchBar value={query} onChange={setQuery} />
            </div>
            <button
              onClick={() => setShowPageModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              افزودن
            </button>
          </div>
        </div>

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
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm text-gray-500">نام:</span>
                    <span className="font-semibold" dir="ltr">{p.slug}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm text-gray-500">عنوان:</span>
                    <span className="font-medium text-gray-800">{p.title || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm text-gray-500">آدرس:</span>
                    <span className="text-indigo-600 font-mono text-sm" dir="ltr">/{p.slug}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">تاریخ ایجاد:</span>
                    <span className="text-gray-700">{formatDateFA(p.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">وضعیت:</span>
                    <StatusBadge active={p.active} />
                    <Toggle checked={p.active} onChange={(next) => handleTogglePageActive(p, next)} />
                  </div>

                  <button
                    onClick={() => handleEditPage(p)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Pencil className="w-4 h-4" />
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDeletePage(p)}
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

        {/* Modal ساخت صفحه */}
        {showPageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => !creating && setShowPageModal(false)} />
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
              <h3 className="text-lg font-bold mb-4">ساخت صفحه جدید</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">آدرس (Slug)</label>
                  <input
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مثال: landing-page"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    آدرس صفحه: {pageParentSlug ? `/${pageParentSlug}/` : '/'}{newSlug || "..."}
                  </p>
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
                <div>
                  <label className="block text-sm mb-1 text-gray-700">صفحه والد (اختیاری)</label>
                  <select
                    value={pageParentSlug}
                    onChange={(e) => setPageParentSlug(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">بدون والد (صفحه اصلی)</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.slug}>
                        {page.title} (/{page.slug})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    برای ایجاد زیرصفحه، صفحه والد را انتخاب کنید
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowPageModal(false)}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  onClick={handleCreatePage}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating ? "در حال ساخت…" : "ساخت"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
