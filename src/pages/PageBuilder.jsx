import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save, Eye, Code, Download, Monitor, Tablet, Smartphone } from 'lucide-react';

export default function PageBuilder({ slug, onBack }) {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('styles');

  useEffect(() => {
    const loadGrapesJS = async () => {
      if (window.grapesjs) {
        setScriptsLoaded(true);
        return;
      }

      if (!document.querySelector('link[href*="grapes.min.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
        document.head.appendChild(cssLink);
      }

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

    const grapesEditor = window.grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: 'auto',
      storageManager: false,
      
      plugins: ['gjs-preset-webpage', 'gjs-blocks-basic'],
      pluginsOpts: {
        'gjs-preset-webpage': {
          blocks: [],
        },
        'gjs-blocks-basic': {
          blocks: [],
        }
      },

      canvas: {
        styles: ['https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css'],
      },

      deviceManager: {
        devices: [
          { id: 'desktop', name: 'Desktop', width: '' },
          { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
          { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '768px' },
        ],
      },

      blockManager: {
        appendTo: '#blocks-panel',
      },
      
      layerManager: {
        appendTo: '#layers-panel',
      },
      
      styleManager: {
        appendTo: '#styles-panel',
        sectors: [
          {
            name: '📐 ابعاد و فاصله',
            open: true,
            properties: [
              {
                name: 'عرض',
                property: 'width',
                type: 'select',
                defaults: 'auto',
                list: [
                  { value: 'auto', name: 'خودکار' },
                  { value: '100%', name: '100%' },
                  { value: '75%', name: '75%' },
                  { value: '50%', name: '50%' },
                  { value: '25%', name: '25%' },
                ],
              },
              {
                name: 'ارتفاع',
                property: 'height',
                type: 'select',
                defaults: 'auto',
                list: [
                  { value: 'auto', name: 'خودکار' },
                  { value: '100px', name: '100 پیکسل' },
                  { value: '200px', name: '200 پیکسل' },
                  { value: '300px', name: '300 پیکسل' },
                  { value: '400px', name: '400 پیکسل' },
                ],
              },
              {
                name: 'فاصله داخلی',
                property: 'padding',
                type: 'composite',
                properties: [
                  { name: 'بالا', property: 'padding-top', type: 'integer', units: ['px'], defaults: '0' },
                  { name: 'راست', property: 'padding-right', type: 'integer', units: ['px'], defaults: '0' },
                  { name: 'پایین', property: 'padding-bottom', type: 'integer', units: ['px'], defaults: '0' },
                  { name: 'چپ', property: 'padding-left', type: 'integer', units: ['px'], defaults: '0' },
                ],
              },
              {
                name: 'فاصله خارجی',
                property: 'margin',
                type: 'composite',
                properties: [
                  { name: 'بالا', property: 'margin-top', type: 'integer', units: ['px'], defaults: '0' },
                  { name: 'راست', property: 'margin-right', type: 'integer', units: ['px'], defaults: '0' },
                  { name: 'پایین', property: 'margin-bottom', type: 'integer', units: ['px'], defaults: '0' },
                  { name: 'چپ', property: 'margin-left', type: 'integer', units: ['px'], defaults: '0' },
                ],
              },
            ],
          },
          {
            name: '✍️ تنظیمات متن',
            open: true,
            properties: [
              {
                name: 'اندازه فونت',
                property: 'font-size',
                type: 'select',
                defaults: '16px',
                list: [
                  { value: '12px', name: '12px - خیلی کوچک' },
                  { value: '14px', name: '14px - کوچک' },
                  { value: '16px', name: '16px - معمولی' },
                  { value: '18px', name: '18px - متوسط' },
                  { value: '20px', name: '20px - بزرگ' },
                  { value: '24px', name: '24px - خیلی بزرگ' },
                  { value: '32px', name: '32px - عنوان' },
                  { value: '48px', name: '48px - عنوان بزرگ' },
                ],
              },
              {
                name: 'ضخامت فونت',
                property: 'font-weight',
                type: 'select',
                defaults: '400',
                list: [
                  { value: '300', name: 'نازک' },
                  { value: '400', name: 'معمولی' },
                  { value: '500', name: 'متوسط' },
                  { value: '600', name: 'نیمه‌بولد' },
                  { value: '700', name: 'بولد' },
                  { value: '800', name: 'خیلی بولد' },
                ],
              },
              {
                name: 'رنگ متن',
                property: 'color',
                type: 'color',
                defaults: '#333333',
              },
              {
                name: 'تراز متن',
                property: 'text-align',
                type: 'radio',
                defaults: 'right',
                list: [
                  { value: 'right', title: 'راست' },
                  { value: 'center', title: 'وسط' },
                  { value: 'left', title: 'چپ' },
                  { value: 'justify', title: 'جاستیفای' },
                ],
              },
              {
                name: 'تزیین متن',
                property: 'text-decoration',
                type: 'select',
                defaults: 'none',
                list: [
                  { value: 'none', name: 'بدون تزیین' },
                  { value: 'underline', name: 'خط زیر' },
                  { value: 'line-through', name: 'خط خورده' },
                  { value: 'overline', name: 'خط بالا' },
                ],
              },
              {
                name: 'شیب متن',
                property: 'font-style',
                type: 'select',
                defaults: 'normal',
                list: [
                  { value: 'normal', name: 'عادی' },
                  { value: 'italic', name: 'کج (Italic)' },
                  { value: 'oblique', name: 'شیب‌دار' },
                ],
              },
              {
                name: 'فاصله خطوط',
                property: 'line-height',
                type: 'select',
                defaults: '1.5',
                list: [
                  { value: '1', name: '1 - فشرده' },
                  { value: '1.2', name: '1.2' },
                  { value: '1.5', name: '1.5 - معمولی' },
                  { value: '1.8', name: '1.8' },
                  { value: '2', name: '2 - گشاد' },
                  { value: '2.5', name: '2.5 - خیلی گشاد' },
                ],
              },
              {
                name: 'فاصله حروف',
                property: 'letter-spacing',
                type: 'integer',
                units: ['px'],
                defaults: '0',
                min: -5,
                max: 20,
              },
            ],
          },
          {
            name: '🎨 پس‌زمینه',
            open: false,
            properties: [
              {
                name: 'رنگ پس‌زمینه',
                property: 'background-color',
                type: 'color',
                defaults: 'transparent',
              },
              {
                name: 'تصویر پس‌زمینه',
                property: 'background-image',
                type: 'file',
                defaults: 'none',
              },
              {
                name: 'اندازه پس‌زمینه',
                property: 'background-size',
                type: 'select',
                defaults: 'cover',
                list: [
                  { value: 'auto', name: 'خودکار' },
                  { value: 'cover', name: 'پوشش کامل' },
                  { value: 'contain', name: 'نمایش کامل' },
                ],
              },
              {
                name: 'موقعیت پس‌زمینه',
                property: 'background-position',
                type: 'select',
                defaults: 'center center',
                list: [
                  { value: 'top left', name: 'بالا چپ' },
                  { value: 'top center', name: 'بالا وسط' },
                  { value: 'top right', name: 'بالا راست' },
                  { value: 'center left', name: 'وسط چپ' },
                  { value: 'center center', name: 'وسط وسط' },
                  { value: 'center right', name: 'وسط راست' },
                  { value: 'bottom left', name: 'پایین چپ' },
                  { value: 'bottom center', name: 'پایین وسط' },
                  { value: 'bottom right', name: 'پایین راست' },
                ],
              },
            ],
          },
          {
            name: '🔲 حاشیه و سایه',
            open: false,
            properties: [
              {
                name: 'گردی گوشه‌ها',
                property: 'border-radius',
                type: 'select',
                defaults: '0px',
                list: [
                  { value: '0px', name: 'بدون گردی' },
                  { value: '4px', name: '4px - کم' },
                  { value: '8px', name: '8px - متوسط' },
                  { value: '12px', name: '12px - زیاد' },
                  { value: '16px', name: '16px - خیلی زیاد' },
                  { value: '50%', name: '50% - دایره' },
                ],
              },
              {
                name: 'حاشیه',
                property: 'border',
                type: 'composite',
                properties: [
                  {
                    name: 'عرض',
                    property: 'border-width',
                    type: 'integer',
                    units: ['px'],
                    defaults: '0',
                  },
                  {
                    name: 'نوع',
                    property: 'border-style',
                    type: 'select',
                    defaults: 'solid',
                    list: [
                      { value: 'none', name: 'ندارد' },
                      { value: 'solid', name: 'خط پیوسته' },
                      { value: 'dashed', name: 'خط چین' },
                      { value: 'dotted', name: 'نقطه چین' },
                    ],
                  },
                  {
                    name: 'رنگ',
                    property: 'border-color',
                    type: 'color',
                    defaults: '#000000',
                  },
                ],
              },
              {
                name: 'سایه جعبه',
                property: 'box-shadow',
                type: 'select',
                defaults: 'none',
                list: [
                  { value: 'none', name: 'بدون سایه' },
                  { value: '0 1px 3px rgba(0,0,0,0.1)', name: 'سایه کم' },
                  { value: '0 4px 6px rgba(0,0,0,0.1)', name: 'سایه متوسط' },
                  { value: '0 10px 25px rgba(0,0,0,0.15)', name: 'سایه زیاد' },
                  { value: '0 20px 40px rgba(0,0,0,0.2)', name: 'سایه خیلی زیاد' },
                ],
              },
            ],
          },
          {
            name: '📍 موقعیت و نمایش',
            open: false,
            properties: [
              {
                name: 'نوع نمایش',
                property: 'display',
                type: 'select',
                defaults: 'block',
                list: [
                  { value: 'block', name: 'بلوکی' },
                  { value: 'inline-block', name: 'درون خطی-بلوکی' },
                  { value: 'inline', name: 'درون خطی' },
                  { value: 'flex', name: 'فلکس' },
                  { value: 'grid', name: 'گرید' },
                  { value: 'none', name: 'مخفی' },
                ],
              },
              {
                name: '🎯 قرارگیری در صفحه',
                property: 'margin',
                type: 'radio',
                defaults: '',
                list: [
                  { value: '0 auto', name: 'وسط صفحه 🎯', title: 'وسط افقی' },
                  { value: '0', name: 'پیش‌فرض', title: 'حالت عادی' },
                  { value: '0 0 0 auto', name: 'سمت چپ', title: 'چپ صفحه' },
                  { value: '0 auto 0 0', name: 'سمت راست', title: 'راست صفحه' },
                ],
              },
              {
                name: 'موقعیت',
                property: 'position',
                type: 'select',
                defaults: 'static',
                list: [
                  { value: 'static', name: 'استاتیک' },
                  { value: 'relative', name: 'نسبی' },
                  { value: 'absolute', name: 'مطلق' },
                  { value: 'fixed', name: 'ثابت' },
                  { value: 'sticky', name: 'چسبان' },
                ],
              },
              {
                name: 'شفافیت',
                property: 'opacity',
                type: 'slider',
                defaults: '1',
                min: 0,
                max: 1,
                step: 0.1,
              },
            ],
          },
          {
            name: '🎯 تراز و چیدمان',
            open: false,
            properties: [
              {
                name: 'تراز افقی محتوا',
                property: 'justify-content',
                type: 'radio',
                defaults: 'flex-start',
                list: [
                  { value: 'flex-start', name: 'راست', title: 'راست' },
                  { value: 'center', name: 'وسط', title: 'وسط' },
                  { value: 'flex-end', name: 'چپ', title: 'چپ' },
                  { value: 'space-between', name: 'فاصله بین', title: 'فاصله یکسان بین' },
                  { value: 'space-around', name: 'فاصله دور', title: 'فاصله دور المان‌ها' },
                ],
              },
              {
                name: 'تراز عمودی محتوا',
                property: 'align-items',
                type: 'radio',
                defaults: 'stretch',
                list: [
                  { value: 'flex-start', name: 'بالا', title: 'بالا' },
                  { value: 'center', name: 'وسط', title: 'وسط' },
                  { value: 'flex-end', name: 'پایین', title: 'پایین' },
                  { value: 'stretch', name: 'کشیده', title: 'کشیده شده' },
                ],
              },
              {
                name: 'تراز متن',
                property: 'text-align',
                type: 'radio',
                defaults: 'right',
                list: [
                  { value: 'right', title: 'راست' },
                  { value: 'center', title: 'وسط' },
                  { value: 'left', title: 'چپ' },
                  { value: 'justify', title: 'جاستیفای' },
                ],
              },
            ],
          },
        ],
      },
      
      traitManager: {
        appendTo: '#traits-panel',
      },

      panels: {
        defaults: []
      }
    });

    // اضافه کردن بلوک‌های سفارشی
    const blocks = [
      {
        id: 'text-with-icon',
        label: '📝 متن با آیکن',
        category: 'متن',
        content: `<div style="display: flex; align-items: center; gap: 12px; padding: 16px;"><i class="fas fa-star" style="font-size: 24px; color: #4f46e5;"></i><p style="margin: 0; font-size: 16px; color: #333;">متن شما اینجا</p></div>`,
      },
      {
        id: 'heading-h1',
        label: '🔤 عنوان بزرگ',
        category: 'متن',
        content: '<h1 style="font-size: 48px; font-weight: bold; color: #1f2937; margin: 20px 0;">عنوان اصلی</h1>',
      },
      {
        id: 'heading-h2',
        label: '🔡 عنوان متوسط',
        category: 'متن',
        content: '<h2 style="font-size: 36px; font-weight: 600; color: #374151; margin: 16px 0;">عنوان فرعی</h2>',
      },
      {
        id: 'heading-h3',
        label: '🔠 عنوان کوچک',
        category: 'متن',
        content: '<h3 style="font-size: 24px; font-weight: 600; color: #4b5563; margin: 12px 0;">زیرعنوان</h3>',
      },
      {
        id: 'paragraph',
        label: '📄 پاراگراف',
        category: 'متن',
        content: '<p style="font-size: 16px; line-height: 1.8; color: #6b7280; margin: 12px 0;">این یک پاراگراف نمونه است. روی آن کلیک کنید تا ویرایش کنید.</p>',
      },
      {
        id: 'button-primary',
        label: '🔘 دکمه اصلی',
        category: 'دکمه‌ها',
        content: '<a href="#" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; transition: transform 0.2s;">کلیک کنید</a>',
      },
      {
        id: 'button-secondary',
        label: '⚪ دکمه فرعی',
        category: 'دکمه‌ها',
        content: '<a href="#" style="display: inline-block; padding: 14px 32px; background: white; color: #4f46e5; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; border: 2px solid #4f46e5; transition: all 0.2s;">مشاهده بیشتر</a>',
      },
      {
        id: 'button-with-icon',
        label: '🎯 دکمه با آیکن',
        category: 'دکمه‌ها',
        content: '<a href="#" style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;"><i class="fas fa-download"></i><span>دانلود فایل</span></a>',
      },
      {
        id: 'image-gallery-2',
        label: '🖼️ 2 عکس کنار هم',
        category: 'گالری تصاویر',
        content: '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 20px;"><img src="https://via.placeholder.com/400x300/667eea/ffffff?text=عکس+1" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/400x300/764ba2/ffffff?text=عکس+2" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /></div>',
      },
      {
        id: 'image-gallery-3',
        label: '🖼️ 3 عکس کنار هم',
        category: 'گالری تصاویر',
        content: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px;"><img src="https://via.placeholder.com/400x300/667eea/ffffff?text=عکس+1" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/400x300/764ba2/ffffff?text=عکس+2" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/400x300/f093fb/ffffff?text=عکس+3" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /></div>',
      },
      {
        id: 'image-gallery-4',
        label: '🖼️ 4 عکس کنار هم',
        category: 'گالری تصاویر',
        content: '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 20px;"><img src="https://via.placeholder.com/300x200/667eea/ffffff?text=1" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/300x200/764ba2/ffffff?text=2" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/300x200/f093fb/ffffff?text=3" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /><img src="https://via.placeholder.com/300x200/4facfe/ffffff?text=4" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" /></div>',
      },
      {
        id: 'card-with-image',
        label: '🎴 کارت با عکس',
        category: 'کارت‌ها',
        content: '<div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px;"><img src="https://via.placeholder.com/400x250/667eea/ffffff?text=عکس+کارت" style="width: 100%; height: 250px; object-fit: cover;" /><div style="padding: 24px;"><h3 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 12px 0;">عنوان کارت</h3><p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0 0 20px 0;">توضیحات کارت در این قسمت قرار می‌گیرد.</p><a href="#" style="display: inline-block; padding: 10px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">مشاهده بیشتر</a></div></div>',
      },
      {
        id: 'cards-row-2',
        label: '🎴 2 کارت کنار هم',
        category: 'کارت‌ها',
        content: '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 20px;"><div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"><img src="https://via.placeholder.com/400x250/667eea/ffffff?text=کارت+1" style="width: 100%; height: 200px; object-fit: cover;" /><div style="padding: 20px;"><h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">کارت اول</h3><p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات کارت اول</p></div></div><div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"><img src="https://via.placeholder.com/400x250/764ba2/ffffff?text=کارت+2" style="width: 100%; height: 200px; object-fit: cover;" /><div style="padding: 20px;"><h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">کارت دوم</h3><p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات کارت دوم</p></div></div></div>',
      },
      {
        id: 'cards-row-3',
        label: '🎴 3 کارت کنار هم',
        category: 'کارت‌ها',
        content: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px;"><div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;"><div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;"><i class="fas fa-rocket" style="font-size: 24px; color: white;"></i></div><h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">ویژگی اول</h3><p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات ویژگی اول</p></div><div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;"><div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;"><i class="fas fa-star" style="font-size: 24px; color: white;"></i></div><h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">ویژگی دوم</h3><p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات ویژگی دوم</p></div><div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;"><div style="width: 60px; height: 60px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;"><i class="fas fa-heart" style="font-size: 24px; color: white;"></i></div><h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">ویژگی سوم</h3><p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات ویژگی سوم</p></div></div>',
      },
      {
        id: 'container-section',
        label: '📦 بخش کانتینر',
        category: 'لایوت',
        content: '<div style="padding: 60px 40px; background: #f9fafb; border-radius: 16px; min-height: 200px; margin: 20px 0;"></div>',
      },
      {
        id: 'two-column',
        label: '⬜⬜ دو ستون',
        category: 'لایوت',
        content: '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 20px;"><div style="background: white; padding: 30px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div><div style="background: white; padding: 30px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div></div>',
      },
      {
        id: 'three-column',
        label: '⬜⬜⬜ سه ستون',
        category: 'لایوت',
        content: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px;"><div style="background: white; padding: 24px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div><div style="background: white; padding: 24px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div><div style="background: white; padding: 24px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div></div>',
      },
      {
        id: 'hero-section',
        label: '🎨 بخش Hero',
        category: 'تمپلیت‌ها',
        content: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 80px 40px; text-align: center; border-radius: 20px; margin: 20px 0;"><h1 style="font-size: 48px; font-weight: bold; color: white; margin: 0 0 20px 0;">عنوان اصلی شما</h1><p style="font-size: 20px; color: rgba(255,255,255,0.9); margin: 0 0 30px 0; max-width: 600px; margin-left: auto; margin-right: auto;">توضیحات کوتاه و جذاب درباره محصول یا خدمات شما</p><a href="#" style="display: inline-block; padding: 16px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px;">شروع کنید</a></div>',
      },
      {
        id: 'single-image',
        label: '🖼️ تصویر تکی',
        category: 'رسانه',
        content: '<img src="https://via.placeholder.com/800x400/667eea/ffffff?text=تصویر+شما" style="width: 100%; max-width: 800px; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: block; margin: 20px auto;" />',
      },
      {
        id: 'video-embed',
        label: '🎥 ویدیو',
        category: 'رسانه',
        content: '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); margin: 20px 0;"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div>',
      },
      {
        id: 'icon-list',
        label: '✅ لیست با آیکن',
        category: 'متن',
        content: '<div style="padding: 20px;"><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;"><i class="fas fa-check-circle" style="font-size: 20px; color: #10b981;"></i><p style="margin: 0; font-size: 16px; color: #374151;">مورد اول لیست</p></div><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;"><i class="fas fa-check-circle" style="font-size: 20px; color: #10b981;"></i><p style="margin: 0; font-size: 16px; color: #374151;">مورد دوم لیست</p></div><div style="display: flex; align-items: center; gap: 12px;"><i class="fas fa-check-circle" style="font-size: 20px; color: #10b981;"></i><p style="margin: 0; font-size: 16px; color: #374151;">مورد سوم لیست</p></div></div>',
      },
      {
        id: 'spacer',
        label: '↕️ فاصله عمودی',
        category: 'لایوت',
        content: '<div style="height: 60px;"></div>',
      },
      {
        id: 'divider',
        label: '➖ خط جداکننده',
        category: 'لایوت',
        content: '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 40px 0;" />',
      }
    ];

    blocks.forEach(block => {
      grapesEditor.BlockManager.add(block.id, {
        label: block.label,
        category: block.category,
        content: block.content,
      });
    });

    // بارگذاری محتوای ذخیره شده
    const savedData = localStorage.getItem(`page-${slug}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        grapesEditor.setComponents(parsed.html);
        grapesEditor.setStyle(parsed.css);
      } catch (e) {
        console.error('خطا در بارگذاری:', e);
      }
    }

    setEditor(grapesEditor);

    return () => {
      if (grapesEditor) {
        grapesEditor.destroy();
      }
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
    document.getElementById('styles-panel').style.display = tab === 'styles' ? 'block' : 'none';
    document.getElementById('traits-panel').style.display = tab === 'traits' ? 'block' : 'none';
    document.getElementById('layers-panel').style.display = tab === 'layers' ? 'block' : 'none';
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
              <div id="blocks-panel" className="p-3"></div>
            </div>

            {/* Canvas اصلی */}
            <div className="flex-1 bg-gray-100 overflow-hidden" dir="ltr">
              <div id="gjs" ref={editorRef} style={{ height: '100%' }}></div>
            </div>

            {/* سایدبار چپ - تنظیمات */}
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
              {/* تب‌های مختلف */}
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
                <div id="styles-panel"></div>
              </div>

              {/* پنل ویژگی‌ها */}
              <div id="traits-panel" className="p-3 hidden"></div>

              {/* پنل لایه‌ها */}
              <div id="layers-panel" className="p-3 hidden"></div>
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
        
        .gjs-sm-property {
          margin-bottom: 16px;
        }
        
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
        
        .gjs-sm-composite {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .gjs-clm-select {
          text-align: right;
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .gjs-clm-select:hover {
          border-color: #4f46e5;
        }
        
        .gjs-field-color {
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .gjs-field-radio {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .gjs-radio-item {
          flex: 1;
          min-width: 60px;
        }
        
        .gjs-radio-item input[type="radio"] {
          display: none;
        }
        
        .gjs-radio-item label {
          display: block;
          padding: 8px 12px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
          font-weight: 600;
        }
        
        .gjs-radio-item input[type="radio"]:checked + label {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
        
        .gjs-radio-item label:hover {
          border-color: #4f46e5;
        }
        
        .gjs-field-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #d1d5db;
          outline: none;
          -webkit-appearance: none;
        }
        
        .gjs-field-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
        }
        
        .gjs-field-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: none;
        }
        
        .gjs-layers {
          text-align: right;
        }
        
        .gjs-layer {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        
        .gjs-layer:hover {
          background-color: #f9fafb;
        }
        
        .gjs-layer.gjs-selected {
          background-color: #eef2ff;
          border-right: 3px solid #4f46e5;
        }
        
        .gjs-layer-title {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }
        
        /* تنظیمات traits */
        .gjs-trt-trait {
          margin-bottom: 16px;
        }
        
        .gjs-trt-trait__label {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 6px;
          display: block;
          font-weight: 500;
        }
        
        .gjs-trt-trait input,
        .gjs-trt-trait select,
        .gjs-trt-trait textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .gjs-trt-trait input:focus,
        .gjs-trt-trait select:focus,
        .gjs-trt-trait textarea:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        /* استایل برای toolbar */
        .gjs-toolbar {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 4px;
        }
        
        .gjs-toolbar-item {
          padding: 6px 10px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .gjs-toolbar-item:hover {
          background: #eef2ff;
          color: #4f46e5;
        }
        
        /* بهبود ظاهر canvas */
        .gjs-cv-canvas__frames {
          border-radius: 12px;
          overflow: hidden;
        }
        
        /* پیام خالی بودن */
        .gjs-dashed {
          border: 2px dashed #d1d5db !important;
          background: rgba(249, 250, 251, 0.5);
        }
      `}</style>
    </div>
  );
}