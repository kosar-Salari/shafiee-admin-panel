import React, { useEffect } from 'react';

export default function RightSidebar({ activeTab, setActiveTab }) {
  useEffect(() => {
    const show = (id, visible) => {
      const el = document.querySelector(id);
      if (el) el.style.display = visible ? 'block' : 'none';
    };
    show('#styles-panel', activeTab === 'styles');
    show('#traits-panel', activeTab === 'traits');
    show('#layers-panel', activeTab === 'layers');
  }, [activeTab]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('styles')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'styles' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            استایل
          </button>
          <button
            onClick={() => setActiveTab('traits')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'traits' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            ویژگی‌ها
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'layers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            لایه‌ها
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-gray-700 mb-2">مدیریت استایل</h3>
          <p className="text-xs text-gray-500">المان را انتخاب کنید تا استایل آن را تغییر دهید</p>
        </div>
        <div id="styles-panel" />
      </div>

      <div id="traits-panel" className="p-3 hidden" />
      <div id="layers-panel" className="p-3 hidden" />
    </div>
  );
}
