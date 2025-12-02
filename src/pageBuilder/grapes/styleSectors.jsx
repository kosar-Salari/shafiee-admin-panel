// src/pageBuilder/grapes/styleSectors.js
const styleSectors = [
  {
    id: 'spacing',
    name: '📐 ابعاد و فاصله',
    open: true,
    properties: [
      {
        id: 'width',
        name: 'عرض',
        property: 'width',
        type: 'integer',
        units: ['px', '%', 'vw', 'auto'],
        defaults: 'auto',
      },
      {
        id: 'height',
        name: 'ارتفاع',
        property: 'height',
        type: 'integer',
        units: ['px', '%', 'vh', 'auto'],
        defaults: 'auto',
      },
      {
        id: 'padding-all',
        name: 'فاصله داخلی (همه جهات)',
        property: 'padding',
        type: 'integer',
        units: ['px', 'rem'],
        defaults: '0',
        placeholder: '—',
        min: 0,
        max: 500,
        onChange: (value, prop, opts = {}) => {
          const toCss = (v) =>
            typeof v === 'string' && /px|rem$/.test(v) ? v : `${v}px`;
          const { selected } = opts;
          if (selected && Array.isArray(selected)) {
            selected.forEach((cmp) => {
              const v = toCss(value);
              cmp.addStyle({
                'padding-top': v,
                'padding-right': v,
                'padding-bottom': v,
                'padding-left': v,
              });
            });
          }
        },
      },
      {
        id: 'margin-all',
        name: 'فاصله خارجی (همه جهات)',
        property: 'margin',
        type: 'integer',
        units: ['px', 'rem', 'auto'],
        defaults: '0',
        placeholder: '—',
        min: 0,
        max: 500,
        onChange: (value, prop, opts = {}) => {
          const toCss = (v) =>
            v === 'auto'
              ? 'auto'
              : (typeof v === 'string' && /px|rem|auto$/.test(v)) ? v : `${v}px`;
          const { selected } = opts;
          if (selected && Array.isArray(selected)) {
            selected.forEach((cmp) => {
              const v = toCss(value);
              cmp.addStyle({
                'margin-top': v,
                'margin-right': v,
                'margin-bottom': v,
                'margin-left': v,
              });
            });
          }
        },
      },
      {
        id: 'padding-sides',
        name: 'فاصله داخلی',
        property: 'padding',
        type: 'composite',
        properties: [
          { id: 'padding-top', name: 'بالا', property: 'padding-top', type: 'integer', units: ['px', 'rem'], defaults: '0' },
          { id: 'padding-right', name: 'راست', property: 'padding-right', type: 'integer', units: ['px', 'rem'], defaults: '0' },
          { id: 'padding-bottom', name: 'پایین', property: 'padding-bottom', type: 'integer', units: ['px', 'rem'], defaults: '0' },
          { id: 'padding-left', name: 'چپ', property: 'padding-left', type: 'integer', units: ['px', 'rem'], defaults: '0' },
        ],
      },
      {
        id: 'margin-sides',
        name: 'فاصله خارجی',
        property: 'margin',
        type: 'composite',
        properties: [
          { id: 'margin-top', name: 'بالا', property: 'margin-top', type: 'integer', units: ['px', 'rem'], defaults: '0' },
          { id: 'margin-right', name: 'راست', property: 'margin-right', type: 'integer', units: ['px', 'rem', 'auto'], defaults: '0' },
          { id: 'margin-bottom', name: 'پایین', property: 'margin-bottom', type: 'integer', units: ['px', 'rem'], defaults: '0' },
          { id: 'margin-left', name: 'چپ', property: 'margin-left', type: 'integer', units: ['px', 'rem', 'auto'], defaults: '0' },
        ],
      },
    ],
  },
  {
    name: '📍 تراز المان',
    open: false,
    properties: [
      {
        name: '🔹 تراز افقی',
        property: 'text-align',
        type: 'radio',
        defaults: 'right',
        list: [
          { value: 'right', title: '→ راست' },
          { value: 'center', title: '○ وسط' },
          { value: 'left', title: '← چپ' },
        ],
        onChange: (value, prop, opts = {}) => {
          const { selected, editor } = opts;
          if (!selected || !Array.isArray(selected)) return;

          selected.forEach((cmp) => {
            const tag = (cmp.get('tagName') || '').toLowerCase();
            const isButton = tag === 'a' || cmp.getAttributes()?.['data-button-variant'];

            if (isButton) {
              // فقط روی خود دکمه inline-block استایل ذخیره کن
              cmp.addStyle({ display: 'block' });

              if (value === 'center') {
                cmp.addStyle({
                  margin: '0 auto',
                  float: 'none'
                });
              } else if (value === 'right') {
                cmp.addStyle({
                  margin: '0 0 0 auto',
                  float: 'none'
                });
              } else if (value === 'left') {
                cmp.addStyle({
                  margin: '0 auto 0 0',
                  float: 'none'
                });
              }
            }
            else {
              // رفتار معمول برای سایر عناصر
              cmp.setStyle({
                'text-align': value,
                'float': value === 'right' ? 'right' : value === 'left' ? 'left' : 'none',
                'margin': value === 'center' ? '0 auto' : '0'
              });
            }
          });

          if (editor) setTimeout(() => editor.refresh(), 50);
        }

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
        type: 'integer',
        units: ['px', 'rem', 'em'],
        defaults: '16px',
        min: 8,
        max: 100,
      },
      {
        name: 'ضخامت فونت',
        property: 'font-weight',
        type: 'select',
        defaults: '400',
        list: [
          { value: '100', name: '100 - نازک' },
          { value: '200', name: '200' },
          { value: '300', name: '300 - نازک' },
          { value: '400', name: '400 - معمولی' },
          { value: '500', name: '500 - متوسط' },
          { value: '600', name: '600 - نیمه‌بولد' },
          { value: '700', name: '700 - بولد' },
          { value: '800', name: '800 - خیلی بولد' },
          { value: '900', name: '900 - سنگین' },
        ],
      },
      { name: 'رنگ متن', property: 'color', type: 'color', defaults: '#333333' },
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
        ],
      },
      {
        name: 'فاصله خطوط',
        property: 'line-height',
        type: 'integer',
        units: ['', 'px', 'em'],
        defaults: '1.5',
        min: 0,
        max: 5,
        step: 0.1,
      },
      {
        name: 'فاصله حروف',
        property: 'letter-spacing',
        type: 'integer',
        units: ['px', 'em', 'rem'],
        default: '0px', // ✅ از defaults به default تغییر داد
        min: -5,
        max: 20,
        step: 0.1
      },
      {
        name: 'نوع لیست',
        property: 'list-style-type',
        type: 'select',
        defaults: 'disc',
        list: [
          { value: 'none', name: 'بدون' },
          { value: 'disc', name: '● نقطه' },
          { value: 'circle', name: '○ دایره خالی' },
          { value: 'square', name: '■ مربع' },
          { value: 'decimal', name: '1. شماره' },
          { value: 'decimal-leading-zero', name: '01. شماره با صفر' },
          { value: 'lower-alpha', name: 'a. حروف کوچک' },
          { value: 'upper-alpha', name: 'A. حروف بزرگ' },
          { value: 'lower-roman', name: 'i. اعداد رومی کوچک' },
          { value: 'upper-roman', name: 'I. اعداد رومی بزرگ' },
        ],
      },
      {
        name: 'موقعیت علامت لیست',
        property: 'list-style-position',
        type: 'radio',
        defaults: 'outside',
        list: [
          { value: 'outside', title: 'بیرون' },
          { value: 'inside', title: 'داخل' },
        ],
      },
    ],
  },
  {
    name: '🎨 پس‌زمینه',
    open: false,
    properties: [
      { name: 'رنگ پس‌زمینه', property: 'background-color', type: 'color', defaults: 'transparent' },
    ],
  },
  {
    name: '🔲 حاشیه و سایه',
    open: false,
    properties: [
      {
        name: 'گردی گوشه‌ها',
        property: 'border-radius',
        type: 'integer',
        units: ['px', '%'],
        defaults: '0',
        min: 0,
        max: 100
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
            min: 0,
            max: 20
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
              { value: 'double', name: 'خط دوتایی' },
            ],
          },
          {
            name: 'رنگ',
            property: 'border-color',
            type: 'color',
            defaults: '#000000'
          },
        ],
      },
      {
        name: '🌟 سایه (Box Shadow)',
        property: 'box-shadow',
        type: 'stack',
        properties: [
          {
            name: 'افقی (X)',
            property: 'box-shadow-h',
            type: 'integer',
            units: ['px'],
            defaults: '0',
            min: -50,
            max: 50
          },
          {
            name: 'عمودی (Y)',
            property: 'box-shadow-v',
            type: 'integer',
            units: ['px'],
            defaults: '4',
            min: -50,
            max: 50
          },
          {
            name: 'میزان پخش',
            property: 'box-shadow-blur',
            type: 'integer',
            units: ['px'],
            defaults: '6',
            min: 0,
            max: 100
          },
          {
            name: 'گسترش',
            property: 'box-shadow-spread',
            type: 'integer',
            units: ['px'],
            defaults: '0',
            min: -50,
            max: 50
          },
          {
            name: 'رنگ سایه',
            property: 'box-shadow-color',
            type: 'color',
            defaults: 'rgba(0,0,0,0.1)'
          },
          {
            name: 'نوع',
            property: 'box-shadow-type',
            type: 'select',
            defaults: '',
            list: [
              { value: '', name: 'بیرونی' },
              { value: 'inset', name: 'داخلی' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: '👁️ نمایش و مخفی کردن',
    open: false,
    properties: [
      {
        name: 'وضعیت نمایش',
        property: 'display',
        type: 'select',
        defaults: 'block',
        list: [
          { value: 'block', name: '✅ نمایش عادی (بلوک کامل)' },
          { value: 'inline-block', name: '📦 نمایش در کنار هم' },
          { value: 'flex', name: '🎯 نمایش انعطاف‌پذیر (برای تراز)' },
          { value: 'none', name: '❌ مخفی کردن' },
        ],
      },
      { name: 'میزان شفافیت (0 = نامرئی، 1 = کاملا واضح)', property: 'opacity', type: 'slider', defaults: '1', min: 0, max: 1, step: 0.1 },
      {
        name: 'نوع موقعیت قرارگیری',
        property: 'position',
        type: 'select',
        defaults: 'static',
        list: [
          { value: 'static', name: '📍 عادی (در جریان صفحه)' },
          { value: 'relative', name: '↔️ نسبی (قابل جابجایی)' },
          { value: 'absolute', name: '🎯 مستقل از صفحه' },
          { value: 'fixed', name: '📌 ثابت در صفحه (حتی با اسکرول)' },
          { value: 'sticky', name: '📎 چسبنده (ثابت هنگام اسکرول)' },
        ],
      },
      {
        name: 'لایه‌بندی (عدد بالاتر = جلوتر)',
        property: 'z-index',
        type: 'integer',
        defaults: 'auto',
        min: -10,
        max: 100
      },
    ],
  },
];

export default styleSectors;