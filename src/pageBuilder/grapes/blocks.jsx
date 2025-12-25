// src/pageBuilder/grapes/blocks.js

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

  {
    id: 'ordered-list',
    label: '🔢 لیست شماره‌دار',
    category: 'متن',
    content: `
    <div 
      data-gjs-type="list-wrapper"
      style="
        padding: 16px 20px;
        background: #f9fafb;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        margin: 16px 0;
      "
    >
      <ol style="
        font-size: 16px; 
        line-height: 1.8; 
        color: #374151; 
        margin: 0; 
        padding-right: 24px;
        list-style-type: decimal;
      ">
        <li style="margin-bottom: 8px;">آیتم اول</li>
        <li style="margin-bottom: 8px;">آیتم دوم</li>
        <li style="margin-bottom: 8px;">آیتم سوم</li>
      </ol>
    </div>
  `
  },
  {
    id: 'unordered-list',
    label: '🔘 لیست نقطه‌ای',
    category: 'متن',
    content: `
    <div 
      data-gjs-type="list-wrapper"
      style="
        padding: 16px 20px;
        background: #f9fafb;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        margin: 16px 0;
      "
    >
      <ul style="
        font-size: 16px; 
        line-height: 1.8; 
        color: #374151; 
        margin: 0; 
        padding-right: 24px;
        list-style-type: disc;
      ">
        <li style="margin-bottom: 8px;">آیتم اول</li>
        <li style="margin-bottom: 8px;">آیتم دوم</li>
        <li style="margin-bottom: 8px;">آیتم سوم</li>
      </ul>
    </div>
  `
  },

  // (این یکی تکراری بود، id و label رو تغییر دادم تا conflict نده)
  {
    id: 'unordered-list-simple',
    label: '🔘 لیست نقطه‌ای (ساده)',
    category: 'متن',
    content: `
    <ul style="
      font-size: 16px; 
      line-height: 1.8; 
      color: #374151; 
      margin: 16px 0; 
      padding-right: 24px;
      list-style-type: disc;
    ">
      <li style="margin-bottom: 8px;">آیتم اول</li>
      <li style="margin-bottom: 8px;">آیتم دوم</li>
      <li style="margin-bottom: 8px;">آیتم سوم</li>
    </ul>
  `
  },

  // ===========================
  // 🎬 بلوک‌های رسانه
  // ===========================

  {
    id: 'single-image', label: '🖼️ تصویر تکی', category: 'رسانه',
    content: '<img src="https://via.placeholder.com/800x400/667eea/ffffff?text=تصویر+شما" style="width: 100%; max-width: 800px; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: block; margin: 20px auto;" />'
  },

  {
    id: 'iframe-embed',
    label: '🌐 آیفریم (Embed)',
    category: 'رسانه',
    content: '', // تو initEditor با placeholder پر می‌شه
  },

  {
    id: 'video-upload',
    label: '🎬 آپلود ویدیو',
    category: 'رسانه',
    content: '' // این توی initEditor.js پر می‌شه
  },

  {
    id: 'audio-upload',
    label: '🎵 آپلود صوت',
    category: 'رسانه',
    content: '' // این توی initEditor.js پر می‌شه
  },

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

  // ===========================
  // 🎴 کارت‌ها
  // ===========================

  // ✅ FIX: card-with-image (برای هم‌ترازی دکمه اگر کنار کارت‌های دیگر قرار گرفت)
  {
    id: 'card-with-image', label: '🎴 کارت با عکس', category: 'کارت‌ها',
    content: `
    <div style="
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      max-width: 400px;
      height: 100%;
      display: flex;
      flex-direction: column;
    ">
      <img
        src="https://via.placeholder.com/400x250/667eea/ffffff?text=عکس+کارت"
        style="width: 100%; height: 250px; object-fit: cover; display:block;"
        data-gjs-type="image"
      />
      <div style="padding: 24px; display:flex; flex-direction:column; flex:1;">
        <h3 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 12px 0;">عنوان کارت</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0 0 20px 0;">توضیحات کارت در این قسمت قرار می‌گیرد.</p>
        <a href="#" style="
          display: inline-block;
          padding: 10px 24px;
          background: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          margin-top: auto;
          align-self: flex-start;
        ">مشاهده بیشتر</a>
      </div>
    </div>
    `
  },

  // ✅ FIX: cards-row-2 (ساختار کارت‌ها flex-column شد تا اگر دکمه اضافه شد هم‌تراز بماند)
  {
    id: 'cards-row-2',
    label: '🎴 2 کارت کنار هم',
    category: 'کارت‌ها',
    content: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5" style="align-items: stretch;">
      <div style="
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        height: 100%;
      ">
        <img src="https://via.placeholder.com/400x250/667eea/ffffff?text=کارت+1" style="width: 100%; height: 200px; object-fit: cover; display:block;" data-gjs-type="image" />
        <div style="padding: 20px; display:flex; flex-direction:column; flex:1;">
          <h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">کارت اول</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات کارت اول</p>

          <!-- اگر دکمه اضافه کردی، margin-top:auto بگذار -->
          <!--
          <a href="#" style="
            display:inline-block;
            padding:10px 18px;
            background:#4f46e5;
            color:#fff;
            text-decoration:none;
            border-radius:10px;
            font-weight:600;
            font-size:14px;
            margin-top:auto;
            align-self:flex-start;
          ">مشاهده بیشتر</a>
          -->
        </div>
      </div>

      <div style="
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        height: 100%;
      ">
        <img src="https://via.placeholder.com/400x250/764ba2/ffffff?text=کارت+2" style="width: 100%; height: 200px; object-fit: cover; display:block;" data-gjs-type="image" />
        <div style="padding: 20px; display:flex; flex-direction:column; flex:1;">
          <h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">کارت دوم</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">توضیحات کارت دوم</p>

          <!-- دکمه اختیاری -->
          <!--
          <a href="#" style="
            display:inline-block;
            padding:10px 18px;
            background:#4f46e5;
            color:#fff;
            text-decoration:none;
            border-radius:10px;
            font-weight:600;
            font-size:14px;
            margin-top:auto;
            align-self:flex-start;
          ">مشاهده بیشتر</a>
          -->
        </div>
      </div>
    </div>
  `,
  },

  // ✅ FIX: cards-row-3 (هم‌تراز شدن دکمه‌ها با flex-column + margin-top:auto)
  {
    id: 'cards-row-3',
    label: '🎴 3 کارت کنار هم',
    category: 'کارت‌ها',
    content: `
  <div style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    width: 100%;
    margin: 20px 0;
    align-items: stretch;
  ">
    <div style="
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.10);
      border: 1px solid #e5e7eb;
      height: 100%;
      display: flex;
      flex-direction: column;
    ">
      <img
        src="https://via.placeholder.com/800x500/667eea/ffffff?text=کارت+1"
        style="width: 100%; height: 210px; object-fit: cover; display:block;"
        data-gjs-type="image"
      />
      <div style="padding: 20px; display:flex; flex-direction:column; flex:1;">
        <h3 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 10px;">کارت اول</h3>
        <p style="font-size: 14px; line-height: 1.7; color: #6b7280; margin: 0 0 16px;">
          توضیحات کارت اول
        </p>
        <a href="#" style="
          display: inline-block;
          padding: 10px 18px;
          background: #4f46e5;
          color: #fff;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          margin-top: auto;
          align-self: flex-start;
        ">مشاهده بیشتر</a>
      </div>
    </div>

    <div style="
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.10);
      border: 1px solid #e5e7eb;
      height: 100%;
      display: flex;
      flex-direction: column;
    ">
      <img
        src="https://via.placeholder.com/800x500/764ba2/ffffff?text=کارت+2"
        style="width: 100%; height: 210px; object-fit: cover; display:block;"
        data-gjs-type="image"
      />
      <div style="padding: 20px; display:flex; flex-direction:column; flex:1;">
        <h3 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 10px;">کارت دوم</h3>
        <p style="font-size: 14px; line-height: 1.7; color: #6b7280; margin: 0 0 16px;">
          توضیحات کارت دوم
        </p>
        <a href="#" style="
          display: inline-block;
          padding: 10px 18px;
          background: #4f46e5;
          color: #fff;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          margin-top: auto;
          align-self: flex-start;
        ">مشاهده بیشتر</a>
      </div>
    </div>

    <div style="
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.10);
      border: 1px solid #e5e7eb;
      height: 100%;
      display: flex;
      flex-direction: column;
    ">
      <img
        src="https://via.placeholder.com/800x500/f093fb/ffffff?text=کارت+3"
        style="width: 100%; height: 210px; object-fit: cover; display:block;"
        data-gjs-type="image"
      />
      <div style="padding: 20px; display:flex; flex-direction:column; flex:1;">
        <h3 style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 10px;">کارت سوم</h3>
        <p style="font-size: 14px; line-height: 1.7; color: #6b7280; margin: 0 0 16px;">
          توضیحات کارت سوم
        </p>
        <a href="#" style="
          display: inline-block;
          padding: 10px 18px;
          background: #4f46e5;
          color: #fff;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          margin-top: auto;
          align-self: flex-start;
        ">مشاهده بیشتر</a>
      </div>
    </div>
  </div>
  `,
  },

  // ===========================
  // لایوت‌ها و تمپلیت‌ها (بدون تغییر)
  // ===========================

  {
    id: 'two-column',
    label: '⬜⬜ دو ستون',
    category: 'لایوت',
    content: `
    <div 
      class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5"
      data-gjs-droppable="false"
    >
      <div 
        data-gjs-droppable="true"
        style="
          background: white;
          padding: 100px;
          border-radius: 12px;
          border: 2px dashed #d1d5db;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >

      </div>

      <div 
        data-gjs-droppable="true"
        style="
          background: white;
          padding: 100px;
          border-radius: 12px;
          border: 2px dashed #d1d5db;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
      </div>
    </div>
  `,
  },
  {
    id: 'three-column',
    label: '⬜⬜⬜ سه ستون',
    category: 'لایوت',
    content: `
    <div 
      class="grid grid-cols-1 md:grid-cols-3 gap-5 p-5"
      data-gjs-droppable="false"
    >
      <div 
        data-gjs-droppable="true"
        style="
          background: white;
          padding: 100px;
          border-radius: 12px;
          border: 2px dashed #d1d5db;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >

      </div>

      <div 
        data-gjs-droppable="true"
        style="
          background: white;
          padding: 100px;
          border-radius: 12px;
          border: 2px dashed #d1d5db;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
      </div>

      <div 
        data-gjs-droppable="true"
        style="
          background: white;
          padding: 100px;
          border-radius: 12px;
          border: 2px dashed #d1d5db;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >

      </div>
    </div>
  `,
  },

  {
    id: 'hero-section',
    label: '🎨 بخش Hero',
    category: 'تمپلیت‌ها',
    content: `
  <section class="pb-hero">
    <div class="pb-hero__inner">
      <h1 class="pb-hero__title">عنوان اصلی شما اینجا قرار می‌گیرد</h1>

      <p class="pb-hero__text">
        توضیحات کوتاه و جذاب درباره محصول یا خدمات شما. روی موبایل اندازه متن‌ها کمتر می‌شود
        و همه چیز وسط و مرتب نمایش داده می‌شود.
      </p>

      <div class="pb-hero__actions">
        <a href="#" class="pb-hero__btn pb-hero__btn--primary">شروع کنید</a>
        <a href="#" class="pb-hero__btn pb-hero__btn--ghost">مشاهده بیشتر</a>
      </div>
    </div>
  </section>

  <style>
    .pb-hero{
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 80px 56px;
      margin: 20px 0;
      direction: rtl;
      box-sizing: border-box;
      min-height: 360px;

      display: flex;
      align-items: center;
      justify-content: center;

      overflow: hidden;
      text-align: center;
    }

    .pb-hero__inner{
      max-width: 1100px;
      width: 100%;
      margin: 0 auto;
    }

    .pb-hero__title{
      margin: 0 0 14px 0;
      color: #fff;
      font-weight: 800;
      font-size: 56px;
      line-height: 1.15;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: normal;
    }

    .pb-hero__text{
      margin: 0 auto 22px auto;
      color: rgba(255,255,255,0.92);
      font-size: 18px;
      line-height: 1.9;
      max-width: 70ch;
      overflow-wrap: anywhere;
    }

    .pb-hero__actions{
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .pb-hero__btn{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 22px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;

      min-width: 160px;
      max-width: 260px;
      flex: 1 1 180px;
      box-sizing: border-box;
      white-space: nowrap;
    }

    .pb-hero__btn--primary{
      background: #ffffff;
      color: #4f46e5;
      box-shadow: 0 10px 25px rgba(0,0,0,0.18);
    }

    .pb-hero__btn--ghost{
      background: rgba(255,255,255,0.14);
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.28);
      backdrop-filter: blur(6px);
    }

    .pb-hero__btn:hover{
      transform: translateY(-1px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.22);
    }

    @media (max-width: 520px){
      .pb-hero{
        padding: 44px 18px;
        min-height: 0;
        text-align: center;
      }

      .pb-hero__inner{
        max-width: 560px;
      }

      .pb-hero__title{
        font-size: 30px;
        line-height: 1.25;
        margin-bottom: 10px;
      }

      .pb-hero__text{
        font-size: 14px;
        line-height: 1.85;
        margin-bottom: 18px;
        max-width: 46ch;
      }

      .pb-hero__actions{
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .pb-hero__btn{
        width: 100%;
        max-width: 320px;
        min-width: 0;
      }
    }

    @media (max-width: 380px){
      .pb-hero{
        padding: 38px 14px;
      }
      .pb-hero__title{
        font-size: 26px;
      }
      .pb-hero__text{
        font-size: 13px;
      }
    }
  </style>
  `
  },

  { id: 'icon-list', label: '✅ لیست با آیکن', category: 'متن', content: '' },

  { id: 'spacer', label: '↕️ فاصله عمودی', category: 'لایوت', content: '<div style="height: 60px;"></div>' },
  { id: 'divider', label: '➖ خط جداکننده', category: 'لایوت', content: '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 40px 0;" />' },
];

export default blocks;
