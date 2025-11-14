import React from 'react';

export default function TopBar({
  title,
  slug,
  categoryId,
  onChangeTitle,
  onChangeSlug,
  onChangeCategoryId,
  onBack,
  saving,
  onSave,
  onPreview,
  onDownload,
  onShowCode,
  onDeviceChange,
  Icons,
}) {
  const {
    ArrowLeft,
    Save,
    Eye,
    Code,
    Download,
    Monitor,
    Tablet,
    Smartphone,
  } = Icons;

  return (
    <div
      className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm"
      dir="rtl"
    >
      {/* سمت راست: بازگشت + فیلدهای متا */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>بازگشت</span>
        </button>

        <div className="h-6 w-px bg-gray-300" />

        {/* فیلد عنوان */}
        <div className="flex flex-col min-w-[220px]">
          <label className="text-xs text-gray-500 mb-1">عنوان</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="بدون عنوان"
          />
        </div>

        {/* فیلد Slug */}
        <div className="flex flex-col min-w-[260px]">
          <label className="text-xs text-gray-500 mb-1">آدرس (Slug)</label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">/articles/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                onChangeSlug(
                  e.target.value.replace(/\s+/g, '-').toLowerCase()
                )
              }
              className="flex-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="article-slug"
            />
          </div>
        </div>

        {/* فیلد categoryId ساده */}
        <div className="flex flex-col w-32">
          <label className="text-xs text-gray-500 mb-1">شناسه دسته</label>
          <input
            type="number"
            value={categoryId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              onChangeCategoryId(v === '' ? undefined : Number(v));
            }}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left"
            placeholder="مثلاً 12"
          />
        </div>
      </div>

      {/* سمت چپ: دیوایس‌ها + اکشن‌ها */}
      <div className="flex items-center gap-3">
        {/* انتخاب دیوایس */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onDeviceChange('desktop')}
            className="p-2 rounded hover:bg-white"
            title="Desktop"
          >
            <Monitor className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => onDeviceChange('tablet')}
            className="p-2 rounded hover:bg-white"
            title="Tablet"
          >
            <Tablet className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => onDeviceChange('mobile')}
            className="p-2 rounded hover:bg-white"
            title="Mobile"
          >
            <Smartphone className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* اکشن‌ها */}
        <button
          onClick={onShowCode}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Code className="w-4 h-4" />
          <span className="hidden sm:inline">کد</span>
        </button>

        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">پیش‌نمایش</span>
        </button>

        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">دانلود</span>
        </button>

        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'در حال ذخیره…' : 'ذخیره'}
        </button>
      </div>
    </div>
  );
}
