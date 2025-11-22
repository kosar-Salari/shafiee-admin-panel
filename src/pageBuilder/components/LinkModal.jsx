// src/pageBuilder/components/LinkModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, ExternalLink, Target, Shield } from 'lucide-react';

export default function LinkModal({ open, onClose, onSave, initialData = {} }) {
    const [formData, setFormData] = useState({
        url: '',
        target: '_self',
        nofollow: false,
        noopener: false,
        // تنظیمات ظاهری
        color: '#3b82f6',
        underline: true,
        hoverScale: true,
        hoverColor: '#1d4ed8',
        ...initialData,
    });

    useEffect(() => {
        if (open) {
            setFormData({
                url: '',
                target: '_self',
                nofollow: false,
                noopener: false,
                color: '#3b82f6',
                underline: true,
                hoverScale: true,
                hoverColor: '#1d4ed8',
                ...initialData,
            });
        }
    }, [open, initialData]);

    // در LinkModal.jsx - تغییر handleSubmit
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('📤 ارسال داده‌های لینک از مدال:', formData);
        onSave(formData);
        // onClose() را اینجا صدا نزنید - در handleSaveLink مدیریت می‌شود
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            dir="rtl"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* هدر */}
                <div className="sticky top-0 bg-gradient-to-l from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <LinkIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">تنظیمات لینک</h2>
                            <p className="text-sm text-white/80">لینک و ظاهر آن را تنظیم کنید</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* بخش 1: تنظیمات اصلی لینک */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b-2 border-indigo-100 pb-2">
                            <LinkIcon size={18} className="text-indigo-600" />
                            تنظیمات اصلی
                        </h3>

                        {/* آدرس لینک */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                🔗 آدرس لینک (URL)
                            </label>
                            <input
                                type="text"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://example.com یا /about"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-left"
                                dir="ltr"
                                required
                            />
                        </div>

                        {/* نوع باز شدن */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                🎯 نحوه باز شدن
                            </label>
                            <select
                                value={formData.target}
                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                            >
                                <option value="_self">همان صفحه (_self)</option>
                                <option value="_blank">تب جدید (_blank)</option>
                                <option value="_parent">پنجره والد (_parent)</option>
                                <option value="_top">بالاترین پنجره (_top)</option>
                            </select>
                        </div>

                        {/* گزینه‌های امنیتی */}
                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.nofollow}
                                    onChange={(e) => setFormData({ ...formData, nofollow: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div>
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                        🔒 nofollow
                                    </span>
                                    <p className="text-xs text-gray-500">برای SEO</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.noopener}
                                    onChange={(e) => setFormData({ ...formData, noopener: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div>
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                        🚫 noopener
                                    </span>
                                    <p className="text-xs text-gray-500">برای امنیت</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* بخش 2: تنظیمات ظاهری (فقط برای متن) */}
                    {initialData.isText && (
                        <div className="space-y-4 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border-2 border-purple-200">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
                                🎨 تنظیمات ظاهری متن
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* رنگ عادی */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        🎨 رنگ لینک
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 outline-none text-left"
                                            dir="ltr"
                                            placeholder="#3b82f6"
                                        />
                                    </div>
                                </div>

                                {/* رنگ هاور */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        ✨ رنگ هاور
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.hoverColor}
                                            onChange={(e) => setFormData({ ...formData, hoverColor: e.target.value })}
                                            className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.hoverColor}
                                            onChange={(e) => setFormData({ ...formData, hoverColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 outline-none text-left"
                                            dir="ltr"
                                            placeholder="#1d4ed8"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* گزینه‌های استایل */}
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-indigo-400 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                            <span className="text-xl">_</span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">خط زیر متن</span>
                                            <p className="text-xs text-gray-500">نمایش خط زیر لینک</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.underline}
                                        onChange={(e) => setFormData({ ...formData, underline: e.target.checked })}
                                        className="w-6 h-6 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-purple-400 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                            <span className="text-xl">⬆️</span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-purple-600">بزرگ‌نمایی در هاور</span>
                                            <p className="text-xs text-gray-500">افزایش 5% اندازه در هاور</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.hoverScale}
                                        onChange={(e) => setFormData({ ...formData, hoverScale: e.target.checked })}
                                        className="w-6 h-6 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                    />
                                </label>
                            </div>

                            {/* پیش‌نمایش */}
                            <div className="bg-white p-5 rounded-xl border-2 border-gray-200">
                                <p className="text-sm font-bold text-gray-700 mb-3">👁️ پیش‌نمایش:</p>
                                <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    style={{
                                        color: formData.color,
                                        textDecoration: formData.underline ? 'underline' : 'none',
                                        transition: 'all 0.2s ease',
                                        transformOrigin: 'center center',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = formData.hoverColor;
                                        if (formData.hoverScale) {
                                            e.target.style.transform = 'scale(1.02)'; // قبلاً 1.05 بود
                                            e.target.style.transformOrigin = 'center center';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = formData.color;
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.transformOrigin = 'center center';
                                    }}
                                    className="text-lg font-medium inline-block"
                                >
                                    این یک لینک نمونه است
                                </a>

                            </div>
                        </div>
                    )}

                    {/* دکمه‌ها */}
                    <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-l from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
                        >
                            ✅ ذخیره لینک
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}