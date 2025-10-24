// src/PageBuilder.jsx
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save, Eye, Code, Download, Monitor, Tablet, Smartphone, Layers, Settings, Box } from 'lucide-react';

import useGrapesLoader from './hooks/useGrapesLoader';
import initEditor from './grapes/initEditor';

import TopBar from './components/TopBar';
import CodeModal from './components/CodeModal';

import { loadPage, savePage } from './utils/storage';

export default function PageBuilder({ slug, onBack }) {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [activeTab, setActiveTab] = useState('blocks');
  const [fontLoaded, setFontLoaded] = useState(false);

  // بارگذاری فونت لحظه
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/fonts/lahzeh.css';
    link.onload = () => setFontLoaded(true);
    document.head.appendChild(link);
  }, []);

  const scriptsLoaded = useGrapesLoader();

  useEffect(() => {
    if (!scriptsLoaded || !editorRef.current || editor) return;

    const saved = loadPage(slug);
    const e = initEditor({
      container: editorRef.current,
      panels: {
        blocks: '#blocks-panel',
        styles: '#styles-panel',
        traits: '#traits-panel',
        layers: '#layers-panel',
      },
      initialHtml: saved?.html,
      initialCss: saved?.css,
    });

    setEditor(e);

    return () => {
      try { e?.destroy(); } catch {}
    };
  }, [scriptsLoaded, slug]);

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      savePage(slug, { html, css });
      alert('صفحه با موفقیت ذخیره شد!');
    } catch (err) {
      console.error(err);
      alert('خطا در ذخیره صفحه');
    } finally {
      setSaving(false);
    }
  };

  // ⬇️ پیش‌نمایش با فونت لحظه - با مسیر absolute
  const handlePreview = () => {
    if (!editor) return;
    const html = editor.getHtml();
    const css = editor.getCss();

    // گرفتن URL پایه سایت
    const baseUrl = window.location.origin;

    // اضافه کردن استایل فونت لحظه با مسیر کامل
    const lahzehFont = `@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Thin.ttf') format('truetype');
  font-weight: 100;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-ExtraLight.ttf') format('truetype');
  font-weight: 200;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-ExtraBold.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Black.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}`;

    const fullHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${slug}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
${lahzehFont}
* { font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif !important; }
html, body { font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 0; }
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleShowCode = () => {
    if (!editor) return;
    setHtmlCode(editor.getHtml());
    setCssCode(editor.getCss());
    setShowCode(true);
  };

  // ⬇️ دانلود با فونت لحظه - با مسیر absolute
  const handleDownload = () => {
    if (!editor) return;
    const html = editor.getHtml();
    const css = editor.getCss();

    // گرفتن URL پایه سایت
    const baseUrl = window.location.origin;

    // اضافه کردن استایل فونت لحظه با مسیر کامل
    const lahzehFont = `@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Thin.ttf') format('truetype');
  font-weight: 100;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-ExtraLight.ttf') format('truetype');
  font-weight: 200;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-ExtraBold.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Black.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}`;

    const fullHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${slug}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
${lahzehFont}
* { font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif !important; }
html, body { font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 0; }
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeDevice = (device) => editor?.setDevice(device);

  return (
    <div className="h-screen flex flex-col font-lahzeh" dir="rtl">
      <TopBar
        slug={slug}
        onBack={onBack}
        saving={saving}
        onSave={handleSave}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onShowCode={handleShowCode}
        onDeviceChange={changeDevice}
        Icons={{ ArrowLeft, Save, Eye, Code, Download, Monitor, Tablet, Smartphone }}
      />

      <div className="flex-1 flex overflow-hidden">
        {!scriptsLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">در حال بارگذاری ویرایشگر...</p>
            </div>
          </div>
        ) : (
          <>
            {/* صفحه اصلی طراحی */}
            <div className="flex-1 bg-gray-100 overflow-hidden" dir="ltr" style={{ paddingRight: '40px' }}>
              <div id="gjs" ref={editorRef} style={{ height: '100%', width: '100%' }} />
            </div>

            {/* سایدبار راست با تب‌ها */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0" dir="rtl">
              {/* تب‌های بالا */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => setActiveTab('blocks')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all ${
                    activeTab === 'blocks'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Box size={18} />
                  <span>بلوک‌ها</span>
                </button>
                <button
                  onClick={() => setActiveTab('styles')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all ${
                    activeTab === 'styles'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={18} />
                  <span>استایل</span>
                </button>
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all ${
                    activeTab === 'layers'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Layers size={18} />
                  <span>لایه‌ها</span>
                </button>
              </div>

              {/* محتوای تب‌ها */}
              <div className="flex-1 overflow-y-auto">
                <div id="blocks-panel" style={{ display: activeTab === 'blocks' ? 'block' : 'none' }} className="p-4" />
                <div style={{ display: activeTab === 'styles' ? 'block' : 'none' }}>
                  <div id="styles-panel" className="p-4" />
                  <div id="traits-panel" className="p-4 border-t border-gray-200" />
                </div>
                <div id="layers-panel" style={{ display: activeTab === 'layers' ? 'block' : 'none' }} className="p-4" />
              </div>
            </div>
          </>
        )}
      </div>

      <CodeModal
        open={showCode}
        onClose={() => setShowCode(false)}
        htmlCode={htmlCode}
        cssCode={cssCode}
      />

      {/* استایل‌های GrapesJS سفارشی */}
      <style>{`
        .gjs-one-bg { background-color: #f8f9fa; }
        .gjs-two-color { color: #4f46e5; }
        .gjs-three-bg { background-color: #4f46e5; color: white; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #4f46e5; }

        .gjs-block {
          min-height: 80px; 
          padding: 16px; 
          cursor: pointer; 
          transition: all .2s;
          border: 2px solid #e5e7eb; 
          border-radius: 12px; 
          margin-bottom: 12px; 
          background: white; 
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .gjs-block:hover { 
          background: #eef2ff; 
          border-color: #4f46e5; 
          transform: translateY(-2px); 
          box-shadow: 0 8px 16px rgba(79,70,229,.15);
        }
        .gjs-block-label { 
          font-size: 13px; 
          margin-top: 8px; 
          color: #374151; 
          font-weight: 600; 
          font-family: 'Lahzeh', sans-serif;
        }
        .gjs-block__media { 
          margin-bottom: 6px; 
          font-size: 28px; 
        }
        
        .gjs-block-category { 
          border-bottom: 2px solid #e5e7eb; 
          padding: 12px 0; 
          margin-bottom: 16px; 
          background: linear-gradient(to left, #f9fafb, transparent);
          border-radius: 8px;
          padding-right: 12px;
        }
        .gjs-block-category .gjs-title { 
          font-size: 15px; 
          font-weight: 700; 
          color: #1f2937; 
          text-align: right;
          font-family: 'Lahzeh', sans-serif;
        }
        
        .gjs-cv-canvas { 
          background: #f3f4f6 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          padding: 40px !important;
          padding-right: 60px !important;
          overflow: auto !important;
        }
        .gjs-cv-canvas__frames {
          margin: 0 auto !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }
        
        .gjs-sm-sector { 
          text-align: right; 
          margin-bottom: 24px; 
          border-bottom: 1px solid #e5e7eb; 
          padding-bottom: 20px; 
        }
        .gjs-sm-sector .gjs-sm-title {
          font-size: 14px; 
          font-weight: 700; 
          color: #1f2937; 
          padding: 12px 0; 
          border-bottom: 2px solid #4f46e5;
          margin-bottom: 16px; 
          background: linear-gradient(90deg, #eef2ff 0%, transparent 100%); 
          padding-right: 12px; 
          border-radius: 6px;
        }
        .gjs-sm-property { 
          margin-bottom: 18px; 
        }
        .gjs-sm-label, .gjs-trt-trait__label { 
          font-size: 13px; 
          color: #6b7280; 
          margin-bottom: 8px; 
          display: block; 
          font-weight: 600; 
        }
        .gjs-field, .gjs-trt-trait input, .gjs-trt-trait select, .gjs-trt-trait textarea {
          direction: ltr; 
          width: 100%; 
          border: 1px solid #d1d5db; 
          border-radius: 8px; 
          padding: 10px 12px; 
          font-size: 14px; 
          transition: all .2s;
          background: white;
        }
        .gjs-field:focus, .gjs-trt-trait input:focus, .gjs-trt-trait select:focus, .gjs-trt-trait textarea:focus {
          outline: none; 
          border-color: #4f46e5; 
          box-shadow: 0 0 0 3px rgba(79,70,229,.1);
        }
        
        .gjs-layers { text-align: right; }
        .gjs-layer { 
          padding: 12px; 
          border-bottom: 1px solid #e5e7eb; 
          transition: all .2s; 
          border-radius: 6px;
          margin-bottom: 4px;
        }
        .gjs-layer:hover { background: #f9fafb; }
        .gjs-layer.gjs-selected { background: #eef2ff; border-right: 4px solid #4f46e5; }
        .gjs-layer-title { font-size: 13px; color: #374151; font-weight: 600; }
        
        .gjs-toolbar { 
          background: white; 
          border-radius: 10px; 
          box-shadow: 0 8px 24px rgba(0,0,0,.12); 
          padding: 6px; 
        }
        .gjs-toolbar-item { 
          padding: 8px 12px; 
          border-radius: 8px; 
          transition: all .2s; 
        }
        .gjs-toolbar-item:hover { background: #eef2ff; color: #4f46e5; }
        
        .gjs-dashed { border: 2px dashed #d1d5db !important; background: rgba(249,250,251,.5); }
        .gjs-pn-panel { background: white; }
      `}</style>
    </div>
  );
}