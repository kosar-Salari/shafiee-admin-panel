// src/components/LinkedImages2Settings.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Upload, Plus, Trash2, Save, GripVertical, Loader2 } from 'lucide-react';

import { getSettings, updateSettings } from '../services/settingsService';
import { apiToLocal, localToApi } from '../services/settingsMapper';
import { uploadFile } from '../services/uploadService';

export default function LinkedImages2Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // اسنپ‌شات کامل تنظیمات تا فقط imageLinks2 را تغییر دهیم
  const [wholeLocal, setWholeLocal] = useState(null);

  // لیست imageLinks2 که این کامپوننت مدیریت می‌کند
  const [linkedImages, setLinkedImages] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  /* ───────────────── Init: GET settings → fill UI ───────────────── */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const apiData = await getSettings();
        const local = apiToLocal(apiData);
        if (!isMounted) return;

        setWholeLocal(local);

        // map + sort + idدهی
        const list = Array.isArray(local.imageLinks2) ? local.imageLinks2 : [];
        const withIds = list
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((it, i) => ({
            id: `li2-${i + 1}`,
            image: it.image || '',
            link: it.link || '/',
            position: it.position ?? (i + 1),
          }));

        setLinkedImages(withIds);
      } catch (e) {
        setError('دریافت تنظیمات با خطا مواجه شد.');
      } finally {
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const sorted = useMemo(
    () => linkedImages.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [linkedImages]
  );

  /* ───────────────── Upload (real upload via service) ───────────────── */
  const handleImageUpload = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, { folder: 'banners/linked2' });
      setLinkedImages(items => items.map(it => it.id === id ? { ...it, image: url } : it));
    } catch {
      alert('آپلود ناموفق بود.');
    }
  };

  /* ───────────────── CRUD ───────────────── */
  const addLinkedImage = () => {
    const maxPos = linkedImages.reduce((mx, it) => Math.max(mx, it.position ?? 0), 0);
    setLinkedImages(prev => [
      ...prev,
      { id: `li2-${Date.now()}`, image: '', link: '/', position: maxPos + 1 },
    ]);
  };

  const updateLink = (id, value) => {
    setLinkedImages(items => items.map(it => it.id === id ? { ...it, link: value } : it));
  };

  const deleteImage = (id) => {
    setLinkedImages(items => {
      const filtered = items.filter(it => it.id !== id);
      return filtered
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((it, i) => ({ ...it, position: i + 1 }));
    });
  };

  /* ───────────────── Drag & Drop ───────────────── */
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const list = sorted;
    const from = list.findIndex(x => x.id === draggedItem.id);
    const to = list.findIndex(x => x.id === targetItem.id);
    if (from < 0 || to < 0) return;

    const next = list.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    const renumbered = next.map((it, i) => ({ ...it, position: i + 1 }));
    setLinkedImages(renumbered);
    setDraggedItem(null);
  };

  /* ───────────────── SAVE (PATCH only imageLinks2) ───────────────── */
  const saveChanges = async () => {
    if (!wholeLocal) return;

    try {
      setSaving(true);
      setError('');

      // 1️⃣ اول settings کامل رو از بک بگیر
      const currentSettings = await getSettings();

      // 2️⃣ payload مستقیم بدون localToApi
      const payload = {
        ...currentSettings,
        disableCommentsForPages: currentSettings.disableCommentsForPages || null,
        imageLinks2: sorted.map(it => ({
          image: it.image,
          link: it.link,
          position: it.position,
        })),
      };

      await updateSettings(payload);
      alert('imageLinks2 ذخیره شد! ✅');

      // دوباره settings رو بگیر تا سنک بمونه
      const fresh = await getSettings();
      setWholeLocal(apiToLocal(fresh));
    } catch (e) {
      setError('ذخیره تنظیمات با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };
  /* ───────────────── UI ───────────────── */
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {/* تیتر دقیقا مثل قبلی */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          عکس‌های لینک‌دار
        </h2>

        <button
          onClick={addLinkedImage}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          افزودن عکس
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin" />
          <span>در حال بارگذاری…</span>
        </div>
      ) : linkedImages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">هنوز عکسی اضافه نشده است</p>
          <p className="text-sm mt-2">برای شروع روی «افزودن عکس» کلیک کنید</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item)}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-move"
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing mt-2">
                    <GripVertical size={24} className="text-gray-400" />
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* Image Preview */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt="عکس لینک‌دار"
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="h-48 flex items-center justify-center bg-gray-50">
                          <span className="text-gray-400">بدون عکس</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors">
                      <Upload size={20} className="text-gray-500" />
                      <span className="text-sm">{item.image ? 'تغییر عکس' : 'آپلود عکس'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(item.id, e)}
                        className="hidden"
                      />
                    </label>

                    {/* Link Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">لینک</label>
                      <input
                        type="text"
                        value={item.link}
                        onChange={(e) => updateLink(item.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="/example"
                      />
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteImage(item.id)}
                      className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" />
                  در حال ذخیره…
                </>
              ) : (
                <>
                  <Save size={20} />
                  ذخیره تغییرات
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
