import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Move, Trash2, Upload } from 'lucide-react';

export const ImageBlock = ({ src, width, borderRadius, alt, posX, posY }) => {
  const { connectors: { connect, drag }, selected, actions: { delete: deleteNode, setProp } } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    if (!selected || e.target.tagName === 'BUTTON') return;
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
      className={`${selected ? 'ring-2 ring-blue-500 rounded' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        position: 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        maxWidth: '100%'
      }}
      onMouseDown={handleMouseDown}
    >
      {selected && (
        <div className="absolute -top-10 left-0 flex gap-1 bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs z-10 shadow-lg whitespace-nowrap">
          <Move className="w-3.5 h-3.5" title="جابجایی" />
          <span className="font-medium">تصویر</span>
          <button onClick={deleteNode} className="mr-2 hover:bg-red-500 px-1.5 rounded transition-colors" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {src ? (
        <img
          src={src}
          alt={alt || 'تصویر'}
          style={{ 
            width: `${width}%`,
            maxWidth: '100%',
            height: 'auto',
            borderRadius: `${borderRadius}px`,
            pointerEvents: isDragging ? 'none' : 'auto',
            display: 'block'
          }}
        />
      ) : (
        <div className="w-64 h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <Upload className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm font-medium">تصویر را آپلود کنید</p>
        </div>
      )}
    </div>
  );
};

ImageBlock.craft = {
  props: { src: '', width: 50, borderRadius: 8, alt: '', posX: 100, posY: 100 },
  related: { settings: ImageSettings },
};

function ImageSettings() {
  const { actions: { setProp }, src, width, borderRadius, alt } = useNode((node) => ({
    src: node.data.props.src,
    width: node.data.props.width,
    borderRadius: node.data.props.borderRadius,
    alt: node.data.props.alt,
  }));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProp((props) => (props.src = event.target.result));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">آپلود تصویر</label>
        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
          <Upload className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600 font-medium">انتخاب فایل</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">یا</span></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL تصویر</label>
        <input
          type="text"
          value={src?.startsWith('data:') ? '' : src}
          onChange={(e) => setProp((p) => (p.src = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="https://example.com/image.jpg"
          dir="ltr"
        />
        {src?.startsWith('data:') && <p className="text-xs text-green-600 mt-1">✓ تصویر آپلود شده</p>}
      </div>

      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <label className="block text-sm font-bold text-gray-800 mb-2">عرض تصویر: {width}%</label>
        <input 
          type="range" 
          min="10" 
          max="100" 
          value={width} 
          onChange={(e) => setProp((p) => (p.width = parseInt(e.target.value)))} 
          className="w-full accent-purple-600" 
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>کوچک</span>
          <span>تمام عرض</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">💡 عرض به صورت درصدی است و Responsive خواهد بود</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">گردی گوشه‌ها: {borderRadius}px</label>
        <input type="range" min="0" max="50" value={borderRadius} onChange={(e) => setProp((p) => (p.borderRadius = parseInt(e.target.value)))} className="w-full accent-blue-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">متن جایگزین (Alt)</label>
        <input type="text" value={alt} onChange={(e) => setProp((p) => (p.alt = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="توضیح تصویر" />
      </div>
    </div>
  );
}