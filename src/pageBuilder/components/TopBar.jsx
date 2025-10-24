import React from 'react';

export default function TopBar({
  slug,
  onBack,
  saving,
  onSave,
  onPreview,
  onDownload,
  onShowCode,
  onDeviceChange,
  Icons,
}) {
  const { ArrowLeft, Save, Eye, Code, Download, Monitor, Tablet, Smartphone } = Icons;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          بازگشت
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <h1 className="text-lg font-bold text-gray-800">ویرایش: {slug}</h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => onDeviceChange('desktop')} className="p-2 rounded hover:bg-white" title="Desktop">
            <Monitor className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => onDeviceChange('tablet')} className="p-2 rounded hover:bg-white" title="Tablet">
            <Tablet className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => onDeviceChange('mobile')} className="p-2 rounded hover:bg-white" title="Mobile">
            <Smartphone className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <button onClick={onShowCode} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <Code className="w-4 h-4" />
          <span className="hidden sm:inline">کد</span>
        </button>

        <button onClick={onPreview} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">پیش‌نمایش</span>
        </button>

        <button onClick={onDownload} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">دانلود</span>
        </button>

        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
      </div>
    </div>
  );
}
