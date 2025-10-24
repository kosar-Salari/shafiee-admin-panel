import React from 'react';

export default function BlocksPanel() {
  return (
    <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-bold text-sm text-gray-700">بلوک‌ها</h3>
        <p className="text-xs text-gray-500 mt-1">برای افزودن المان، بلوک را بکشید</p>
      </div>
      <div id="blocks-panel" className="p-3" />
    </div>
  );
}
