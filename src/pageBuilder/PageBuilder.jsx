// src/pageBuilder/PageBuilder.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Download,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Settings,
  Box,
} from 'lucide-react';

import { useSearchParams, useNavigate } from 'react-router-dom';

import useGrapesLoader from './hooks/useGrapesLoader';
import initEditor from './grapes/initEditor';

import TopBar from './components/TopBar';
import CodeModal from './components/CodeModal';

import {
  getArticleById,
  createArticle,
  updateArticle,
} from '../services/articlesService';
import { getNewsById, updateNews } from '../services/newsService';
import { getPageById, updatePage } from '../services/pagesService';
import { buildTree, getPathMap } from '../utils/categoryTree';
import { fetchArticleCategories } from '../services/articleCategoriesService';
import { useMemo } from 'react';



export default function PageBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawOrigin = searchParams.get('origin');
  const articleId = searchParams.get('articleId');
  const newsId = searchParams.get('newsId');
  const pageId = searchParams.get('pageId');

  const origin =
    rawOrigin ||
    (articleId ? 'articles' : newsId ? 'news' : pageId ? 'pages' : null);

  const queryCategory = searchParams.get('category');
  const queryTitle = searchParams.get('title') || 'بدون عنوان';
  const querySlug = searchParams.get('slug') || 'page';

  const [metaTitle, setMetaTitle] = useState(queryTitle);
  const [metaSlug, setMetaSlug] = useState(querySlug);
  const [metaCategoryId, setMetaCategoryId] = useState(
    queryCategory ? Number(queryCategory) : undefined
  );

  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [activeTab, setActiveTab] = useState('blocks');

  const [loadingContent, setLoadingContent] = useState(true);
  const [contentData, setContentData] = useState({ html: '', css: '' });
  const [featuredImage, setFeaturedImage] = useState('');

  const [categoriesTree, setCategoriesTree] = useState([]);
  const [categoriesFlat, setCategoriesFlat] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const scriptsLoaded = useGrapesLoader();

  // بارگذاری فونت لحظه (اختیاری)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/fonts/lahzeh.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    async function loadContent() {
      setLoadingContent(true);
      try {
        let item = null;

        if (origin === 'articles' && articleId) {
          item = await getArticleById(articleId);
        } else if (origin === 'news' && newsId) {
          item = await getNewsById(newsId);
        } else if (origin === 'pages' && pageId) {
          item = await getPageById(pageId);
        }


        if (item) {
          setMetaTitle(item.title || queryTitle);
          setMetaSlug(item.slug || querySlug);
          setMetaCategoryId(
            item.categoryId != null ? Number(item.categoryId) : metaCategoryId
          );

          // ✅ تلاش برای پیدا کردن تصویر شاخص از جاهای مختلف
          let fi = item.featuredImage || null;

          if (item.content) {
            if (typeof item.content === 'object' && item.content.featuredImage) {
              fi = item.content.featuredImage || fi;
            } else if (typeof item.content === 'string') {
              // اگر content به صورت JSON استرینگ ذخیره شده
              try {
                const parsed = JSON.parse(item.content);
                if (parsed && parsed.featuredImage) {
                  fi = parsed.featuredImage || fi;
                }
              } catch (e) {
                // نادیده می‌گیریم
              }
            }
          }

          setFeaturedImage(fi || '');
        }



        if (item && item.content) {
          let html = '';
          let css = '';

          if (typeof item.content === 'object') {
            const { html: h = '', css: c = '' } = item.content || {};
            html = h;
            css = c;
          } else if (typeof item.content === 'string') {
            const contentStr = item.content;
            const styleMatch = contentStr.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
            css = styleMatch ? styleMatch[1] : '';
            html = contentStr
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .trim();
          }

          setContentData({ html, css });
        } else {
          setContentData({ html: '', css: '' });
        }

      } catch (error) {
        console.error('خطا در بارگذاری محتوا:', error);
        setContentData({ html: '', css: '' });
      } finally {
        setLoadingContent(false);
      }
    }

    if (!origin && !articleId && !newsId && !pageId) {
      setContentData({ html: '', css: '' });
      setLoadingContent(false);
      return;
    }

    loadContent();
  }, [origin, articleId, newsId, pageId]);


  useEffect(() => {
    // فقط وقتی اسکریپت GrapesJS لود شده و کانتینر حاضر است
    if (!scriptsLoaded || !editorRef.current) return;

    console.log('[PageBuilder] initEditor start', {
      scriptsLoaded,
      hasContainer: !!editorRef.current,
    });

    const e = initEditor({
      container: editorRef.current,
      panels: {
        blocks: '#blocks-panel',
        styles: '#styles-panel',
        traits: '#traits-panel',
        layers: '#layers-panel',
      },
      initialHtml: '',
      initialCss: '',
    });

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
          doc.body.style.padding = '20px';
          doc.body.style.boxSizing = 'border-box';
        }
      }
    });

    e.on('component:selected', (component) => {
      if (component.get('tagName') === 'body') {
        component.set('stylable', [
          'padding',
          'padding-top',
          'padding-right',
          'padding-bottom',
          'padding-left',
          'background-color',
          'margin',
        ]);
      }
    });

    setEditor(e);
    console.log('[PageBuilder] editor created');

    // فقط موقع unmount کامپوننت destroy کن
    return () => {
      try {
        e.destroy();
      } catch (err) {
        console.error('Error destroying editor', err);
      }
    };
  }, [scriptsLoaded]); // ⬅️ مهم: editor از deps حذف شد


  // ۳) اعمال محتوا روی ادیتور بعد از لود از API
  useEffect(() => {
    if (!editor) return;
    if (loadingContent) return;

    if (contentData.html || contentData.css) {
      editor.setComponents(contentData.html || '');
      editor.setStyle(contentData.css || '');
    } else {
      editor.setComponents(
        '<div style="padding:20px; text-align:center;">صفحه خالی است</div>'
      );
    }
  }, [editor, loadingContent, contentData]);


  // لود دسته‌بندی‌ها برای صفحه‌ساز مقاله
  useEffect(() => {
    if (origin !== 'articles') return;

    async function loadCats() {
      setLoadingCats(true);
      try {
        const flat = await fetchArticleCategories();
        setCategoriesFlat(flat);
        setCategoriesTree(buildTree(flat));
      } catch (e) {
        console.error('خطا در دریافت دسته‌بندی‌های مقاله برای PageBuilder:', e);
      } finally {
        setLoadingCats(false);
      }
    }

    loadCats();
  }, [origin]);
  const categoryPathMap = useMemo(
    () => getPathMap(categoriesTree, ' / '),
    [categoriesTree]
  );

  const selectedCategoryLabel = useMemo(() => {
    if (!metaCategoryId) return '';
    return (
      categoryPathMap[String(metaCategoryId)] ||
      `شناسه دسته: ${metaCategoryId}`
    );
  }, [metaCategoryId, categoryPathMap]);


  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);

    try {
      const html = editor.getHtml();
      const css = editor.getCss();

      // 🔹 برای مقاله‌ها: آبجکت JSON شامل html/css/featuredImage
      const contentForBackend = {
        html,
        css,
        featuredImage: featuredImage || null,
      };

      // 🔹 برای news/pages اگر هنوز همون فرمت استرینگ با <style> می‌خوای
      const fullContent = `<style>${css}</style>\n${html}`;

      let didCallApi = false;

      // --- مقالات ---
      if (origin === 'articles') {
        const payload = {
          title: metaTitle,
          slug: metaSlug,
          categoryId: metaCategoryId,
          content: contentForBackend,       // html + css + featuredImage (برای خودت)
          featuredImage: featuredImage || null, // 🎯 خیلی مهم: فیلد جدا برای بک‌اند
        };

        if (articleId) {
          await updateArticle(articleId, payload);
          didCallApi = true;
        } else {
          const created = await createArticle(payload);
          didCallApi = true;

          if (created?.id) {
            navigate(
              `/builder?origin=articles` +
              `&articleId=${created.id}` +
              `&category=${metaCategoryId || ''}` +
              `&title=${encodeURIComponent(metaTitle)}` +
              `&slug=${encodeURIComponent(metaSlug)}`,
              { replace: true }
            );
          }
        }
      }


      // --- خبرها ---
      else if (origin === 'news') {
        if (newsId) {
          await updateNews(newsId, {
            title: metaTitle,
            slug: metaSlug,
            content: fullContent,
            categoryId: metaCategoryId,
          });
          didCallApi = true;
        }
      }

      // --- صفحات ---
      else if (origin === 'pages') {
        if (pageId) {
          await updatePage(pageId, {
            title: metaTitle,
            slug: metaSlug,
            content: fullContent,
          });
          didCallApi = true;
        }
      }

      if (!didCallApi) {
        console.warn('هیچ مقصدی برای ذخیره‌سازی پیدا نشد (origin / id خالی است)');
        alert(
          'مقصد ذخیره‌سازی مشخص نیست (origin / id). لطفاً از مسیر صحیح وارد صفحه‌ساز شوید.'
        );
        return;
      }

      alert('محتوا با موفقیت ذخیره شد!');
    } catch (err) {
      console.error('خطا در ذخیره:', err);
      alert(
        'خطا در ذخیره محتوا: ' +
        (err?.response?.data?.message || err.message || '')
      );
    } finally {
      setSaving(false);
    }
  };


  const handleBack = () => {
    if (origin === 'articles') navigate('/articles');
    else if (origin === 'news') navigate('/news');
    else if (origin === 'pages') navigate('/pages');
    else navigate('/');
  };

  // ✅ اینجا Tailwind رو هم به پریویو اضافه می‌کنیم
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
  <title>${metaTitle}</title>
  <!-- Tailwind برای کلاس‌های utility -->
  <link rel="stylesheet" href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css">
  <!-- آیکن‌ها -->
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

  // ✅ اینجا هم Tailwind را برای فایل دانلودی اضافه می‌کنیم
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
  <title>${metaTitle}</title>
  <!-- Tailwind برای کلاس‌ها -->
  <link rel="stylesheet" href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css">
  <!-- آیکن‌ها -->
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
    a.download = `${metaSlug || 'page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeDevice = (device) => editor?.setDevice(device);

  return (
    <div
      className="h-screen flex flex-col font-lahzeh"
      style={{ margin: 0, padding: 0, overflow: 'hidden' }}
    >
      <TopBar
        title={metaTitle}
        slug={metaSlug}
        categoryId={metaCategoryId}
        categoryLabel={selectedCategoryLabel}       
        categoriesTree={categoriesTree}            
        loadingCategories={loadingCats}            
        onChangeTitle={setMetaTitle}
        onChangeSlug={setMetaSlug}
        onChangeCategoryId={setMetaCategoryId}
        featuredImage={featuredImage}
        onChangeFeaturedImage={setFeaturedImage}
        onBack={handleBack}
        saving={saving}
        onSave={handleSave}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onShowCode={handleShowCode}
        onDeviceChange={changeDevice}
        Icons={{
          ArrowLeft,
          Save,
          Eye,
          Code,
          Download,
          Monitor,
          Tablet,
          Smartphone,
        }}
      />

      <div
        className="flex-1 flex overflow-hidden"
        style={{ minHeight: 0, margin: 0, padding: 0 }}
        dir="rtl"
      >
        {/* فقط وقتی اسکریپت GrapesJS نیومده، کل ادیتور رو hide کن */}
        {!scriptsLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">در حال بارگذاری ویرایشگر...</p>
            </div>
          </div>
        ) : (
          <>
            {/* سایدبار راست */}
            <div
              className="bg-white border-l border-gray-200 flex flex-col"
              dir="rtl"
              style={{
                width: '320px',
                flexShrink: 0,
                minHeight: 0,
              }}
            >
              <div
                className="flex border-b border-gray-200 bg-gray-50"
                style={{ flexShrink: 0 }}
              >
                {/* تب‌ها همون قبلی‌ات باشن */}
                <button
                  onClick={() => setActiveTab('blocks')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all ${activeTab === 'blocks'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Box size={18} />
                  <span>بلوک‌ها</span>
                </button>
                <button
                  onClick={() => setActiveTab('styles')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all ${activeTab === 'styles'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Settings size={18} />
                  <span>استایل</span>
                </button>
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all ${activeTab === 'layers'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Layers size={18} />
                  <span>لایه‌ها</span>
                </button>
              </div>

              <div
                className="flex-1 overflow-y-auto"
                style={{ minHeight: 0 }}
              >
                <div
                  id="blocks-panel"
                  style={{ display: activeTab === 'blocks' ? 'block' : 'none' }}
                  className="p-4"
                />
                <div
                  style={{ display: activeTab === 'styles' ? 'block' : 'none' }}
                >
                  <div id="styles-panel" className="p-4" />
                  <div
                    id="traits-panel"
                    className="p-4 border-t border-gray-200"
                  />
                </div>
                <div
                  id="layers-panel"
                  style={{ display: activeTab === 'layers' ? 'block' : 'none' }}
                  className="p-4"
                />
              </div>
            </div>

            {/* کانواس اصلی */}
            <div
              className="flex-1"
              dir="ltr"
              style={{
                position: 'relative',
                minWidth: 0,
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                background: '#f9fafb',
              }}
            >
              {/* اوورلی لود محتوا (فقط وقتی از API می‌گیریم) */}
              {loadingContent && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/80">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3" />
                  <p className="text-gray-600 text-sm">در حال بارگذاری محتوا...</p>
                </div>
              )}

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
                  padding: 0,
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
          /* --- Soften Sidebar Typography (Overrides) --- */

/* تیترهای سکشن‌های Style Manager */
.gjs-sm-sector .gjs-sm-title {
  font-weight: 600 !important; /* قبلاً 800 بود */
}

/* لیبل‌ها (Style/Traits/Layers) */
.gjs-sm-label,
.gjs-trt-trait__label,
.gjs-sm-property .gjs-sm-label,
.gjs-label {
  font-weight: 600 !important; /* قبلاً 800 بود */
  color: #1f2937 !important;   /* کمی نرم‌تر از #111827 */
}

/* تیتر آیتم‌های لایه‌ها */
.gjs-layer-title {
  font-weight: 500 !important; /* قبلاً 600 بود */
}

/* لیبل بلوک‌ها در تب Blocks */
.gjs-block-label {
  font-weight: 500 !important; /* قبلاً 600 بود */
}

/* متن و اعداد داخل فیلدها */
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
select.gjs-field,
.gjs-field-colorp-c input[type="text"] {
  font-weight: 500 !important; /* قبلاً 700 بود */
  font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif !important; /* از monospace برگردونیم به sans */
}

/* خود آیکون/متن ابزارک تولبار ویرایش هم نرم‌تر شود */
.gjs-toolbar-item {
  font-weight: 500 !important;
}

/* اگر سرتیترها هنوز زیاد بولدن، این یکی هم کمک می‌کند */
.gjs-two-color,
.gjs-four-color,
.gjs-four-color-h:hover {
  font-weight: 500 !important;
}

  /* --- Styles tab only: make titles/labels bolder --- */
#styles-panel .gjs-sm-sector .gjs-sm-title {
  font-weight: 700 !important;        /* قبلاً 600 بود */
  color: #1f2937 !important;
}

#styles-panel .gjs-sm-label,
#styles-panel .gjs-label,
#styles-panel .gjs-trt-trait__label {
  font-weight: 600 !important;        /* کمی بولدتر از حالت فعلی */
  color: #111827 !important;
}

#traits-panel .gjs-trt-trait__label {
  font-weight: 600 !important;
}

/* خود مقادیر داخل اینپوت‌ها سبک‌تر بماند تا کنتراست تیتر/لیبل حفظ شود */
#styles-panel .gjs-sm-property input,
#styles-panel .gjs-sm-property select,
#traits-panel .gjs-trt-trait input,
#traits-panel .gjs-trt-trait select,
#traits-panel .gjs-trt-trait textarea {
  font-weight: 500 !important;
}

/* اگر به‌خاطر رندرینگ فونت نازک می‌افتد، اسمودینگ را برای این تب‌ها تغییر بده */
#styles-panel, #styles-panel * ,
#traits-panel, #traits-panel * {
  -webkit-font-smoothing: auto !important;
  -moz-osx-font-smoothing: auto !important;
  text-rendering: optimizeLegibility !important;
}
/* ---------- Make Style tab section titles clearly bolder ---------- */
/* === FORCE: Style tab sector titles heavier === */
#styles-panel .gjs-sm-sector .gjs-sm-title,
#styles-panel .gjs-sm-sector .gjs-sm-title .gjs-sm-title__label,
#styles-panel .gjs-sm-sector .gjs-sm-title * {
  font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif !important;
  font-weight: 800 !important; /* اگر زیاد شد 700 کن */
  color: #1f2937 !important;
  letter-spacing: 0 !important;
}

/* بعضی تم‌ها رنگ/وزن رو با این کلاس‌ها دوباره عوض می‌کنن؛ خنثی‌شون کن */
#styles-panel .gjs-two-color,
#styles-panel .gjs-four-color,
#styles-panel .gjs-four-color-h:hover {
  color: #1f2937 !important;
  font-weight: 800 !important;
}

/* موقع باز/بسته بودن سکشن هم همین وزن حفظ شود */
#styles-panel .gjs-sm-sector.gjs-open > .gjs-sm-title,
#styles-panel .gjs-sm-sector:not(.gjs-open) > .gjs-sm-title {
  font-weight: 800 !important;
}

/* اگر فونت‌وریشن روی وزن اثر می‌گذارد، این را هم بگذار */
#styles-panel .gjs-sm-sector .gjs-sm-title {
  font-variation-settings: "wght" 800 !important;
}
/* === Units badge inside number/integer inputs (px, %, rem, ...) === */
.gjs-field-integer,
.gjs-field-number {
  position: relative !important;
}

/* کمی اینپوت‌ها بزرگ‌تر بشن و جای badge هم باز بشه */
.gjs-field-integer input,
.gjs-field-number input {
  height: 42px !important;
  font-size: 15px !important;
  /* برای هر دو حالت RTL/LTR از ویژگی‌های منطقی استفاده می‌کنیم */
  padding-inline-start: 12px !important;  /* سمت شروع متن */
  padding-inline-end: 44px !important;    /* جا برای badge واحد */
}

/* خود باکس واحد رو ببریم گوشه‌ی اینپوت و ریزش کنیم */
.gjs-field-integer .gjs-field-units,
.gjs-field-number .gjs-field-units,
.gjs-input-unit,
.gjs-sm-unit,
.gjs-unit {
  position: absolute !important;
  inset-inline-end: 8px !important;      /* سمت انتهایی (در RTL می‌شود چپ) */
  top: 50% !important;
  transform: translateY(-50%) !important;
  z-index: 2 !important;
  height: 22px !important;
  min-width: 28px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  pointer-events: auto !important;
}

/* اگر واحد به صورت <select> رندر می‌شود */
.gjs-field-units select,
.gjs-input-unit select {
  height: 22px !important;
  min-width: 28px !important;
  padding: 0 4px !important;
  font-size: 11px !important;
  line-height: 1 !important;
  border: 1px solid #d1d5db !important;
  border-radius: 6px !important;
  background: #fff !important;
  appearance: none !important;
}

/* اگر بعضی تم‌ها به‌جای select متن ساده نشون می‌دن */
.gjs-field-units .gjs-unit,
.gjs-input-unit .gjs-unit {
  font-size: 11px !important;
  padding: 2px 6px !important;
  border: 1px solid #d1d5db !important;
  border-radius: 6px !important;
  background: #fff !important;
  line-height: 1 !important;
  height: 22px !important;
}

/* اطمینان از هم‌پوشانی نشدن (حل مشکل دو مستطیل روی هم) */
.gjs-field-integer .gjs-field-units,
.gjs-field-number .gjs-field-units {
  background: transparent !important;
  box-shadow: none !important;
}

/* اگر propertyهای ترکیبی مثل padding/margin هم input عددی دارند */
.gjs-sm-property .gjs-field-integer input,
.gjs-sm-property .gjs-field-number input {
  height: 40px !important;
  padding-inline-end: 44px !important;
}

/* === Toolbar روی کانواس کمی بزرگ‌تر و خوش‌دست‌تر === */
.gjs-toolbar {
  padding: 10px 12px !important;
  border-radius: 12px !important;
}

.gjs-toolbar-item {
  padding: 10px 12px !important;
  border-radius: 10px !important;
  font-weight: 500 !important;
}

.gjs-toolbar-item svg,
.gjs-toolbar-item i {
  width: 18px !important;
  height: 18px !important;
}

.gjs-field,
.gjs-sm-property,
.gjs-trt-trait {
  position: relative !important;
  overflow: visible !important;
}

      
      
      `}</style>
    </div>
  );
}

