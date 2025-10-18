
import React from 'react';
import { useNode } from '@craftjs/core';
import { Move, Trash2, FileText } from 'lucide-react';

export const FileBlock = ({ url, fileName, fileSize, bgColor }) => {
  const { connectors: { connect, drag }, selected, actions: { delete: deleteNode } } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div ref={(ref) => connect(drag(ref))} className={`cursor-move relative ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {selected && (
        <div className="absolute -top-8 left-0 flex gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs z-10">
          <Move className="w-3 h-3" />
          <span>فایل</span>
          <button onClick={deleteNode} className="mr-2 hover:bg-red-500 px-1 rounded">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border-2 rounded-lg hover:shadow-md transition-all" style={{ backgroundColor: bgColor, borderColor: bgColor }}>
          <FileText className="w-8 h-8" />
          <div className="flex-1">
            <p className="font-medium">{fileName || 'فایل'}</p>
            {fileSize && <p className="text-sm text-gray-600">{fileSize}</p>}
          </div>
        </a>
      ) : (
        <div className="w-full p-4 bg-gray-200 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">آدرس فایل را وارد کنید</p>
        </div>
      )}
    </div>
  );
};

FileBlock.craft = {
  props: { url: '', fileName: 'دانلود فایل', fileSize: '', bgColor: '#EEF2FF' },
  related: { settings: FileSettings },
};

function FileSettings() {
  const { actions: { setProp }, url, fileName, fileSize, bgColor } = useNode((node) => ({
    url: node.data.props.url,
    fileName: node.data.props.fileName,
    fileSize: node.data.props.fileSize,
    bgColor: node.data.props.bgColor,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL فایل</label>
        <input type="text" value={url} onChange={(e) => setProp((p) => (p.url = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://example.com/file.pdf" dir="ltr" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">نام فایل</label>
        <input type="text" value={fileName} onChange={(e) => setProp((p) => (p.fileName = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">حجم فایل (اختیاری)</label>
        <input type="text" value={fileSize} onChange={(e) => setProp((p) => (p.fileSize = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: 2.5 MB" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رنگ پس‌زمینه</label>
        <input type="color" value={bgColor} onChange={(e) => setProp((p) => (p.bgColor = e.target.value))} className="w-full h-10 rounded cursor-pointer" />
      </div>
    </div>
  );
}
