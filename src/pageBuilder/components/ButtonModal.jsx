// src/pageBuilder/components/ButtonModal.jsx
import React, { useEffect, useState } from 'react';

export default function ButtonModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(initialData || {});

  useEffect(() => {
    setForm(initialData || {});
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            تنظیمات دکمه
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* نوع لینک */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            نوع لینک
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.linkType || 'url'}
            onChange={(e) => handleChange('linkType', e.target.value)}
          >
            <option value="url">لینک عادی (آدرس)</option>
            <option value="anchor">برو به بخش در همین صفحه (Anchor)</option>
            <option value="none">بدون لینک</option>
          </select>
        </div>

        {/* آدرس لینک */}
        {form.linkType === 'url' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              آدرس لینک
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm ltr text-left"
              value={form.href || ''}
              onChange={(e) => handleChange('href', e.target.value)}
              placeholder="https://example.com یا /my-page"
            />
          </div>
        )}

        {/* Anchor ID */}
        {form.linkType === 'anchor' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              شناسه بخش (id المان هدف)
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm ltr text-left"
              value={form.anchorId || ''}
              onChange={(e) => handleChange('anchorId', e.target.value)}
              placeholder="مثلاً: section-1"
            />
          </div>
        )}

        {/* target */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            نحوه باز شدن
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.target || '_self'}
            onChange={(e) => handleChange('target', e.target.value)}
          >
            <option value="_self">در همین تب</option>
            <option value="_blank">در تب جدید</option>
          </select>
        </div>

        {/* استایل نرمال */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              رنگ پس‌زمینه
            </label>
            <input
              type="color"
              className="w-full h-9 rounded border"
              value={form.bg || '#4f46e5'}
              onChange={(e) => handleChange('bg', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              رنگ متن
            </label>
            <input
              type="color"
              className="w-full h-9 rounded border"
              value={form.color || '#ffffff'}
              onChange={(e) => handleChange('color', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              رنگ حاشیه
            </label>
            <input
              type="color"
              className="w-full h-9 rounded border"
              value={form.borderColor || '#000000'}
              onChange={(e) => handleChange('borderColor', e.target.value)}
            />
          </div>
        </div>

        {/* استایل هاور */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            استایل هاور (وقتی موس روی دکمه است)
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                پس‌زمینه هاور
              </label>
              <input
                type="color"
                className="w-full h-9 rounded border"
                value={form.hoverBg || '#4338ca'}
                onChange={(e) => handleChange('hoverBg', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                رنگ متن هاور
              </label>
              <input
                type="color"
                className="w-full h-9 rounded border"
                value={form.hoverColor || '#ffffff'}
                onChange={(e) => handleChange('hoverColor', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                رنگ حاشیه هاور
              </label>
              <input
                type="color"
                className="w-full h-9 rounded border"
                value={form.hoverBorderColor || form.borderColor || '#000000'}
                onChange={(e) => handleChange('hoverBorderColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* دکمه‌های اکشن */}
        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700"
          >
            ذخیره تنظیمات دکمه
          </button>
        </div>
      </div>
    </div>
  );
}
