
import React from 'react';
import { useEditor } from '@craftjs/core';
import { Settings as SettingsIcon } from 'lucide-react';

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

  return selected ? (
    <div className="p-4 bg-white border-l border-gray-200 w-80 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <SettingsIcon className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-800">تنظیمات المان</h3>
      </div>
      {selected.settings && React.createElement(selected.settings)}
    </div>
  ) : (
    <div className="p-4 bg-white border-l border-gray-200 w-80 flex items-center justify-center text-gray-500">
      <p className="text-center text-sm">یک المان را انتخاب کنید تا تنظیماتش اینجا نمایش داده شود</p>
    </div>
  );
};
