import React from 'react';
import { useNode } from '@craftjs/core';
import { Move, Trash2, Upload } from 'lucide-react';

export const ImageBlock = ({ src, scale, borderRadius, alt }) => {
  const { connectors: { connect, drag }, selected, actions: { delete: deleteNode } } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div ref={(ref) => connect(drag(ref))} className={`cursor-move relative inline-block ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {selected && (
        <div className="absolute -top-8 left-0 flex gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs z-10">
          <Move className="w-3 h-3" />
          <span>تصویر</span>
          <button onClick={deleteNode} className="mr-2 hover:bg-red-500 px-1 rounded">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
      {src ? (
        <img
          src={src}
          alt={alt || 'تصویر'}
          style={{ transform: `scale(${scale / 100})`, borderRadius: `${borderRadius}px`, transformOrigin: 'top right' }}
          className="max-w-full"
        />
      ) : (
        <div className="w-64 h-48 bg-gray-200 flex items-center justify-center rounded">
          <p className="text-gray-500">تصویر را آپلود یا URL وارد کنید</p>
        </div>
      )}
    </div>
  );
};

ImageBlock.craft = {
  props: { src: '', scale: 100, borderRadius: 8, alt: '' },
  related: { settings: ImageSettings },
};

function ImageSettings() {
  const { actions: { setProp }, src, scale, borderRadius, alt } = useNode((node) => ({
    src: node.data.props.src,
    scale: node.data.props.scale,
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
        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
          <Upload className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600">انتخاب فایل</span>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="https://example.com/image.jpg"
          dir="ltr"
        />
        {src?.startsWith('data:') && <p className="text-xs text-green-600 mt-1">✓ تصویر آپلود شده</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">اندازه: {scale}%</label>
        <input type="range" min="10" max="200" value={scale} onChange={(e) => setProp((p) => (p.scale = parseInt(e.target.value)))} className="w-full" />
        <div className="flex justify-between text-xs text-gray-500 mt-1"><span>کوچک</span><span>بزرگ</span></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">گردی گوشه‌ها: {borderRadius}px</label>
        <input type="range" min="0" max="50" value={borderRadius} onChange={(e) => setProp((p) => (p.borderRadius = parseInt(e.target.value)))} className="w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">متن جایگزین</label>
        <input type="text" value={alt} onChange={(e) => setProp((p) => (p.alt = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
    </div>
  );
}