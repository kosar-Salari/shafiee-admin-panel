// src/components/pages/FooterManagement.jsx
import React, { useState } from "react";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { uploadFile } from "../../services/uploadService"; // 👈 سرویس آپلود

export default function FooterManagement({ footerColumns, setFooterColumns }) {
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [showFooterLinkModal, setShowFooterLinkModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [currentColumnId, setCurrentColumnId] = useState(null);

  const [footerColumnTitle, setFooterColumnTitle] = useState("");
  const [footerLinkText, setFooterLinkText] = useState("");
  const [footerLinkUrl, setFooterLinkUrl] = useState("");
  const [footerLinkIcon, setFooterLinkIcon] = useState("");

  // ✅ جدید: لینک اختیاری
  const [footerLinkHasUrl, setFooterLinkHasUrl] = useState(true);

  // وضعیت آپلود آیکن
  const [iconUploading, setIconUploading] = useState(false);
  const [iconUploadProgress, setIconUploadProgress] = useState(0);
  const [iconUploadError, setIconUploadError] = useState(null);

  // ───────────── آیکن: انتخاب + آپلود خودکار ─────────────
  const handleIconPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("لطفاً فایل تصویری انتخاب کنید");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم فایل نباید بیشتر از 5MB باشد");
      return;
    }

    try {
      setIconUploading(true);
      setIconUploadProgress(0);
      setIconUploadError(null);

      const url = await uploadFile(file, {
        folder: "footer-icons",
        onProgress: (p) => setIconUploadProgress(p),
      });

      console.log("[FooterManagement] uploaded icon url:", url);
      setFooterLinkIcon(url);
    } catch (err) {
      console.error("خطا در آپلود آیکن:", err);
      setIconUploadError("خطا در آپلود آیکن، دوباره تلاش کنید");
      alert("خطا در آپلود آیکن");
    } finally {
      setIconUploading(false);
    }
  };

  const handleRemoveIcon = () => {
    setFooterLinkIcon("");
    setIconUploading(false);
    setIconUploadProgress(0);
    setIconUploadError(null);
  };

  const resetLinkModalState = () => {
    setFooterLinkText("");
    setFooterLinkUrl("");
    setFooterLinkHasUrl(true); // ✅ جدید
    setFooterLinkIcon("");
    setIconUploading(false);
    setIconUploadProgress(0);
    setIconUploadError(null);
    setEditingLink(null);
    setCurrentColumnId(null);
  };

  // ───────────── ستون‌ها ─────────────
  const handleAddColumn = () => {
    if (footerColumns.length >= 4) return alert("حداکثر 4 ستون مجاز است");
    setEditingColumn(null);
    setFooterColumnTitle("");
    setShowFooterModal(true);
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setFooterColumnTitle(column.title);
    setShowFooterModal(true);
  };

  const handleSaveColumn = () => {
    if (!footerColumnTitle.trim()) return alert("عنوان ستون را وارد کنید");

    if (editingColumn) {
      setFooterColumns((prev) =>
        prev.map((col) =>
          col.id === editingColumn.id
            ? { ...col, title: footerColumnTitle.trim() }
            : col
        )
      );
    } else {
      const newColumn = {
        id: `f-${Date.now()}`,
        title: footerColumnTitle.trim(),
        order: footerColumns.length + 1,
        links: [],
      };
      setFooterColumns((prev) => [...prev, newColumn]);
    }

    setShowFooterModal(false);
    setFooterColumnTitle("");
    setEditingColumn(null);
  };

  const handleDeleteColumn = (columnId) => {
    const ok = confirm("این ستون حذف شود؟");
    if (!ok) return;
    setFooterColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  const moveColumn = (columnId, direction) => {
    setFooterColumns((prev) => {
      const idx = prev.findIndex((c) => c.id === columnId);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const newArr = [...prev];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      [newArr[idx], newArr[targetIdx]] = [newArr[targetIdx], newArr[idx]];
      return newArr.map((col, i) => ({ ...col, order: i + 1 }));
    });
  };

  // ───────────── لینک‌ها ─────────────
  const handleAddLink = (columnId) => {
    setCurrentColumnId(columnId);
    setEditingLink(null);
    setFooterLinkText("");
    setFooterLinkUrl("");
    setFooterLinkHasUrl(true); // ✅ جدید (اگر می‌خواهی پیش‌فرض بدون لینک باشد false بگذار)
    setFooterLinkIcon("");
    setIconUploading(false);
    setIconUploadProgress(0);
    setIconUploadError(null);
    setShowFooterLinkModal(true);
  };

  const handleEditLink = (columnId, link) => {
    setCurrentColumnId(columnId);
    setEditingLink(link);

    setFooterLinkText(link.text || "");
    setFooterLinkUrl(link.url || "");
    setFooterLinkHasUrl(!!(link.url && link.url.trim())); // ✅ جدید
    setFooterLinkIcon(link.icon || "");

    setIconUploading(false);
    setIconUploadProgress(0);
    setIconUploadError(null);
    setShowFooterLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!footerLinkText.trim()) return alert("متن را وارد کنید");

    // ✅ فقط اگر کاربر گفته لینک دارد، URL اجباری شود
    if (footerLinkHasUrl && !footerLinkUrl.trim())
      return alert("آدرس لینک را وارد کنید");

    const newLink = {
      id: editingLink?.id || `l-${Date.now()}`,
      text: footerLinkText.trim(),
      url: footerLinkHasUrl ? footerLinkUrl.trim() : "", // ✅ اگر لینک نمی‌خواهد => رشته خالی
      icon: footerLinkIcon || "",
    };

    console.log("[FooterManagement] saving link:", newLink);

    setFooterColumns((prev) =>
      prev.map((col) => {
        if (col.id === currentColumnId) {
          if (editingLink) {
            return {
              ...col,
              links: col.links.map((l) =>
                l.id === editingLink.id ? newLink : l
              ),
            };
          }
          return { ...col, links: [...col.links, newLink] };
        }
        return col;
      })
    );

    setShowFooterLinkModal(false);
    resetLinkModalState();
  };

  const handleDeleteLink = (columnId, linkId) => {
    const ok = confirm("این لینک حذف شود؟");
    if (!ok) return;
    setFooterColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            links: col.links.filter((l) => l.id !== linkId),
          };
        }
        return col;
      })
    );
  };

  // ───────────── UI ─────────────
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-700">ستون‌های فوتر</h2>
        <button
          onClick={handleAddColumn}
          disabled={footerColumns.length >= 4}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          افزودن ستون ({footerColumns.length}/4)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {footerColumns.map((column, idx) => (
          <div
            key={column.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">{column.title}</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveColumn(column.id, "up")}
                  disabled={idx === 0}
                  className={`p-1 rounded ${
                    idx === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveColumn(column.id, "down")}
                  disabled={idx === footerColumns.length - 1}
                  className={`p-1 rounded ${
                    idx === footerColumns.length - 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {column.links.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">
                  بدون لینک
                </p>
              )}

              {column.links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {link.icon && (
                      <div className="w-6 h-6 rounded border border-gray-300 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                        <img
                          src={link.icon}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.classList.add("bg-red-50");
                            e.target.parentElement.innerHTML =
                              '<span class="text-[8px] text-red-500">✕</span>';
                          }}
                        />
                      </div>
                    )}
                    <span className="text-sm truncate">{link.text}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditLink(column.id, link)}
                      className="p-1 hover:bg-white rounded"
                    >
                      <Pencil className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteLink(column.id, link.id)}
                      className="p-1 hover:bg-white rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAddLink(column.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                افزودن لینک
              </button>

              <button
                onClick={() => handleEditColumn(column)}
                className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Pencil className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleDeleteColumn(column.id)}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal ستون */}
      {showFooterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFooterModal(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">
              {editingColumn ? "ویرایش ستون" : "افزودن ستون"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  عنوان ستون
                </label>
                <input
                  value={footerColumnTitle}
                  onChange={(e) => setFooterColumnTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: پیوند های مفید"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFooterModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveColumn}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {editingColumn ? "ذخیره تغییرات" : "افزودن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal لینک */}
      {showFooterLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowFooterLinkModal(false);
              resetLinkModalState();
            }}
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">
              {editingLink ? "ویرایش لینک" : "افزودن لینک"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  متن لینک
                </label>
                <input
                  value={footerLinkText}
                  onChange={(e) => setFooterLinkText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: درباره ما"
                />
              </div>

              {/* ✅ جدید: سوییچ لینک داشتن */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">
                  این آیتم لینک دارد
                </label>
                <input
                  type="checkbox"
                  checked={footerLinkHasUrl}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFooterLinkHasUrl(checked);
                    if (!checked) setFooterLinkUrl(""); // ✅ وقتی لینک نمی‌خواهد، url خالی شود
                  }}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  آدرس (URL)
                </label>
                <input
                  value={footerLinkUrl}
                  onChange={(e) => setFooterLinkUrl(e.target.value)}
                  disabled={!footerLinkHasUrl}
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
                    !footerLinkHasUrl ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="مثال: /about یا https://example.com"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  آیکن (اختیاری)
                </label>

                {footerLinkIcon && (
                  <div className="mb-3 relative group inline-block">
                    <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={footerLinkIcon}
                        alt="Icon"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div class="text-xs text-red-500">خطا در بارگذاری</div>';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveIcon}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer text-sm">
                    <Upload className="w-4 h-4" />
                    <span>{footerLinkIcon ? "تغییر آیکن" : "آپلود آیکن"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconPick}
                      className="hidden"
                    />
                  </label>

                  {iconUploading && (
                    <p className="text-xs text-gray-600">
                      در حال آپلود... {iconUploadProgress}%
                    </p>
                  )}

                  {iconUploadError && (
                    <p className="text-xs text-red-600">{iconUploadError}</p>
                  )}

                  <p className="text-xs text-gray-500">
                    حجم مجاز: حداکثر 5MB | فرمت: PNG, JPG, SVG
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowFooterLinkModal(false);
                  resetLinkModalState();
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveLink}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {editingLink ? "ذخیره تغییرات" : "افزودن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
