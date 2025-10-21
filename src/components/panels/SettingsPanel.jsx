import React from 'react';
import { useEditor } from '@craftjs/core';
import { Settings } from 'lucide-react';

export const SettingsPanel = () => {
  const { selected } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selected;
    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related?.settings,
      };
    }
    return { selected };
  });

  return (
    <div className="w-80 bg-white border-r border-gray-200 shadow-lg">
      <div className="p-4 overflow-y-auto h-full">
        {selected ? (
          <>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Settings className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-gray-800">تنظیمات {selected.name}</h3>
            </div>
            {selected.settings && React.createElement(selected.settings)}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
              <Settings className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">هیچ المانی انتخاب نشده</p>
            <p className="text-xs text-gray-500">یک المان را کلیک کنید تا تنظیماتش نمایش داده شود</p>
          </div>
        )}
      </div>
    </div>
  );
};