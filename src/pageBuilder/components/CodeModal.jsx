import React from 'react';

export default function CodeModal({ open, onClose, htmlCode, cssCode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">کد HTML/CSS</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-700">HTML</h4>
              <button
                onClick={() => { navigator.clipboard.writeText(htmlCode); alert('کد HTML کپی شد!'); }}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                کپی
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm" dir="ltr">
              <code>{htmlCode}</code>
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-700">CSS</h4>
              <button
                onClick={() => { navigator.clipboard.writeText(cssCode); alert('کد CSS کپی شد!'); }}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                کپی
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm" dir="ltr">
              <code>{cssCode}</code>
            </pre>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
    