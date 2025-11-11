import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save, Eye, Code, Download, Monitor, Tablet, Smartphone } from 'lucide-react';
import initEditor from '../pageBuilder/grapes/initEditor';
import makeFitCanvas from '../pageBuilder/grapes/fitCanvas';

export default function PageBuilder({ slug, onBack }) {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('styles');

  const blocksPanelRef = useRef(null);
  const stylesPanelRef = useRef(null);
  const traitsPanelRef = useRef(null);
  const layersPanelRef = useRef(null);

  useEffect(() => {
    const loadGrapesJS = async () => {
      if (window.grapesjs) {
        setScriptsLoaded(true);
        return;
      }

      // CSS
      if (!document.querySelector('link[href*="grapes.min.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
        document.head.appendChild(cssLink);
      }

      // JS chain
      const script1 = document.createElement('script');
      script1.src = 'https://unpkg.com/grapesjs';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://unpkg.com/grapesjs-preset-webpage';
        script2.onload = () => {
          const script3 = document.createElement('script');
          script3.src = 'https://unpkg.com/grapesjs-blocks-basic';
          script3.onload = () => setScriptsLoaded(true);
          document.body.appendChild(script3);
        };
        document.body.appendChild(script2);
      };
      document.body.appendChild(script1);
    };

    loadGrapesJS();
  }, []);

  useEffect(() => {
    if (!scriptsLoaded || !editorRef.current || editor) return;

    // بارگذاری محتوای ذخیره‌شده
    let initialHtml = '';
    let initialCss = '';
    const savedData = localStorage.getItem(`page-${slug}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        initialHtml = parsed.html || '';
        initialCss = parsed.css || '';
      } catch (e) {
        console.error('خطا در بارگذاری:', e);
      }
    }

    const e = initEditor({
      container: editorRef.current,
      panels: {
        blocks: '#blocks-panel',
        styles: '#styles-panel',
        traits: '#traits-panel',
        layers: '#layers-panel',
      },
      initialHtml,
      initialCss,
    });

    // فیت کردن کانواس با توجه به device width
    makeFitCanvas(e);

    setEditor(e);

    return () => {
      try {
        e?.destroy();
      } catch {}
    };
  }, [scriptsLoaded, slug]);

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();

      const data = {
        slug,
        html,
        css,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(`page-${slug}`, JSON.stringify(data));
      alert('صفحه با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('خطا در ذخیره:', error);
      alert('خطا در ذخیره صفحه');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!editor) return;

    const html = editor.getHtml();
    const css = editor.getCss();

    const fullHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${slug}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>${css}</style>
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

    const fullHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${slug}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
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

  const changeDevice = (device) => {
    if (!editor) return;
    editor.setDevice(device);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    const stylesEl = document.getElementById('styles-panel');
    const traitsEl = document.getElementById('traits-panel');
    const layersEl = document.getElementById('layers-panel');
    if (stylesEl) stylesEl.style.display = tab === 'styles' ? 'block' : 'none';
    if (traitsEl) traitsEl.style.display = tab === 'traits' ? 'block' : 'none';
    if (layersEl) layersEl.style.display = tab === 'layers' ? 'block' : 'none';
  };

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      {/* هدر */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-lg font-bold text-gray-800">ویرایش: {slug}</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* دکمه‌های Responsive */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => changeDevice('desktop')}
              className="p-2 rounded hover:bg-white transition-colors"
              title="Desktop"
            >
              <Monitor className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => changeDevice('tablet')}
              className="p-2 rounded hover:bg-white transition-colors"
              title="Tablet"
            >
              <Tablet className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => changeDevice('mobile')}
              className="p-2 rounded hover:bg-white transition-colors"
              title="Mobile"
            >
              <Smartphone className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          <button
            onClick={handleShowCode}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">کد</span>
          </button>

          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">پیش‌نمایش</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">دانلود</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'در حال ذخیره...' : 'ذخیره'}
          </button>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="flex-1 flex overflow-hidden">
        {!scriptsLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">در حال بارگذاری ویرایشگر...</p>
            </div>
          </div>
        ) : (
          <>
            {/* سایدبار راست - بلوک‌ها */}
            <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-bold text-sm text-gray-700">بلوک‌ها</h3>
                <p className="text-xs text-gray-500 mt-1">برای افزودن المان، بلوک را بکشید</p>
              </div>
              <div id="blocks-panel" ref={blocksPanelRef} className="p-3"></div>
            </div>

            {/* Canvas اصلی */}
            <div className="flex-1 bg-gray-100 overflow-hidden" dir="ltr">
              <div id="gjs" ref={editorRef} style={{ height: '100%' }}></div>
            </div>

            {/* سایدبار چپ - تنظیمات */}
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
              {/* تب‌ها */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button 
                    onClick={() => switchTab('styles')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'styles' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    استایل
                  </button>
                  <button 
                    onClick={() => switchTab('traits')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'traits' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    ویژگی‌ها
                  </button>
                  <button 
                    onClick={() => switchTab('layers')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'layers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    لایه‌ها
                  </button>
                </div>
              </div>

              {/* پنل استایل */}
              <div className="p-3">
                <div className="mb-4">
                  <h3 className="font-bold text-sm text-gray-700 mb-2">مدیریت استایل</h3>
                  <p className="text-xs text-gray-500">المان را انتخاب کنید تا استایل آن را تغییر دهید</p>
                </div>
                <div id="styles-panel" ref={stylesPanelRef}></div>
              </div>

              {/* پنل ویژگی‌ها */}
              <div id="traits-panel" ref={traitsPanelRef} className="p-3 hidden"></div>

              {/* پنل لایه‌ها */}
              <div id="layers-panel" ref={layersPanelRef} className="p-3 hidden"></div>
            </div>
          </>
        )}
      </div>

      {/* مودال نمایش کد */}
      {showCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">کد HTML/CSS</h3>
              <button
                onClick={() => setShowCode(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-700">HTML</h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(htmlCode);
                      alert('کد HTML کپی شد!');
                    }}
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
                    onClick={() => {
                      navigator.clipboard.writeText(cssCode);
                      alert('کد CSS کپی شد!');
                    }}
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
              <button
                onClick={() => setShowCode(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* استایل‌های GrapesJS */}
      <style>{`
        .gjs-one-bg { background-color: #f8f9fa; }
        .gjs-two-color { color: #4f46e5; }
        .gjs-three-bg { background-color: #4f46e5; color: white; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #4f46e5; }

        .gjs-block {
          min-height: 70px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-bottom: 10px;
          background: white;
          text-align: center;
        }
        .gjs-block:hover {
          background-color: #eef2ff;
          border-color: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .gjs-block-label {
          font-size: 13px;
          margin-top: 8px;
          color: #374151;
          font-weight: 600;
        }
        .gjs-block__media {
          margin-bottom: 5px;
          font-size: 24px;
        }
        .gjs-block-category {
          border-bottom: 1px solid #e5e7eb;
          padding: 10px 12px;
          margin-bottom: 10px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .gjs-block-category .gjs-title {
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
          text-align: right;
        }
        .gjs-pn-panel { background-color: white; }
        .gjs-pn-btn { padding: 8px 12px; }
        .gjs-cv-canvas { background-color: #f3f4f6; }

        .gjs-sm-sector {
          text-align: right;
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
        }
        .gjs-sm-sector .gjs-sm-title {
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
          padding: 10px 0;
          border-bottom: 2px solid #4f46e5;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #eef2ff 0%, transparent 100%);
          padding-right: 12px;
          border-radius: 4px;
        }
        .gjs-sm-property { margin-bottom: 16px; }
        .gjs-sm-label {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 6px;
          display: block;
          font-weight: 500;
        }
        .gjs-field {
          direction: ltr;
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .gjs-field:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .gjs-sm-composite { display: flex; gap: 6px; flex-wrap: wrap; }
        .gjs-clm-select {
          text-align: right; width: 100%; padding: 8px 12px;
          border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; cursor: pointer; transition: all 0.2s;
        }
        .gjs-clm-select:hover { border-color: #4f46e5; }
        .gjs-field-color { height: 40px; border-radius: 8px; cursor: pointer; }
        .gjs-field-radio { display: flex; gap: 8px; flex-wrap: wrap; }
        .gjs-radio-item { flex: 1; min-width: 60px; }
        .gjs-radio-item input[type="radio"] { display: none; }
        .gjs-radio-item label {
          display: block; padding: 8px 12px; border: 2px solid #d1d5db; border-radius: 8px;
          text-align: center; cursor: pointer; transition: all 0.2s; font-size: 12px; font-weight: 600;
        }
        .gjs-radio-item input[type="radio"]:checked + label {
          background: #4f46e5; color: white; border-color: #4f46e5;
        }
        .gjs-radio-item label:hover { border-color: #4f46e5; }
        .gjs-field-slider { width: 100%; height: 6px; border-radius: 3px; background: #d1d5db; outline: none; -webkit-appearance: none; }
        .gjs-field-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #4f46e5; cursor: pointer;
        }
        .gjs-field-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%; background: #4f46e5; cursor: pointer; border: none;
        }
        .gjs-layers { text-align: right; }
        .gjs-layer { padding: 10px; border-bottom: 1px solid #e5e7eb; transition: all 0.2s; }
        .gjs-layer:hover { background-color: #f9fafb; }
        .gjs-layer.gjs-selected { background-color: #eef2ff; border-right: 3px solid #4f46e5; }
        .gjs-layer-title { font-size: 13px; color: #374151; font-weight: 500; }

        .gjs-trt-trait { margin-bottom: 16px; }
        .gjs-trt-trait__label {
          font-size: 13px; color: #6b7280; margin-bottom: 6px; display: block; font-weight: 500;
        }
        .gjs-trt-trait input,
        .gjs-trt-trait select,
        .gjs-trt-trait textarea {
          width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 14px; transition: all 0.2s;
        }
        .gjs-trt-trait input:focus,
        .gjs-trt-trait select:focus,
        .gjs-trt-trait textarea:focus {
          outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .gjs-toolbar {
          background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 4px;
        }
        .gjs-toolbar-item { padding: 6px 10px; border-radius: 6px; transition: all 0.2s; }
        .gjs-toolbar-item:hover { background: #eef2ff; color: #4f46e5; }

        .gjs-cv-canvas__frames { border-radius: 12px; overflow: hidden; }
        .gjs-dashed { border: 2px dashed #d1d5db !important; background: rgba(249, 250, 251, 0.5); }
      `}</style>
    </div>
  );
}
