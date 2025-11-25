// src/pageBuilder/PageBuilder.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import LinkModal from './components/LinkModal';
import useGrapesLoader from './hooks/useGrapesLoader';
import initEditor from './grapes/initEditor';
import { getSettings, updateSettings } from '../services/settingsService';
import TopBar from './components/TopBar';
import CodeModal from './components/CodeModal';
import ButtonModal from './components/ButtonModal';
import MediaModal from './components/MediaModal';

import {
  getArticleById,
  createArticle,
  updateArticle,
} from '../services/articlesService';
import {
  getNewsById,
  createNews,
  updateNews,
} from '../services/newsService';
import { getPageById, createPage, updatePage } from '../services/pagesService';
import { buildTree, getPathMap } from '../utils/categoryTree';
import { fetchArticleCategories } from '../services/articleCategoriesService';
import { fetchNewsCategories } from '../services/newsCategoriesService';

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
  const queryParentId = searchParams.get('parentId'); // 🆕 برای pages
  const queryTitle = searchParams.get('title') || 'بدون عنوان';
  const querySlug = searchParams.get('slug') || 'page';

  console.log('🔍 URL Params:', {
    origin,
    articleId,
    newsId,
    pageId,
    queryCategory,
    queryParentId,
    queryTitle,
    querySlug
  });

  const [metaTitle, setMetaTitle] = useState(queryTitle);
  const [metaSlug, setMetaSlug] = useState(querySlug);
  const [metaCategoryId, setMetaCategoryId] = useState(
    queryCategory ? Number(queryCategory) : undefined
  );
  const [metaParentId, setMetaParentId] = useState(queryParentId || ''); // 🆕

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
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const scriptsLoaded = useGrapesLoader();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkModalData, setLinkModalData] = useState({});
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [buttonModalData, setButtonModalData] = useState({});
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalData, setMediaModalData] = useState({ type: null });
  const [selectedMediaComponent, setSelectedMediaComponent] = useState(null);

  // بارگذاری فونت لحظه (اختیاری)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/fonts/lahzeh.css';
    document.head.appendChild(link);
  }, []);

  // ----------------- لود محتوا (مقاله / خبر / صفحه) -----------------
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
          // 🆕 چک کردن وضعیت کامنت
          try {
            const settings = await getSettings();
            const disabledList = Array.isArray(settings.disableCommentsForPages)
              ? settings.disableCommentsForPages
              : [];

            const itemIdentifier = item.slug || String(item.id);
            const isDisabled = disabledList.includes(itemIdentifier);
            setCommentsDisabled(isDisabled);
          } catch (err) {
            console.error('خطا در خواندن وضعیت کامنت:', err);
            setCommentsDisabled(false);
          }

          // 🆕 برای pages: parentId
          if (origin === 'pages') {
            setMetaParentId(item.parentId || '');
          } else {
            // برای articles / news: categoryId
            setMetaCategoryId(
              item.categoryId != null ? Number(item.categoryId) : metaCategoryId
            );
          }

          // تصویر شاخص (فقط برای articles/news)
          if (origin !== 'pages') {
            let fi = item.featuredImage || null;
            if (item.content) {
              if (typeof item.content === 'object' && item.content.featuredImage) {
                fi = item.content.featuredImage || fi;
              } else if (typeof item.content === 'string') {
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
            const styleMatch = contentStr.match(
              /<style[^>]*>([\s\S]*?)<\/style>/i
            );
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
  }, [origin, articleId, newsId, pageId, queryTitle, querySlug, metaCategoryId]);

  // ----------------- init GrapesJS -----------------
  useEffect(() => {
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

    return () => {
      try {
        e.destroy();
      } catch (err) {
        console.error('Error destroying editor', err);
      }
    };
  }, [scriptsLoaded]);
  // useEffect مربوط به event لینک
  // ----------------- لیسنر مدال لینک -----------------
  useEffect(() => {
    if (!editor) return;

    const handleOpenLinkModal = (event) => {
      let component = event.detail.component;
      if (!component) return;

      // اگر روی متن داخل لینک کلیک شده، نزدیک‌ترین <a> رو پیدا کن
      let linkComponent = component;
      while (linkComponent && linkComponent.get('tagName') !== 'a') {
        linkComponent = linkComponent.parent();
      }

      // اگر اصلاً لینک نداریم، همون کامپوننت انتخاب‌شده رو استفاده کن
      const targetComponent = linkComponent || component;

      setSelectedComponent(targetComponent);

      const attrs = targetComponent.getAttributes() || {};
      const styles = targetComponent.getStyle() || {};

      // اگر لینک یک بچه متنی دارد (span/p/...) رنگ و underline را از آن بخوان
      let textColor = styles.color || '#3b82f6';
      let underline = false;

      if (targetComponent.components().length > 0) {
        const child = targetComponent.components().at(0);
        const childStyles = child.getStyle() || {};
        textColor = childStyles.color || textColor;
        const td = String(childStyles['text-decoration'] || '');
        underline = td.includes('underline');
      } else {
        const td = String(styles['text-decoration'] || '');
        underline = td.includes('underline');
      }

      const rel = attrs.rel || '';
      const hoverColorAttr = attrs['data-hover-color'] || '#1d4ed8';
      const hoverScaleAttr = attrs['data-hover-scale'] || '1';

      const isTextElement = true; // فعلاً همه لینک‌های ما متنی هستند

      setLinkModalData({
        url: attrs.href || '',
        target: attrs.target || '_self',
        nofollow: rel.includes('nofollow'),
        noopener: rel.includes('noopener'),
        color: textColor,
        underline,
        hoverScale: hoverScaleAttr === '1',
        hoverColor: hoverColorAttr,
        isText: isTextElement,
      });

      setShowLinkModal(true);
    };

    window.addEventListener('grapes:open-link-modal', handleOpenLinkModal);
    return () => {
      window.removeEventListener('grapes:open-link-modal', handleOpenLinkModal);
    };
  }, [editor]);


  // ✅ useEffect دوم: Command دکمه
  useEffect(() => {
    if (!editor) return;

    editor.Commands.add('open-button-modal', {
      run(editor, sender, opts = {}) {
        const selected = editor.getSelected();
        if (!selected) {
          alert('لطفاً ابتدا یک دکمه را انتخاب کنید');
          return;
        }

        setSelectedComponent(selected);

        const attrs = selected.getAttributes() || {};
        const styles = selected.getStyle() || {};

        setButtonModalData({
          href: attrs.href || '',
          target: attrs.target || '_self',
          linkType: attrs['data-link-type'] || 'url',
          anchorId: attrs['data-anchor-id'] || '',
          bg: styles['background-color'] || '#4f46e5',
          color: styles.color || '#ffffff',
          borderColor: styles['border-color'] || '',
          hoverBg: attrs['data-hover-bg'] || '#4338ca',
          hoverColor: attrs['data-hover-color'] || '#ffffff',
          hoverBorderColor: attrs['data-hover-border-color'] || styles['border-color'] || '',
        });

        setShowButtonModal(true);
      },
    });
  }, [editor]);

  // 🆕 باز شدن مدال مدیا از سمت GrapesJS
  useEffect(() => {
    if (!editor) return;

    const handleOpenMediaModal = (event) => {
      const { type, component } = event.detail || {};
      if (!component) return;

      setSelectedMediaComponent(component);
      setMediaModalData({ type: type || 'video' });
      setShowMediaModal(true);
    };

    window.addEventListener('grapes:open-media-modal', handleOpenMediaModal);

    return () => {
      window.removeEventListener('grapes:open-media-modal', handleOpenMediaModal);
    };
  }, [editor]);

  // ----------------- اعمال content روی ادیتور -----------------
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

  // ----------------- لود دسته‌بندی‌ها (مقاله + خبر) -----------------
  useEffect(() => {
    // فقط برای articles و news نیاز به دسته‌بندی داریم
    if (origin !== 'articles' && origin !== 'news') return;

    async function loadCats() {
      setLoadingCats(true);
      try {
        const flat =
          origin === 'articles'
            ? await fetchArticleCategories()
            : await fetchNewsCategories();

        setCategoriesFlat(flat);
        setCategoriesTree(buildTree(flat));
      } catch (e) {
        console.error(
          `خطا در دریافت دسته‌بندی‌های ${origin} برای PageBuilder:`,
          e
        );
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

  // ----------------- ذخیره محتوا -----------------
  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);

    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      // 🆕 به‌روز کردن لیست کامنت‌های غیرفعال
      try {
        const currentSettings = await getSettings();
        let disabledList = Array.isArray(currentSettings.disableCommentsForPages)
          ? [...currentSettings.disableCommentsForPages]
          : [];

        // شناسه محتوا (ترجیحاً slug)
        const itemIdentifier = metaSlug || (
          origin === 'articles' ? articleId :
            origin === 'news' ? newsId :
              origin === 'pages' ? pageId : null
        );

        if (itemIdentifier) {
          if (commentsDisabled) {
            // اضافه کن به لیست (اگه نبود)
            if (!disabledList.includes(itemIdentifier)) {
              disabledList.push(itemIdentifier);
            }
          } else {
            // حذف کن از لیست
            disabledList = disabledList.filter(id => id !== itemIdentifier);
          }

          // ذخیره settings
          await updateSettings({
            ...currentSettings,
            disableCommentsForPages: disabledList,
          });
        }
      } catch (err) {
        console.error('خطا در به‌روز کردن وضعیت کامنت:', err);
      }
      let didCallApi = false;

      // --- مقالات ---
      if (origin === 'articles') {
        const contentForBackend = {
          html,
          css,
          featuredImage: featuredImage || null,
        };

        const payload = {
          title: metaTitle,
          slug: metaSlug,
          categoryId: metaCategoryId,
          content: contentForBackend,
          featuredImage: featuredImage || null,
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
        const contentForBackend = {
          html,
          css,
          featuredImage: featuredImage || null,
        };

        const payload = {
          title: metaTitle,
          slug: metaSlug,
          categoryId: metaCategoryId,
          content: contentForBackend,
          featuredImage: featuredImage || null,
        };

        if (newsId) {
          await updateNews(newsId, payload);
          didCallApi = true;
        } else {
          const created = await createNews(payload);
          didCallApi = true;

          if (created?.id) {
            navigate(
              `/builder?origin=news` +
              `&newsId=${created.id}` +
              `&category=${metaCategoryId || ''}` +
              `&title=${encodeURIComponent(metaTitle)}` +
              `&slug=${encodeURIComponent(metaSlug)}`,
              { replace: true }
            );
          }
        }
      }

      // --- صفحات ---
      else if (origin === 'pages') {
        const contentForBackend = {
          html,
          css,
        };

        const payload = {
          title: metaTitle,
          slug: metaSlug,
          content: contentForBackend,
        };

        console.log('🔍 metaParentId قبل از چک:', metaParentId, typeof metaParentId);

        // ✅ فقط اگر parentId واقعاً مقدار داشت، اضافه کن
        if (metaParentId && String(metaParentId).trim() !== '') {
          payload.parentId = String(metaParentId).trim();
          console.log('✅ parentId به payload اضافه شد:', payload.parentId);
        } else {
          console.log('⏭️ parentId اضافه نشد به payload');
        }

        console.log('📤 Final payload برای Pages:', JSON.stringify(payload, null, 2));

        if (pageId) {
          await updatePage(pageId, payload);
          didCallApi = true;
        } else {
          const created = await createPage(payload);
          didCallApi = true;

          if (created?.id) {
            navigate(
              `/builder?origin=pages` +
              `&pageId=${created.id}` +
              `&title=${encodeURIComponent(metaTitle)}` +
              `&slug=${encodeURIComponent(metaSlug)}` +
              (metaParentId ? `&parentId=${encodeURIComponent(metaParentId)}` : ''),
              { replace: true }
            );
          }
        }
      }

      if (!didCallApi) {
        console.warn(
          'هیچ مقصدی برای ذخیره‌سازی پیدا نشد (origin / id خالی است)'
        );
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

  const handleSaveLink = (formData) => {
    if (!selectedComponent || !editor) {
      console.error('کامپوننت یا ادیتور انتخاب نشده است');
      return;
    }

    console.log('💾 ذخیره لینک با داده:', formData);

    try {
      const {
        url,
        target,
        nofollow,
        noopener,
        color,
        underline,
        hoverScale,
        hoverColor,
        isText,
      } = formData;

      // ساخت rel attribute
      const relParts = [];
      if (nofollow) relParts.push('nofollow');
      if (noopener) relParts.push('noopener');
      const rel = relParts.join(' ');

      let selected = selectedComponent;
      let linkComponent;

      // اگر خود المان <a> است، از خودش استفاده کن
      if (selected.get('tagName') === 'a') {
        linkComponent = selected;
      } else {
        // اگر نیست، ببین آیا والد لینک دارد
        let parentLink = selected;
        while (parentLink && parentLink.get('tagName') !== 'a') {
          parentLink = parentLink.parent();
        }

        if (parentLink) {
          linkComponent = parentLink;
        } else {
          // هیچ لینکی وجود ندارد → لینک جدید بساز
          const parent = selected.parent();
          const index = selected.index();

          linkComponent = parent.append(
            {
              type: 'link',
              components: [selected.clone()],
            },
            { at: index },
          )[0];

          // المان اصلی را حذف کن
          selected.remove();
        }
      }

      // آپدیت attributes لینک
      const linkAttrs = {
        href: url,
        target: target || '_self',
      };

      if (rel) {
        linkAttrs.rel = rel;
      } else {
        // اگر قبلاً rel داشت و الان لازم نیست
        linkComponent.removeAttributes('rel');
      }

      // ذخیره تنظیمات ظاهری روی خود <a> برای دفعه‌های بعد
      linkAttrs['data-hover-color'] = hoverColor || '#1d4ed8';
      linkAttrs['data-hover-scale'] = hoverScale ? '1' : '0';
      linkAttrs['data-color'] = color || '#3b82f6';
      linkAttrs['data-underline'] = underline ? '1' : '0';

      linkComponent.addAttributes(linkAttrs);

      // استایل‌های متن داخل لینک
      if (isText) {
        let textElement;

        if (linkComponent.components().length > 0) {
          textElement = linkComponent.components().at(0);
        } else {
          // اگر داخل لینک خالی بود، یک span بساز
          textElement = linkComponent.append({
            tagName: 'span',
            type: 'text',
            content: linkComponent.get('content') || 'لینک',
          })[0];
        }

        textElement.addStyle({
          color: color || '#3b82f6',
          textDecoration: underline ? 'underline' : 'none',
          transition: 'all 0.2s ease',
          display: 'inline-block',          // ✅ که scale از وسط باشه، نه از کنار
          transformOrigin: 'center center', // ✅ نقطه‌ی اسکیل از وسط
        });

        // استایل هاور برای متن
        const componentId = textElement.getId();
        if (componentId) {
          const currentCss = editor.getCss();

          const hoverRule = `
#${componentId}:hover {
  color: ${hoverColor || '#1d4ed8'} !important;
  ${hoverScale ? 'transform: scale(1.05);' : ''}
}
`;

          if (!currentCss.includes(`#${componentId}:hover`)) {
            editor.setStyle(currentCss + hoverRule);
          }
        }
      }

      // انتخاب خود لینک
      editor.select(linkComponent);

      console.log('✅ لینک با موفقیت ذخیره شد');
    } catch (error) {
      console.error('❌ خطا در ذخیره لینک:', error);
      alert('خطا در ذخیره لینک. لطفاً دوباره تلاش کنید.');
    } finally {
      setShowLinkModal(false);
      setSelectedComponent(null);
      setLinkModalData({});
    }
  };


  const handleSaveButton = (formData) => {
    if (!selectedComponent || !editor) {
      console.error('کامپوننت یا ادیتور برای دکمه انتخاب نشده');
      return;
    }

    const {
      href,
      target,
      linkType,
      anchorId,
      bg,
      color,
      borderColor,
      hoverBg,
      hoverColor,
      hoverBorderColor,
    } = formData;

    const btn = selectedComponent;

    // تنظیم attributes لینک
    const attrs = {
      target: target || '_self',
      'data-link-type': linkType,
      'data-anchor-id': linkType === 'anchor' ? anchorId : '',
      'data-hover-bg': hoverBg,
      'data-hover-color': hoverColor,
      'data-hover-border-color': hoverBorderColor,
    };

    if (linkType === 'none') {
      attrs.href = '#';
    } else if (linkType === 'url') {
      attrs.href = href || '#';
    } else if (linkType === 'anchor') {
      attrs.href = anchorId ? `#${anchorId}` : '#';
    }

    btn.addAttributes(attrs);

    // ✅ پاک کردن background و background-image قبلی (برای دکمه‌های gradient)
    btn.removeStyle('background');
    btn.removeStyle('background-image');

    // استایل نرمال دکمه
    btn.addStyle({
      'background-color': bg,
      'color': color,
      ...(borderColor
        ? {
          'border-color': borderColor,
          'border-style': btn.getStyle('border-style') || 'solid',
          'border-width': btn.getStyle('border-width') || '1px',
        }
        : {}),
      'transition': 'all 0.2s ease',
    });

    // استایل هاور (CSS اضافه به ادیتور)
    const componentId = btn.getId();
    if (componentId) {
      const currentCss = editor.getCss();
      const hoverRule = `
      #${componentId}:hover {
        background-color: ${hoverBg} !important;
        color: ${hoverColor} !important;
        ${hoverBorderColor ? `border-color: ${hoverBorderColor} !important;` : ''}
        transform: scale(1.02);
      }
    `;

      if (!currentCss.includes(`#${componentId}:hover`)) {
        editor.setStyle(currentCss + hoverRule);
      }
    }

    editor.select(btn);

    setShowButtonModal(false);
    setSelectedComponent(null);
    setButtonModalData({});
  };
  const handleSaveMedia = (data) => {
    if (!selectedMediaComponent || !editor) {
      console.error('هیچ کامپوننت مدیایی انتخاب نشده');
      return;
    }

    const { type, url, fileName, fileSize } = data;
    const component = selectedMediaComponent;

    // 🆕 کمک: اگر کاربر کل کد embed داد، src رو جدا کن
    const extractIframeSrc = (raw) => {
      if (!raw) return '';
      const trimmed = raw.trim();

      // اگر فقط یه لینک ساده است
      if (!trimmed.includes('<')) return trimmed;

      // اگر HTML کامل embed است، از داخلش src رو پیدا کن
      const match = trimmed.match(/src=["']([^"']+)["']/i);
      return match ? match[1] : trimmed;
    };

    let html = '';
    let safeUrl = url || '';

    // 🖼 تصویر
    if (type === 'image') {
      if (!safeUrl) return;

      if (component.get('tagName') === 'img') {
        component.addAttributes({ src: safeUrl });

        const currentStyle = component.getStyle() || {};
        if (!currentStyle.width && !currentStyle.height) {
          component.addStyle({
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          });
        }

        editor.select(component);
      } else {
        html = `
        <img 
          src="${safeUrl}" 
          style="
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 16px;
          "
          data-gjs-type="image"
        />
      `;
      }
    }

    // 🎬 ویدیو
    else if (type === 'video') {
      html = `
      <video 
        controls 
        src="${safeUrl}"
        style="
          width: 100%; 
          max-width: 800px; 
          height: auto; 
          border-radius: 16px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.15); 
          display: block; 
          margin: 20px auto; 
          background: #000;
        "
        data-gjs-type="video"
      >
        مرورگر شما از ویدیو پشتیبانی نمی‌کند.
      </video>
    `;
    }

    // 🎧 صوت
    else if (type === 'audio') {
      html = `
      <audio 
        controls 
        src="${safeUrl}"
        style="
          width: 100%; 
          max-width: 600px; 
          display: block; 
          margin: 20px auto; 
          border-radius: 12px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        "
        data-gjs-type="audio"
      >
        مرورگر شما از صوت پشتیبانی نمی‌کند.
      </audio>
    `;
    }

    // 📁 فایل
    else if (type === 'file') {
      const prettyName = fileName || safeUrl.split('/').pop() || 'فایل';
      const sizeMb = fileSize ? (fileSize / 1024 / 1024).toFixed(2) : '';
      const sizeText = sizeMb ? `حجم: ${sizeMb} MB` : '';

      html = `
      <div 
        style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          padding: 24px 32px; 
          border-radius: 16px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.15); 
          display: inline-flex; 
          align-items: center; 
          gap: 16px; 
          margin: 20px 0; 
          max-width: 500px;
        "
        data-gjs-type="file-download-box"
      >
        <div style="
          width: 48px; 
          height: 48px; 
          background: rgba(255,255,255,0.2); 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0;
        ">
          <i class="fas fa-file" style="font-size: 24px; color: white;"></i>
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0 0 4px 0; color: white; font-size: 16px; font-weight: 600;">${prettyName}</h4>
          <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 13px;">${sizeText}</p>
        </div>
        <a 
          href="${safeUrl}" 
          download="${prettyName}" 
          style="
            padding: 10px 20px; 
            background: white; 
            color: #667eea; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 14px; 
            flex-shrink: 0;
          "
        >
          دانلود
        </a>
      </div>
    `;
    }

    // 🌐 آیفریم (آپارات / یوتیوب / هر embed دیگری)
    else if (type === 'iframe') {
      const finalSrc = extractIframeSrc(safeUrl);

      if (!finalSrc) {
        alert('آدرس آیفریم معتبر نیست');
        return;
      }

      html = `
      <div 
        style="
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          margin: 20px 0;
        "
        data-gjs-type="iframe-wrapper"
      >
        <iframe
          src="${finalSrc}"
          style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
          "
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
        ></iframe>
      </div>
    `;
    }

    // ✅ جایگزینی placeholder با HTML نهایی
    if (html) {
      const newComponents = component.replaceWith(html);
      if (newComponents && newComponents[0] && editor) {
        editor.select(newComponents[0]);
      }
    }

    setShowMediaModal(false);
    setSelectedMediaComponent(null);
    setMediaModalData({ type: null });
  };




  const handleBack = () => {
    if (origin === 'articles') navigate('/articles');
    else if (origin === 'news') navigate('/news');
    else if (origin === 'pages') navigate('/pages');
    else navigate('/');
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

    // استایل‌های اضافی برای نمایش بهتر
    const additionalStyles = `
    /* استایل‌های متنی */
    b, strong { font-weight: bold !important; }
    i, em { font-style: italic !important; }
    u { text-decoration: underline !important; }
    strike { text-decoration: line-through !important; }
    
    /* استایل‌های تراز تصویر */
    img[style*="margin-right: 0"] { float: right !important; }
    img[style*="margin-right: auto"] { float: none !important; margin: 0 auto !important; display: block !important; }
    img[style*="margin-left: 0"] { float: left !important; }
    
    /* استایل‌های عمومی */
    body { 
      font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif !important;
      direction: rtl !important;
      text-align: right !important;
      padding: 20px !important;
    }
  `;

    const fullHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${metaTitle}</title>
  <link rel="stylesheet" href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
${lahzehFont}
${css}
${additionalStyles}
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
  <title>${metaTitle}</title>
  <link rel="stylesheet" href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css">
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
        parentId={metaParentId} // 🆕
        origin={origin} // 🆕
        onChangeTitle={setMetaTitle}
        onChangeSlug={setMetaSlug}
        onChangeCategoryId={setMetaCategoryId}
        onChangeParentId={setMetaParentId} // 🆕
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
      {/* 🆕 چک‌باکس کامنت */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={commentsDisabled}
            onChange={(e) => setCommentsDisabled(e.target.checked)}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">
            غیرفعال کردن کامنت‌ها برای این صفحه
          </span>
        </label>
      </div>
      <div
        className="flex-1 flex overflow-hidden"
        style={{ minHeight: 0, margin: 0, padding: 0 }}
        dir="rtl"
      >
        {!scriptsLoaded ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">در حال بارگذاری ویرایشگر...</p>
            </div>
          </div>
        ) : (
          <>
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

              <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
                <div
                  id="blocks-panel"
                  style={{ display: activeTab === 'blocks' ? 'block' : 'none' }}
                  className="p-4"
                />
                <div
                  style={{ display: activeTab === 'styles' ? 'block' : 'none' }}
                >
                  <div id="styles-panel" className="p-4" />
                  {/* <div
                    id="traits-panel"
                    className="p-4 border-t border-gray-200"
                  /> */}
                </div>
                <div
                  id="layers-panel"
                  style={{ display: activeTab === 'layers' ? 'block' : 'none' }}
                  className="p-4"
                />
              </div>
            </div>

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
              {loadingContent && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/80">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3" />
                  <p className="text-gray-600 text-sm">
                    در حال بارگذاری محتوا...
                  </p>
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
      <ButtonModal
        open={showButtonModal}
        onClose={() => setShowButtonModal(false)}
        onSave={handleSaveButton}
        initialData={buttonModalData}
      />

      <LinkModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSave={handleSaveLink}
        initialData={linkModalData}
      />
      <MediaModal
        open={showMediaModal}
        onClose={() => {
          setShowMediaModal(false);
          setSelectedMediaComponent(null);
          setMediaModalData({ type: null });
        }}
        onSave={handleSaveMedia}
        initialData={mediaModalData}
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
/* Asset Manager - نمایش بهتر ویدیو و فایل */
.gjs-am-asset[data-type="video"]::before {
  content: "🎬";
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(79, 70, 229, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1;
}

.gjs-am-asset[data-type="audio"]::before {
  content: "🎵";
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1;
}

.gjs-am-asset[data-type="document"]::before {
  content: "📎";
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(245, 87, 108, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1;
}
      /* === Toolbar روی کانواس کمی بزرگ‌تر و خوش‌دست‌تر === */
.gjs-toolbar {
  padding: 10px 12px !important;
  border-radius: 12px !important;
  background: white !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
  gap: 6px !important;
  display: flex !important;
}

.gjs-toolbar-item {
  padding: 10px 12px !important;
  border-radius: 10px !important;
  font-weight: 500 !important;
  transition: all 0.2s !important;
  background: transparent !important;
  cursor: pointer !important;
}

.gjs-toolbar-item:hover {
  background: #eef2ff !important;
  color: #4f46e5 !important;
  transform: scale(1.05) !important;
}

.gjs-toolbar-item svg,
.gjs-toolbar-item i,
.gjs-toolbar-item .fa {
  width: 18px !important;
  height: 18px !important;
  font-size: 16px !important;
}
  /* === Toolbar یکپارچه و زیبا === */
.gjs-toolbar {
  padding: 8px 10px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
  gap: 6px !important;
  display: flex !important;
  border: 2px solid rgba(255,255,255,0.1) !important;
  backdrop-filter: blur(10px) !important;
}

.gjs-toolbar-item {
  padding: 10px 12px !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  border: none !important;
  font-size: 14px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.gjs-toolbar-item:hover {
  transform: scale(1.08) translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(255,255,255,0.2) !important;
  filter: brightness(1.2) !important;
}

.gjs-toolbar-item:active {
  transform: scale(0.95) !important;
}

.gjs-toolbar-item svg,
.gjs-toolbar-item i,
.gjs-toolbar-item .fa {
  width: 18px !important;
  height: 18px !important;
  font-size: 16px !important;
  pointer-events: none !important;
}

/* مخفی کردن نوار RTE پیش‌فرض */
.gjs-rte-toolbar {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* اطمینان از عدم نمایش نوار دوم */
.gjs-rte-actionbar,
.gjs-rte-action {
  display: none !important;
}

/* رفع مشکل نمایش تولبار */
.gjs-toolbar {
  display: flex !important;
  flex-wrap: nowrap !important;
  gap: 4px !important;
}

.gjs-toolbar-item {
  flex-shrink: 0 !important;
  min-width: 36px !important;
  height: 36px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* رفع مشکل مدال */
.gjs-mdl-dialog {
  z-index: 10000 !important;
}

/* رفع مشکل انتخاب متن */
.gjs-rte-toolbar {
  display: none !important;
}
      


      `}</style>
    </div>
  );
}



