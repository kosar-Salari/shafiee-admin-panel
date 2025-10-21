  import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Move, Trash2, Bold, Palette, Link2 } from 'lucide-react';

export const TextBlock = ({ text, fontSize, color, padding, fontWeight, posX, posY, width, isLink, linkUrl, linkTarget }) => {
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

  const content = (
    <p className="whitespace-pre-wrap break-words" style={{ margin: 0 }}>
      {text || 'متن خود را وارد کنید...'}
    </p>
  );

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`group ${selected ? 'ring-2 ring-blue-500 rounded' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ 
        position: 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${width}%`,
        maxWidth: '100%',
        fontSize: `${fontSize}px`, 
        color, 
        padding: `${padding}px`,
        fontWeight,
        userSelect: isDragging ? 'none' : 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      {selected && (
        <div className="absolute -top-10 left-0 flex gap-1 bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs z-10 shadow-lg whitespace-nowrap">
          <Move className="w-3.5 h-3.5" title="جابجایی" />
          <span className="font-medium">متن</span>
          {isLink && <Link2 className="w-3.5 h-3.5 text-blue-300" title="لینک" />}
          <button onClick={deleteNode} className="mr-2 hover:bg-red-500 px-1.5 rounded transition-colors" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {isLink && linkUrl ? (
        <a 
          href={linkUrl} 
          target={linkTarget} 
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          style={{ 
            color: 'inherit',
            textDecoration: 'underline',
            pointerEvents: isDragging ? 'none' : 'auto'
          }}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
};

TextBlock.craft = {
  props: { 
    text: 'متن نمونه', 
    fontSize: 16, 
    color: '#000000', 
    padding: 10, 
    fontWeight: 400, 
    posX: 50, 
    posY: 50,
    width: 40,
    isLink: false,
    linkUrl: '',
    linkTarget: '_blank'
  },
  related: { settings: TextSettings },
};

function TextSettings() {
  const { actions: { setProp }, text, fontSize, color, padding, fontWeight, width, isLink, linkUrl, linkTarget } = useNode((node) => ({
    text: node.data.props.text,
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
    padding: node.data.props.padding,
    fontWeight: node.data.props.fontWeight || 400,
    width: node.data.props.width || 40,
    isLink: node.data.props.isLink || false,
    linkUrl: node.data.props.linkUrl || '',
    linkTarget: node.data.props.linkTarget || '_blank',
  }));

  const colorPalette = [
    { name: 'مشکی', value: '#000000' },
    { name: 'سفید', value: '#FFFFFF' },
    { name: 'قرمز', value: '#EF4444' },
    { name: 'آبی', value: '#3B82F6' },
    { name: 'سبز', value: '#10B981' },
    { name: 'زرد', value: '#F59E0B' },
    { name: 'بنفش', value: '#8B5CF6' },
    { name: 'صورتی', value: '#EC4899' },
    { name: 'نارنجی', value: '#F97316' },
    { name: 'خاکستری', value: '#6B7280' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">متن</label>
        <textarea
          value={text}
          onChange={(e) => setProp((props) => (props.text = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          rows="4"
        />
      </div>

      {/* عرض Responsive */}
      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <label className="block text-sm font-bold text-gray-800 mb-2">عرض متن: {width}%</label>
        <input 
          type="range" 
          min="10" 
          max="100" 
          value={width} 
          onChange={(e) => setProp((p) => (p.width = parseInt(e.target.value)))} 
          className="w-full accent-green-600" 
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>باریک</span>
          <span>تمام عرض</span>
        </div>
      </div>

      {/* لینک */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Link2 className="w-4 h-4 text-blue-600" />
            تبدیل به لینک
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isLink}
              onChange={(e) => setProp((p) => (p.isLink = e.target.checked))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isLink && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">آدرس لینک</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setProp((p) => (p.linkUrl = e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">باز شدن در</label>
              <select
                value={linkTarget}
                onChange={(e) => setProp((p) => (p.linkTarget = e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="_blank">تب جدید</option>
                <option value="_self">همین صفحه</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">اندازه فونت: {fontSize}px</label>
        <input type="range" min="12" max="72" value={fontSize} onChange={(e) => setProp((p) => (p.fontSize = parseInt(e.target.value)))} className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>12px</span>
          <span>72px</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Bold className="w-4 h-4" />
          ضخامت فونت: {fontWeight}
        </label>
        <input type="range" min="100" max="900" step="100" value={fontWeight} onChange={(e) => setProp((p) => (p.fontWeight = parseInt(e.target.value)))} className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>نازک</span>
          <span>ضخیم</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          انتخاب رنگ
        </label>
        <div className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          {colorPalette.map((c) => (
            <button
              key={c.value}
              onClick={() => setProp((p) => (p.color = c.value))}
              className={`relative w-full aspect-square rounded-lg transition-all hover:scale-110 shadow-sm ${
                color === c.value ? 'ring-3 ring-blue-500 ring-offset-2 scale-110' : ''
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {color === c.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-2">رنگ دلخواه:</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setProp((p) => (p.color = e.target.value))} 
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setProp((p) => (p.color = e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">فاصله داخلی: {padding}px</label>
        <input type="range" min="0" max="50" value={padding} onChange={(e) => setProp((p) => (p.padding = parseInt(e.target.value)))} className="w-full accent-blue-600" />
      </div>
    </div>
  );
}