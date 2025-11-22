const blocks = [
  {
    id: 'text-with-icon',
    label: '📝 متن با آیکن/عکس',
    category: 'متن',
    content: `<div style="display: flex; align-items: center; gap: 12px; padding: 16px;">
      <img src="https://via.placeholder.com/32x32/4f46e5/ffffff?text=★" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;" data-gjs-type="image" />
      <p style="margin: 0; font-size: 16px; color: #333;">متن شما اینجا</p>
    </div>`
  },

  {
    id: 'heading-h1', label: '🔤 عنوان بزرگ', category: 'متن',
    content: '<h1 style="font-size: 48px; font-weight: bold; color: #1f2937; margin: 20px 0;">عنوان اصلی</h1>'
  },
  {
    id: 'heading-h2', label: '🔡 عنوان متوسط', category: 'متن',
    content: '<h2 style="font-size: 36px; font-weight: 600; color: #374151; margin: 16px 0;">عنوان فرعی</h2>'
  },
  {
    id: 'heading-h3', label: '🔠 عنوان کوچک', category: 'متن',
    content: '<h3 style="font-size: 24px; font-weight: 600; color: #4b5563; margin: 12px 0;">زیرعنوان</h3>'
  },
  {
    id: 'paragraph', label: '📄 پاراگراف', category: 'متن',
    content: '<p style="font-size: 16px; line-height: 1.8; color: #6b7280; margin: 12px 0;">این یک پاراگراف نمونه است. روی آن کلیک کنید تا ویرایش کنید.</p>'
  },

  // ===========================
  // 🎬 بلوک‌های رسانه
  // ===========================

  {
    id: 'single-image', label: '🖼️ تصویر تکی', category: 'رسانه',
    content: '<img src="https://via.placeholder.com/800x400/667eea/ffffff?text=تصویر+شما" style="width: 100%; max-width: 800px; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: block; margin: 20px auto;" />'
  },

  {
    id: 'video-embed', label: '📺 ویدیو یوتیوب', category: 'رسانه',
    content: '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); margin: 20px 0;"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div>'
  },

  // ✅ ویدیو با دکمه آپلود
  {
    id: 'video-upload',
    label: '🎬 آپلود ویدیو',
    category: 'رسانه',
    content: '' // این توی initEditor.js پر می‌شه
  },

  // ✅ صوت با دکمه آپلود
  {
    id: 'audio-upload',
    label: '🎵 آپلود صوت',
    category: 'رسانه',
    content: '' // این توی initEditor.js پر می‌شه
  },

  // ✅ فایل با دکمه آپلود
  {
    id: 'file-upload',
    label: '📎 آپلود فایل',
    category: 'رسانه',
    content: '' // این توی initEditor.js پر می‌شه
  },


  {
    id: 'image-gallery-2',
    label: '🖼️ 2 عکس کنار هم',
    category: 'گالری تصاویر',
    content: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
      <img 
        src="https://via.placeholder.com/400x300/667eea/ffffff?text=عکس+1"
        style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" 
      />
      <img 
        src="https://via.placeholder.com/400x300/764ba2/ffffff?text=عکس+2"
        style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" 
      />
    </div>
  `,
  },

  {
    id: 'image-gallery-3',
    label: '🖼️ 3 عکس کنار هم',
    category: 'گالری تصاویر',
    content: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 max-w-6xl mx-auto justify-items-center">

      <img 
        src="https://via.placeholder.com/400x300/667eea/ffffff?text=عکس+۱"
        class="w-full h-48 sm:h-64 lg:h-56 object-cover rounded-xl shadow"
      />

      <img 
        src="https://via.placeholder.com/400x300/764ba2/ffffff?text=عکس+۲"
        class="w-full h-48 sm:h-64 lg:h-56 object-cover rounded-xl shadow"
      />

      <img 
        src="https://via.placeholder.com/400x300/f093fb/ffffff?text=عکس+۳"
        class="w-full h-48 sm:h-64 lg:h-56 object-cover rounded-xl shadow"
      />

    </div>
  `,
  },


  {
    id: 'image-gallery-4',
    label: '🖼️ 4 عکس کنار هم',
    category: 'گالری تصاویر',
    content: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
      <img 
        src="https://via.placeholder.com/300x200/667eea/ffffff?text=1"
        class="w-full h-48 sm:h-64 md:h-56 object-cover rounded-xl shadow"
      />
      <img 
        src="https://via.placeholder.com/300x200/764ba2/ffffff?text=2"
        class="w-full h-48 sm:h-64 md:h-56 object-cover rounded-xl shadow"
      />
      <img 
        src="https://via.placeholder.com/300x200/f093fb/ffffff?text=3"
        class="w-full h-48 sm:h-64 md:h-56 object-cover rounded-xl shadow"
      />
      <img 
        src="https://via.placeholder.com/300x200/4facfe/ffffff?text=4"
        class="w-full h-48 sm:h-64 md:h-56 object-cover rounded-xl shadow"
      />
    </div>
  `,
  },



  {
    id: 'button-primary',
    label: '🔘 دکمه اصلی',
    category: 'دکمه‌ها',
    content: `
    <a
      href="#"
      data-button-variant="primary"
      style="
        display: inline-block;
        padding: 14px 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        transition: transform 0.2s;
      "
    >
      کلیک کنید
    </a>
  `,
  },
  {
    id: 'button-secondary',
    label: '⚪ دکمه فرعی',
    category: 'دکمه‌ها',
    content: `
    <a
      href="#"
      data-button-variant="secondary"
      style="
        display: inline-block;
        padding: 14px 32px;
        background: white;
        color: #4f46e5;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        border: 2px solid #4f46e5;
        transition: all 0.2s;
      "
    >
      مشاهده بیشتر
    </a>
  `,
  },
  {
    id: 'button-with-icon',
    label: '🎯 دکمه با آیکن/عکس',
    category: 'دکمه‌ها',
    content: `
    <a
      href="#"
      data-button-variant="with-icon"
      style="
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 32px;
        background: #10b981;
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.2s;
      "
    >
      <img
        src="https://via.placeholder.com/20x20/ffffff/10b981?text=↓"
        style="width: 20px; height: 20px; object-fit: cover; border-radius: 3px;"
        data-gjs-type="image"
      />
      <span>دانلود فایل</span>
    </a>
  `,
  },



  {
    id: 'card-with-image', label: '🎴 کارت با عکس', category: 'کارت‌ها',
    content: '<div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px;"><img src="https://via.placeholder.com/400x250/667eea/ffffff?text=عکس+کارت" style="width: 100%; height: 250px; object-fit: cover;" /><div style="padding: 24px;"><h3 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 12px 0;">عنوان کارت</h3><p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0 0 20px 0;">توضیحات کارت در این قسمت قرار می‌گیرد.</p><a href="#" style="display: inline-block; padding: 10px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">مشاهده بیشتر</a></div></div>'
  },
  {
    id: 'cards-row-2',
    label: '🎴 2 کارت کنار هم',
    category: 'کارت‌ها',
    content: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <img src="https://via.placeholder.com/400x250/667eea/ffffff?text=کارت+1" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 20px;">
          <h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">کارت اول</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات کارت اول</p>
        </div>
      </div>
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <img src="https://via.placeholder.com/400x250/764ba2/ffffff?text=کارت+2" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 20px;">
          <h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">کارت دوم</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات کارت دوم</p>
        </div>
      </div>
    </div>
  `,
  },

  {
    id: 'cards-row-3',
    label: '🎴 3 کارت کنار هم',
    category: 'کارت‌ها',
    content: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
      <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <i class="fas fa-rocket" style="font-size: 24px; color: white;"></i>
        </div>
        <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">ویژگی اول</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات ویژگی اول</p>
      </div>
      <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <i class="fas fa-star" style="font-size: 24px; color: white;"></i>
        </div>
        <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">ویژگی دوم</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات ویژگی دوم</p>
      </div>
      <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <i class="fas fa-heart" style="font-size: 24px; color: white;"></i>
        </div>
        <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">ویژگی سوم</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات ویژگی سوم</p>
      </div>
    </div>
  `,
  },

  {
    id: 'two-column',
    label: '⬜⬜ دو ستون',
    category: 'لایوت',
    content: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
      <div style="background: white; padding: 30px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div>
      <div style="background: white; padding: 30px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div>
    </div>
  `,
  },

  {
    id: 'three-column',
    label: '⬜⬜⬜ سه ستون',
    category: 'لایوت',
    content: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
      <div style="background: white; padding: 24px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div>
      <div style="background: white; padding: 24px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div>
      <div style="background: white; padding: 24px; border-radius: 12px; border: 2px dashed #d1d5db; min-height: 150px;"></div>
    </div>
  `,
  },


  {
    id: 'hero-section', label: '🎨 بخش Hero', category: 'تمپلیت‌ها',
    content: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 80px 40px; text-align: center; border-radius: 20px; margin: 20px 0;"><h1 style="font-size: 48px; font-weight: bold; color: white; margin: 0 0 20px 0;">عنوان اصلی شما</h1><p style="font-size: 20px; color: rgba(255,255,255,0.9); margin: 0 0 30px 0; max-width: 600px; margin-left: auto; margin-right: auto;">توضیحات کوتاه و جذاب درباره محصول یا خدمات شما</p><a href="#" style="display: inline-block; padding: 16px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px;">شروع کنید</a></div>'
  },


  { id: 'icon-list', label: '✅ لیست با آیکن', category: 'متن', content: '' },

  { id: 'spacer', label: '↕️ فاصله عمودی', category: 'لایوت', content: '<div style="height: 60px;"></div>' },
  { id: 'divider', label: '➖ خط جداکننده', category: 'لایوت', content: '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 40px 0;" />' },
];

export default blocks;