// src/pageBuilder/components/TopBar.jsx
import React, { useRef, useState } from 'react';
import { uploadFileToS3 } from '../../services/filesService';
import { ChevronDown, ChevronLeft } from 'lucide-react';

export default function TopBar({
  title,
  slug,
  categoryId,
  categoryLabel,
  categoriesTree = [],
  loadingCategories = false,
  featuredImage,
  onChangeTitle,
  onChangeSlug,
  onChangeCategoryId,
  onChangeFeaturedImage,
  onBack,
  saving,
  onSave,
  onPreview,
  onDownload, // نگه می‌داریم اگر بعداً خواستی استفاده کنی
  onShowCode,
  onDeviceChange,
  Icons,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState({}); // برای باز/بسته‌کردن زیرشاخه‌ها

  const {
    ArrowLeft,
    Save,
    Eye,
    Code,
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

  const toggleCategoryExpand = (id) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // مشابه مودال Articles: درخت با قابلیت انتخاب زیردسته
  const renderCategoryTree = (cats, level = 0) =>
    cats.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = !!expandedCats[cat.id];
      const isSelected =
        categoryId != null && Number(categoryId) === Number(cat.id);

      return (
        <div key={cat.id} style={{ marginRight: level * 16 }}>
          <div
            className={
              'flex items-center justify-between px-2 py-1 rounded cursor-pointer transition ' +
              (isSelected
                ? 'bg-indigo-50 text-indigo-700'
                : 'hover:bg-gray-50 text-gray-700')
            }
            onClick={() => {
              onChangeCategoryId && onChangeCategoryId(Number(cat.id));
              setCatOpen(false);
            }}
          >
            <div className="flex items-center gap-2 flex-1">
              {hasChildren && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategoryExpand(cat.id);
                  }}
                  className="p-0.5 rounded hover:bg-gray-100"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-gray-500" />
                  ) : (
                    <ChevronLeft size={14} className="text-gray-500" />
                  )}
                </button>
              )}
              <span className="text-sm font-medium">{cat.name}</span>
              {isSelected && (
                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                  انتخاب شده
                </span>
              )}
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderCategoryTree(cat.children, level + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div
      className="w-full border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-4 shadow-sm"
      dir="rtl"
    >
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
        {/* عنوان */}
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

        {/* اسلاگ */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">آدرس (Slug)</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => onChangeSlug && onChangeSlug(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48"
            placeholder="slug"
          />
        </div>

        {/* دسته‌بندی (درختی با زیردسته قابل انتخاب) */}
        <div className="flex flex-col relative">
          <span className="text-xs text-gray-500 mb-1">دسته‌بندی</span>
          <button
            type="button"
            onClick={() => {
              if (!loadingCategories && categoriesTree.length > 0) {
                setCatOpen((prev) => !prev);
              }
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[220px] flex items-center justify-between gap-2 bg-white"
          >
            <span className={categoryLabel ? 'text-gray-800' : 'text-gray-400'}>
              {loadingCategories
                ? 'در حال بارگذاری دسته‌ها...'
                : categoryLabel ||
                  (categoryId ? `شناسه دسته: ${categoryId}` : 'انتخاب دسته‌بندی')}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {catOpen && (
            <div className="absolute z-50 mt-1 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto p-2">
              {loadingCategories ? (
                <p className="text-xs text-gray-500 px-1 py-2">
                  در حال دریافت دسته‌بندی‌ها…
                </p>
              ) : categoriesTree.length === 0 ? (
                <p className="text-xs text-gray-500 px-1 py-2">
                  دسته‌بندی‌ای ثبت نشده است.
                </p>
              ) : (
                renderCategoryTree(categoriesTree)
              )}
            </div>
          )}
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

      {/* انتخاب دیوایس + اکشن‌ها */}
      <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-2">
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
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {Save && <Save size={18} />}
            <span>{saving ? 'در حال ذخیره...' : 'ذخیره'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
