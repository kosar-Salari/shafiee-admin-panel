// src/pageBuilder/components/TopBar.jsx
import React, { useRef, useState } from 'react';
import { uploadFileToS3 } from '../../services/filesService';

export default function TopBar({
  title,
  slug,
  categoryId,
  featuredImage,
  onChangeTitle,
  onChangeSlug,
  onChangeCategoryId,
  onChangeFeaturedImage,
  onBack,
  saving,
  onSave,
  onPreview,
  onDownload,
  onShowCode,
  onDeviceChange,
  Icons,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const {
    ArrowLeft,
    Save,
    Eye,
    Code,
    Download,
    Monitor,
    Tablet,
    Smartphone,
  } = Icons || {};

  const handleChooseFile = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadFileToS3(file);
      onChangeFeaturedImage && onChangeFeaturedImage(url);
    } catch (err) {
      console.error('خطا در آپلود تصویر شاخص:', err);
      alert('آپلود تصویر ناموفق بود. لطفاً دوباره تلاش کنید.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-4 shadow-sm" dir="rtl">
      {/* دکمه بازگشت */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-gray-700 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100"
        type="button"
      >
        {ArrowLeft && <ArrowLeft size={18} />}
        <span className="text-sm font-medium">بازگشت</span>
      </button>

      {/* عنوان / اسلاگ / دسته / تصویر شاخص */}
      <div className="flex-1 flex flex-wrap items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">عنوان</span>
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle && onChangeTitle(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-56"
            placeholder="عنوان صفحه / مقاله"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">آدرس (Slug)</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">/articles/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => onChangeSlug && onChangeSlug(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48"
              placeholder="slug"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">شناسه دسته</span>
          <input
            type="number"
            value={categoryId || ''}
            onChange={(e) => {
              const v = e.target.value;
              const num = v === '' ? undefined : Number(v);
              onChangeCategoryId && onChangeCategoryId(num);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-28 text-left"
            placeholder="ID"
          />
        </div>

        {/* تصویر شاخص */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">تصویر شاخص</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleChooseFile}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800"
                disabled={uploading}
              >
                {uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {featuredImage && (
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={featuredImage}
                alt="تصویر شاخص"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* انتخاب دیوایس */}
      <div className="hidden md:flex items-center gap-1 border-x border-gray-200 px-3">
        <button
          type="button"
          onClick={() => onDeviceChange && onDeviceChange('desktop')}
          className="p-1.5 rounded-lg hover:bg-gray-100"
          title="Desktop"
        >
          {Monitor && <Monitor size={18} />}
        </button>
        <button
          type="button"
          onClick={() => onDeviceChange && onDeviceChange('tablet')}
          className="p-1.5 rounded-lg hover:bg-gray-100"
          title="Tablet"
        >
          {Tablet && <Tablet size={18} />}
        </button>
        <button
          type="button"
          onClick={() => onDeviceChange && onDeviceChange('mobile')}
          className="p-1.5 rounded-lg hover:bg-gray-100"
          title="Mobile"
        >
          {Smartphone && <Smartphone size={18} />}
        </button>
      </div>

      {/* اکشن‌ها */}
      <div className="flex items-center gap-2 pl-2">
        <button
          type="button"
          onClick={onShowCode}
          className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-800"
        >
          {Code && <Code size={16} />}
          <span>کد</span>
        </button>

        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-indigo-500 text-indigo-600 hover:bg-indigo-50"
        >
          {Eye && <Eye size={16} />}
          <span>پیش‌نمایش</span>
        </button>

        <button
          type="button"
          onClick={onDownload}
          className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          {Download && <Download size={16} />}
          <span>دانلود HTML</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {Save && <Save size={18} />}
          <span>{saving ? 'در حال ذخیره...' : 'ذخیره'}</span>
        </button>
      </div>
    </div>
  );
}
