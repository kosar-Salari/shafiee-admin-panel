// src/pageBuilder/components/ButtonModal.jsx
import React, { useEffect, useState } from 'react';

export default function ButtonModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(initialData || {});
  const [activeTab, setActiveTab] = useState('style'); // 'style' یا 'position'

  useEffect(() => {
    setForm(initialData || {});
    setActiveTab('style'); // ریست تب به استایل هنگام باز شدن
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
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

        {/* تب‌ها */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
              activeTab === 'style'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            استایل و لینک
          </button>
          <button
            onClick={() => setActiveTab('position')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
              activeTab === 'position'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            موقعیت و همترازی
          </button>
        </div>

        {/* تب استایل و لینک */}
        {activeTab === 'style' && (
          <div className="space-y-5">
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
          </div>
        )}

        {/* تب موقعیت و همترازی */}
        {activeTab === 'position' && (
          <div className="space-y-5">
            {/* همترازی افقی دکمه */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                همترازی افقی دکمه
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('alignment', 'right')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    (form.alignment || 'right') === 'right'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  راست
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('alignment', 'center')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    form.alignment === 'center'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  وسط
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('alignment', 'left')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    form.alignment === 'left'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  چپ
                </button>
              </div>
              <p className="text-xs text-gray-500">
                موقعیت دکمه در صفحه را تعیین میکند
              </p>
            </div>

            {/* نوع نمایش */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                نوع نمایش
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.display || 'inline-block'}
                onChange={(e) => handleChange('display', e.target.value)}
              >
                <option value="inline-block">خطی (Inline Block)</option>
                <option value="block">بلوکی (Block)</option>
                <option value="flex">فلکس (Flex)</option>
              </select>
            </div>

            {/* تنظیمات margin */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                فاصله بالا (margin-top)
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm ltr text-left"
                value={form.marginTop || ''}
                onChange={(e) => handleChange('marginTop', e.target.value)}
                placeholder="مثلاً: 10px یا 1rem"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                فاصله پایین (margin-bottom)
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm ltr text-left"
                value={form.marginBottom || ''}
                onChange={(e) => handleChange('marginBottom', e.target.value)}
                placeholder="مثلاً: 10px یا 1rem"
              />
            </div>
          </div>
        )}

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
