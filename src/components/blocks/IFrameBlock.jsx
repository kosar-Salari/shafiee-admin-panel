import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Move, Trash2, Code } from 'lucide-react';

export const IFrameBlock = ({ code, height, width, posX, posY }) => {
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
        width: `${width}%`,
        maxWidth: '100%'
      }}
      onMouseDown={handleMouseDown}
    >
      {selected && (
        <div className="absolute -top-10 left-0 flex gap-1 bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs z-10 shadow-lg whitespace-nowrap">
          <Move className="w-3.5 h-3.5" title="جابجایی" />
          <span className="font-medium">Iframe</span>
          <button onClick={deleteNode} className="mr-2 hover:bg-red-500 px-1.5 rounded transition-colors" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {code ? (
        <div 
          style={{ 
            height: `${height}px`, 
            pointerEvents: isDragging ? 'none' : 'auto',
            width: '100%'
          }} 
          dangerouslySetInnerHTML={{ __html: code }} 
          className="rounded-lg overflow-hidden" 
        />
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <Code className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 font-medium">کد iframe را وارد کنید</p>
        </div>
      )}
    </div>
  );
};

IFrameBlock.craft = {
  props: { code: '', height: 400, width: 80, posX: 50, posY: 300 },
  related: { settings: IFrameSettings },
};

function IFrameSettings() {
  const { actions: { setProp }, code, height, width } = useNode((node) => ({
    code: node.data.props.code,
    height: node.data.props.height,
    width: node.data.props.width || 80,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">کد iframe</label>
        <textarea
          value={code}
          onChange={(e) => setProp((p) => (p.code = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm transition-all"
          rows="6"
          placeholder='<iframe src="..." ...></iframe>'
          dir="ltr"
        />
      </div>

      <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
        <label className="block text-sm font-bold text-gray-800 mb-2">عرض: {width}%</label>
        <input 
          type="range" 
          min="20" 
          max="100" 
          value={width} 
          onChange={(e) => setProp((p) => (p.width = parseInt(e.target.value)))} 
          className="w-full accent-orange-600" 
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>باریک</span>
          <span>تمام عرض</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ارتفاع: {height}px</label>
        <input type="range" min="200" max="800" value={height} onChange={(e) => setProp((p) => (p.height = parseInt(e.target.value)))} className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>کوتاه</span>
          <span>بلند</span>
        </div>
      </div>
    </div>
  );
}