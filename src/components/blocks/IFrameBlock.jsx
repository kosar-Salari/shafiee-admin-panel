import React from 'react';
import { useNode } from '@craftjs/core';
import { Move, Trash2 } from 'lucide-react';

export const IFrameBlock = ({ code, height }) => {
  const { connectors: { connect, drag }, selected, actions: { delete: deleteNode } } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div ref={(ref) => connect(drag(ref))} className={`cursor-move relative ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      {selected && (
        <div className="absolute -top-8 left-0 flex gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs z-10">
          <Move className="w-3 h-3" />
          <span>iframe</span>
          <button onClick={deleteNode} className="mr-2 hover:bg-red-500 px-1 rounded">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
      {code ? (
        <div style={{ height: `${height}px` }} dangerouslySetInnerHTML={{ __html: code }} className="w-full rounded-lg overflow-hidden" />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">کد iframe را وارد کنید</p>
        </div>
      )}
    </div>
  );
};

IFrameBlock.craft = {
  props: { code: '', height: 400 },
  related: { settings: IFrameSettings },
};

function IFrameSettings() {
  const { actions: { setProp }, code, height } = useNode((node) => ({
    code: node.data.props.code,
    height: node.data.props.height,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">کد iframe</label>
        <textarea
          value={code}
          onChange={(e) => setProp((p) => (p.code = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
          rows="4"
          placeholder='<iframe src="..." ...></iframe>'
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ارتفاع: {height}px</label>
        <input type="range" min="200" max="800" value={height} onChange={(e) => setProp((p) => (p.height = parseInt(e.target.value)))} className="w-full" />
      </div>
    </div>
  );
}
