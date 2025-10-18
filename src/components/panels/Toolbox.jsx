
import React from 'react';
import { useEditor } from '@craftjs/core';
import { Type, Image as ImageIcon, Code, FileText } from 'lucide-react';
import { TextBlock } from '../blocks/TextBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { IFrameBlock } from '../blocks/IFrameBlock';
import { FileBlock } from '../blocks/FileBlock';

export const Toolbox = () => {
  const { connectors } = useEditor();

  const tools = [
    { type: TextBlock, label: 'متن', icon: Type },
    { type: ImageBlock, label: 'تصویر', icon: ImageIcon },
    { type: IFrameBlock, label: 'iframe', icon: Code },
    { type: FileBlock, label: 'فایل', icon: FileText },
  ];

  return (
    <div className="p-4 bg-white border-l border-gray-200 w-56">
      <h3 className="font-bold text-gray-800 mb-4">ابزارها</h3>
      <div className="space-y-2">
        {tools.map(({ type, label, icon: Icon }) => (
          <button
            key={label}
            ref={(ref) => connectors.create(ref, React.createElement(type))}
            className="w-full flex items-center gap-3 p-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 font-medium mb-2">💡 راهنما:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• المان را به صفحه بکشید</li>
          <li>• با موس جا به جا کنید</li>
          <li>• روی المان کلیک کنید</li>
          <li>• از آیکون سطل برای حذف استفاده کنید</li>
        </ul>
      </div>
    </div>
  );
};

