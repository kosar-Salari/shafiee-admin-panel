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

    // فورس کردن RTL برای iframe
    e.on('load', () => {
      const frame = e.Canvas.getFrameEl();
      if (frame && frame.contentDocument) {
        const doc = frame.contentDocument;
        if (doc.documentElement) {
          doc.documentElement.setAttribute('dir', 'rtl');
        }
        if (doc.body) {
          doc.body.setAttribute('dir', 'rtl');
          doc.body.style.direction = 'rtl';
          doc.body.style.textAlign = 'right';
          // padding پیش‌فرض 20px از همه طرف
          doc.body.style.padding = '20px';
          doc.body.style.boxSizing = 'border-box';
        }
      }
    });

    // اضافه کردن تنظیم padding به Body در Style Manager
    e.on('component:selected', (component) => {
      if (component.get('tagName') === 'body') {
        // این اجازه میده body رو انتخاب کنی و padding-ش رو تغییر بدی
        component.set('stylable', ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'background-color', 'margin']);
      }
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

  const handlePreview = () => {
    if (!editor) return;
    const html = editor.getHtml();
    const css = editor.getCss();
    const baseUrl = window.location.origin;

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

  const handleDownload = () => {
    if (!editor) return;
    const html = editor.getHtml();
    const css = editor.getCss();
    const baseUrl = window.location.origin;

    const lahzehFont = `@font-face {
  font-family: 'Lahzeh';
  src: url('${baseUrl}/fonts/Lahzeh-Thin.ttf') format('truetype');
  font-weight: 100;
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
  src: url('${baseUrl}/fonts/Lahzeh-Bold.ttf') format('truetype');
  font-weight: 700;
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
    <div className="h-screen flex flex-col font-lahzeh" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
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

      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0, margin: 0, padding: 0 }} dir="rtl">
        {!scriptsLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">در حال بارگذاری ویرایشگر...</p>
            </div>
          </div>
        ) : (
          <>
            {/* 🎯 سایدبار راست - اول قرار می‌گیره */}
            <div 
              className="bg-white border-l border-gray-200 flex flex-col" 
              dir="rtl"
              style={{ 
                width: '320px',
                flexShrink: 0,
                minHeight: 0
              }}
            >
              {/* تب‌های بالا */}
              <div className="flex border-b border-gray-200 bg-gray-50" style={{ flexShrink: 0 }}>
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
              <div 
                className="flex-1 overflow-y-auto" 
                style={{ minHeight: 0 }}
              >
                <div id="blocks-panel" style={{ display: activeTab === 'blocks' ? 'block' : 'none' }} className="p-4" />
                <div style={{ display: activeTab === 'styles' ? 'block' : 'none' }}>
                  <div id="styles-panel" className="p-4" />
                  <div id="traits-panel" className="p-4 border-t border-gray-200" />
                </div>
                <div id="layers-panel" style={{ display: activeTab === 'layers' ? 'block' : 'none' }} className="p-4" />
              </div>
            </div>

            {/* 🎯 بادی - کانواس اصلی - بعد از سایدبار */}
            <div 
              className="flex-1" 
              dir="ltr"
              style={{ 
                position: 'relative',
                minWidth: 0,
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                background: '#f9fafb'
              }}
            >
              <div 
                id="gjs" 
                ref={editorRef} 
                style={{ 
                  height: '100%', 
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  margin: 0,
                  padding: 0
                }} 
              />
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
        /* Reset کامل */
        * {
          box-sizing: border-box;
        }
        
        #gjs, .gjs-cv-canvas {
          margin: 0 !important;
          padding: 0 !important;
        }

        /* 🎨 رنگ‌های عمومی */
        .gjs-one-bg { background-color: #f8f9fa; }
        .gjs-two-color { color: #4f46e5; }
        .gjs-three-bg { background-color: #4f46e5; color: white; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #4f46e5; }

        /* 🎯 کانواس - FIX اصلی */
        .gjs-cv-canvas {
          background: #f9fafb !important;
          padding: 0 !important;
          margin: 0 !important;
          left: 0 !important;
          right: 0 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          overflow: auto !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .gjs-cv-canvas__frames {
          margin: 40px auto !important;
          padding: 0 !important;
        }

        .gjs-frame {
          background: #fff !important;
          border-radius: 8px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08) !important;
          border: 1px solid #e5e7eb !important;
        }

        /* 🎯 padding پیش‌فرض برای body داخل iframe */
        #gjs iframe[id^="gjs-frame-"] body {
          padding: 20px !important;
          box-sizing: border-box !important;
        }

        /* 🎯 فورس کردن RTL داخل iframe برای المان‌ها */
        .gjs-frame-wrapper iframe {
          direction: rtl !important;
        }
        
        /* المان‌های داخل body در حالت ویرایش */
        #gjs iframe[id^="gjs-frame-"] {
          direction: rtl !important;
        }

        /* بلوک‌ها */
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
        
        /* دسته‌بندی */
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
        
        /* استایل منیجر */
        .gjs-sm-sector { 
          text-align: right; 
          margin-bottom: 24px; 
          border-bottom: 1px solid #e5e7eb; 
          padding-bottom: 20px; 
        }
        .gjs-sm-sector .gjs-sm-title {
          font-size: 16px !important;
          font-weight: 800 !important;
          color: #111827 !important;
          padding: 12px 0; 
          border-bottom: 2px solid #4f46e5;
          margin-bottom: 16px; 
          background: linear-gradient(90deg, #eef2ff 0%, transparent 100%); 
          padding-right: 12px; 
          border-radius: 6px;
          font-family: 'Lahzeh', sans-serif !important;
        }
        .gjs-sm-property { 
          margin-bottom: 18px; 
        }
        
        /* لیبل‌ها - فونت بولد و سیاه */
        .gjs-sm-label, 
        .gjs-trt-trait__label,
        .gjs-sm-property .gjs-sm-label,
        .gjs-label {
          font-size: 14px !important;
          color: #111827 !important;
          margin-bottom: 8px; 
          display: block; 
          font-weight: 800 !important;
          font-family: 'Lahzeh', sans-serif !important;
        }
        
        /* همه فیلدها - متن سیاه و بولد */
        .gjs-field, 
        .gjs-field input,
        .gjs-field select,
        .gjs-field-integer input,
        .gjs-field-number input,
        .gjs-trt-trait input, 
        .gjs-trt-trait select, 
        .gjs-trt-trait textarea,
        .gjs-sm-property input,
        .gjs-sm-property select,
        input.gjs-field,
        select.gjs-field {
          direction: ltr !important;
          width: 100% !important;
          border: 2px solid #d1d5db !important;
          border-radius: 8px !important;
          padding: 10px 12px !important;
          font-size: 15px !important;
          transition: all .2s !important;
          background: white !important;
          color: #111827 !important;
          font-weight: 700 !important;
          font-family: 'Lahzeh', monospace !important;
        }
        
        .gjs-field:focus, 
        .gjs-trt-trait input:focus, 
        .gjs-trt-trait select:focus, 
        .gjs-trt-trait textarea:focus {
          outline: none !important;
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,.1) !important;
        }

        /* اینپوت های color - اضافه کردن پالت */
        input[type="color"].gjs-field,
        .gjs-field-color-picker,
        .gjs-clm-picker {
          width: 60px !important;
          height: 40px !important;
          border: 2px solid #d1d5db !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          padding: 4px !important;
          background: white !important;
        }
        
        /* Container رنگ */
        .gjs-field-color-picker {
          display: inline-block !important;
          vertical-align: middle !important;
        }
        
        /* لایه‌ها */
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
        
        /* تولبار */
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

        
        
        /* Container اصلی */
        .gjs-field-colorp-c {
          display: block !important;
          width: 100% !important;
          position: relative !important;
        }
        
        /* فیلد اینپوت با دکمه رنگ */
        .gjs-field-colorp-c .gjs-field-colorp {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          width: 100% !important;
          position: relative !important;
        }
        
        /* اینپوت متنی کد رنگ */
        .gjs-field-colorp-c input[type="text"] {
          flex: 1 !important;
          padding: 10px 48px 10px 12px !important;
          border: 2px solid #d1d5db !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          font-family: 'Lahzeh', monospace !important;
          font-weight: 700 !important;
          color: #111827 !important;
          background: white !important;
          direction: ltr !important;
          text-align: left !important;
        }
        
        .gjs-field-colorp-c input[type="text"]:focus {
          outline: none !important;
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,.1) !important;
        }
        
        /* دکمه رنگ داخل فیلد */
        .gjs-field-colorp-c .gjs-field-color-picker {
          position: absolute !important;
          left: 8px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 36px !important;
          height: 36px !important;
          border-radius: 6px !important;
          border: 2px solid #d1d5db !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          overflow: hidden !important;
          background: white !important;
        }
        
        /* حذف پس‌زمینه شطرنجی */
        .gjs-field-colorp-c .gjs-checker-bg {
          background: none !important;
          background-image: none !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          border-radius: 4px !important;
        }
        
        .gjs-field-colorp-c .gjs-field-color-picker:hover {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,.08) !important;
          transform: translateY(-50%) scale(1.05) !important;
        }
        
        /* پالت رنگ باز شده */
        .gjs-cm-colorpicker {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
          padding: 16px !important;
          z-index: 9999 !important;
          margin-top: 8px !important;
        }
        
        /* اسلایدر رنگ اصلی */
        .gjs-cm-color-spectrum {
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          width: 200px !important;
          height: 200px !important;
        }
        
        /* Hue picker (نوار رنگی) */
        .gjs-cm-hue-spectrum {
          border-radius: 6px !important;
          height: 14px !important;
          margin-top: 12px !important;
          border: 1px solid #e5e7eb !important;
        }
        
        /* Alpha picker (شفافیت) */
        .gjs-cm-alpha-spectrum {
          border-radius: 6px !important;
          height: 14px !important;
          margin-top: 8px !important;
          border: 1px solid #e5e7eb !important;
        }
        
        /* دسته‌های Hue و Alpha */
        .gjs-cm-hue,
        .gjs-cm-alpha {
          margin: 8px 0 !important;
        }
        
        /* Pointer (دایره انتخابگر) */
        .gjs-cm-color-pointer,
        .gjs-cm-hue-pointer,
        .gjs-cm-alpha-pointer {
          width: 16px !important;
          height: 16px !important;
          border: 3px solid white !important;
          border-radius: 50% !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        }
        
        /* Preview رنگ */
        .gjs-cm-preview {
          width: 40px !important;
          height: 40px !important;
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          margin-top: 12px !important;
        }
          
      
      
      `}</style>
    </div>
  );
}