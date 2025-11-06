// src/components/pages/FooterManagement.jsx
import React, { useState } from "react";
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";

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
      setFooterColumns(prev => prev.map(col => col.id === editingColumn.id ? { ...col, title: footerColumnTitle.trim() } : col));
    } else {
      const newColumn = { id: `f-${Date.now()}`, title: footerColumnTitle.trim(), order: footerColumns.length + 1, links: [] };
      setFooterColumns(prev => [...prev, newColumn]);
    }
    setShowFooterModal(false);
    setFooterColumnTitle("");
    setEditingColumn(null);
  };

  const handleDeleteColumn = (columnId) => {
    const ok = confirm("این ستون حذف شود؟");
    if (!ok) return;
    setFooterColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const handleAddLink = (columnId) => {
    setCurrentColumnId(columnId);
    setEditingLink(null);
    setFooterLinkText("");
    setFooterLinkUrl("");
    setFooterLinkIcon("");
    setShowFooterLinkModal(true);
  };

  const handleEditLink = (columnId, link) => {
    setCurrentColumnId(columnId);
    setEditingLink(link);
    setFooterLinkText(link.text);
    setFooterLinkUrl(link.url);
    setFooterLinkIcon(link.icon);
    setShowFooterLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!footerLinkText.trim()) return alert("متن لینک را وارد کنید");
    if (!footerLinkUrl.trim()) return alert("آدرس لینک را وارد کنید");

    const newLink = { id: editingLink?.id || `l-${Date.now()}`, text: footerLinkText.trim(), url: footerLinkUrl.trim(), icon: footerLinkIcon.trim() };

    setFooterColumns(prev => prev.map(col => {
      if (col.id === currentColumnId) {
        if (editingLink) {
          return { ...col, links: col.links.map(l => l.id === editingLink.id ? newLink : l) };
        }
        return { ...col, links: [...col.links, newLink] };
      }
      return col;
    }));

    setShowFooterLinkModal(false);
    setFooterLinkText("");
    setFooterLinkUrl("");
    setFooterLinkIcon("");
    setEditingLink(null);
    setCurrentColumnId(null);
  };

  const handleDeleteLink = (columnId, linkId) => {
    const ok = confirm("این لینک حذف شود؟");
    if (!ok) return;
    setFooterColumns(prev => prev.map(col => {
      if (col.id === columnId) return { ...col, links: col.links.filter(l => l.id !== linkId) };
      return col;
    }));
  };

  const moveColumn = (columnId, direction) => {
    setFooterColumns(prev => {
      const idx = prev.findIndex(c => c.id === columnId);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      const newArr = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newArr[idx], newArr[targetIdx]] = [newArr[targetIdx], newArr[idx]];
      return newArr.map((col, i) => ({ ...col, order: i + 1 }));
    });
  };

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
          <div key={column.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">{column.title}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => moveColumn(column.id, 'up')} disabled={idx === 0} className={`p-1 rounded ${idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}>
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveColumn(column.id, 'down')} disabled={idx === footerColumns.length - 1} className={`p-1 rounded ${idx === footerColumns.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {column.links.length === 0 && <p className="text-sm text-gray-400 text-center py-2">بدون لینک</p>}
              {column.links.map(link => (
                <div key={link.id} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {link.icon && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{link.icon}</span>}
                    <span className="text-sm truncate">{link.text}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditLink(column.id, link)} className="p-1 hover:bg-white rounded">
                      <Pencil className="w-3 h-3 text-gray-600" />
                    </button>
                    <button onClick={() => handleDeleteLink(column.id, link.id)} className="p-1 hover:bg-white rounded">
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleAddLink(column.id)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700">
                افزودن لینک
              </button>
              <button onClick={() => handleEditColumn(column)} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => handleDeleteColumn(column.id)} className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal ستون */}
      {showFooterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFooterModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">{editingColumn ? "ویرایش ستون" : "افزودن ستون"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">عنوان ستون</label>
                <input
                  value={footerColumnTitle}
                  onChange={(e) => setFooterColumnTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: پیوند های مفید"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => setShowFooterModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                انصراف
              </button>
              <button onClick={handleSaveColumn} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                {editingColumn ? "ذخیره تغییرات" : "افزودن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal لینک */}
      {showFooterLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFooterLinkModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">{editingLink ? "ویرایش لینک" : "افزودن لینک"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">متن لینک</label>
                <input
                  value={footerLinkText}
                  onChange={(e) => setFooterLinkText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: درباره ما"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">آدرس (URL)</label>
                <input
                  value={footerLinkUrl}
                  onChange={(e) => setFooterLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: /about یا https://example.com"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">آیکن (اختیاری)</label>
                <input
                  value={footerLinkIcon}
                  onChange={(e) => setFooterLinkIcon(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: phone, send, camera"
                />
                <p className="text-xs text-gray-500 mt-1">نام آیکن دلخواه (فقط برای UI شما)</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => setShowFooterLinkModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                انصراف
              </button>
              <button onClick={handleSaveLink} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                {editingLink ? "ذخیره تغییرات" : "افزودن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
