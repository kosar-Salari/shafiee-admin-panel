// grapes/styleSectors.js - نسخه نهایی با قابلیت لینک‌دهی
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
      { name: 'فاصله حروف', property: 'letter-spacing', type: 'integer', units: ['px', 'em'], defaults: '0', min: -5, max: 20 },
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
      { name: 'گردی گوشه‌ها', property: 'border-radius', type: 'integer', units: ['px', '%'], defaults: '0', min: 0, max: 100 },
      {
        name: 'حاشیه',
        property: 'border',
        type: 'composite',
        properties: [
          { name: 'عرض', property: 'border-width', type: 'integer', units: ['px'], defaults: '0', min: 0, max: 20 },
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
          { name: 'رنگ', property: 'border-color', type: 'color', defaults: '#000000' },
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
      { name: 'شفافیت', property: 'opacity', type: 'slider', defaults: '1', min: 0, max: 1, step: 0.1 },
      { name: 'z-index', property: 'z-index', type: 'integer', defaults: 'auto', min: -10, max: 100 },
    ],
  },
];

export default styleSectors;