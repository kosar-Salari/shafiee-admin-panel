import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Move, Trash2, FileText } from 'lucide-react';

export const FileBlock = ({ url, fileName, fileSize, bgColor, width, posX, posY }) => {
  const { connectors: { connect, drag }, selected, actions: { delete: deleteNode, setProp } } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    if (!selected || e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = posX;
    const initialY = posY;

    const onMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setProp((props) => {
        props.posX = initialX + deltaX;
        props.posY = initialY + deltaY;
      });
    };

    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div 
      ref={(ref) => connect(drag(ref))} 
      className={`${selected ? 'ring-2 ring-blue-500 rounded-lg' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        position: 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${width}%`,
        maxWidth: '100%'
      }}
      onMouseDown={handleMouseDown}
    >
      {selected && (
        <div className="absolute -top-10 left-0 flex gap-1 bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs z-10 shadow-lg whitespace-nowrap">
          <Move className="w-3.5 h-3.5" title="جابجایی" />
          <span className="font-medium">فایل</span>
          <button onClick={deleteNode} className="mr-2 hover:bg-red-500 px-1.5 rounded transition-colors" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3 p-4 border-2 rounded-lg hover:shadow-md transition-all cursor-pointer w-full"
          style={{ 
            backgroundColor: bgColor, 
            borderColor: bgColor, 
            pointerEvents: isDragging ? 'none' : 'auto' 
          }}
        >
          <FileText className="w-8 h-8 text-slate-700 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 truncate">{fileName || 'فایل'}</p>
            {fileSize && <p className="text-sm text-slate-600">{fileSize}</p>}
          </div>
        </a>
      ) : (
        <div className="w-full p-4 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm font-medium">آدرس فایل را وارد کنید</p>
        </div>
      )}
    </div>
  );
};

FileBlock.craft = {
  props: { url: '', fileName: 'دانلود فایل', fileSize: '', bgColor: '#EEF2FF', width: 40, posX: 50, posY: 500 },
  related: { settings: FileSettings },
};

function FileSettings() {
  const { actions: { setProp }, url, fileName, fileSize, bgColor, width } = useNode((node) => ({
    url: node.data.props.url,
    fileName: node.data.props.fileName,
    fileSize: node.data.props.fileSize,
    bgColor: node.data.props.bgColor,
    width: node.data.props.width || 40,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL فایل</label>
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setProp((p) => (p.url = e.target.value))} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
          placeholder="https://example.com/file.pdf" 
          dir="ltr" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">نام فایل</label>
        <input 
          type="text" 
          value={fileName} 
          onChange={(e) => setProp((p) => (p.fileName = e.target.value))} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">حجم فایل (اختیاری)</label>
        <input 
          type="text" 
          value={fileSize} 
          onChange={(e) => setProp((p) => (p.fileSize = e.target.value))} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
          placeholder="مثال: 2.5 MB" 
        />
      </div>

      <div className="p-4 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border border-cyan-200">
        <label className="block text-sm font-bold text-gray-800 mb-2">عرض دکمه: {width}%</label>
        <input 
          type="range" 
          min="20" 
          max="100" 
          value={width} 
          onChange={(e) => setProp((p) => (p.width = parseInt(e.target.value)))} 
          className="w-full accent-cyan-600" 
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>باریک</span>
          <span>تمام عرض</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رنگ پس‌زمینه</label>
        <input 
          type="color" 
          value={bgColor} 
          onChange={(e) => setProp((p) => (p.bgColor = e.target.value))} 
          className="w-full h-10 rounded cursor-pointer border border-gray-300" 
        />
      </div>
    </div>
  );
}