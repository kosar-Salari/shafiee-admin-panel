import React from 'react';
import { useNode } from '@craftjs/core';

export const Container = ({ children, padding, bgColor, containerWidth }) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <div 
      ref={(ref) => connect(drag(ref))} 
      className="min-h-screen relative"
      style={{ 
        padding: `${padding}px`, 
        backgroundColor: bgColor,
        maxWidth: containerWidth === 'full' ? '100%' : `${containerWidth}px`,
        margin: '0 auto'
      }}
    >
      {/* Grid برای چیدمان المان‌ها */}
      <div className="relative w-full" style={{ minHeight: '600px' }}>
        {children}
      </div>
    </div>
  );
};

Container.craft = {
  props: { 
    padding: 40, 
    bgColor: '#ffffff',
    containerWidth: 1200 
  },
  related: {
    settings: ContainerSettings
  }
};

function ContainerSettings() {
  const { actions: { setProp }, padding, bgColor, containerWidth } = useNode((node) => ({
    padding: node.data.props.padding,
    bgColor: node.data.props.bgColor,
    containerWidth: node.data.props.containerWidth,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">عرض صفحه</label>
        <select
          value={containerWidth}
          onChange={(e) => setProp((p) => (p.containerWidth = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="full">تمام عرض</option>
          <option value="1400">خیلی بزرگ (1400px)</option>
          <option value="1200">بزرگ (1200px)</option>
          <option value="1024">متوسط (1024px)</option>
          <option value="768">کوچک (768px)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">فاصله داخلی: {padding}px</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={padding} 
          onChange={(e) => setProp((p) => (p.padding = parseInt(e.target.value)))} 
          className="w-full accent-blue-600" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رنگ پس‌زمینه</label>
        <div className="flex gap-2">
          <input 
            type="color" 
            value={bgColor} 
            onChange={(e) => setProp((p) => (p.bgColor = e.target.value))} 
            className="w-12 h-10 rounded cursor-pointer border border-gray-300" 
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setProp((p) => (p.bgColor = e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}