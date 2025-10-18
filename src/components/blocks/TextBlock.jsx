import React from 'react';
import { useNode } from '@craftjs/core';
import { Move, Trash2 } from 'lucide-react';

export const TextBlock = ({ text, fontSize, color, alignment, padding }) => {
  const { connectors: { connect, drag }, selected, actions: { delete: deleteNode } } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`cursor-move relative group ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ fontSize: `${fontSize}px`, color, textAlign: alignment, padding: `${padding}px` }}
    >
      {selected && (
        <div className="absolute -top-8 left-0 flex gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs z-10">
          <Move className="w-3 h-3" />
          <span>متن</span>
          <button onClick={deleteNode} className="mr-2 hover:bg-red-500 px-1 rounded">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
      <p className="whitespace-pre-wrap">{text || 'متن خود را وارد کنید...'}</p>
    </div>
  );
};

TextBlock.craft = {
  props: { text: 'متن نمونه', fontSize: 16, color: '#000000', alignment: 'right', padding: 10 },
  related: { settings: TextSettings },
};

function TextSettings() {
  const { actions: { setProp }, text, fontSize, color, alignment, padding } = useNode((node) => ({
    text: node.data.props.text,
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
    alignment: node.data.props.alignment,
    padding: node.data.props.padding,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">متن</label>
        <textarea
          value={text}
          onChange={(e) => setProp((props) => (props.text = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          rows="4"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">اندازه فونت: {fontSize}px</label>
        <input type="range" min="12" max="48" value={fontSize} onChange={(e) => setProp((p) => (p.fontSize = parseInt(e.target.value)))} className="w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رنگ</label>
        <input type="color" value={color} onChange={(e) => setProp((p) => (p.color = e.target.value))} className="w-full h-10 rounded cursor-pointer" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">تراز</label>
        <select value={alignment} onChange={(e) => setProp((p) => (p.alignment = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="right">راست</option>
          <option value="center">وسط</option>
          <option value="left">چپ</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">فاصله داخلی: {padding}px</label>
        <input type="range" min="0" max="50" value={padding} onChange={(e) => setProp((p) => (p.padding = parseInt(e.target.value)))} className="w-full" />
      </div>
    </div>
  );
}