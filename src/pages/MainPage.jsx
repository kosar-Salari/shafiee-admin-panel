// src/pages/MainPage.jsx یا AdminMainPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Info,
  X,
  Smartphone,
} from 'lucide-react';
import NewsArticlesSettings from '../components/NewsArticlesSettings';
import LinkedImagesSettings from '../components/LinkImageManager';

import { getSettings, updateSettings } from '../services/settingsService';
import { apiToLocal } from '../services/settingsMapper';
import { uploadFile } from '../services/uploadService';

export default function AdminMainPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ───── Core UI state
  const [logo, setLogo] = useState('');
  const [bannerImage, setBannerImage] = useState(''); // mainBanner دسکتاپ

  const [bannerSideCards, setBannerSideCards] = useState([
    { id: 'side-left', position: 'left', image: '', imageMobile: '', link: '/' },
    { id: 'side-right', position: 'right', image: '', imageMobile: '', link: '/' },
  ]);

  // imageLinks1: عکس‌های بالا/پایین بنر
  const [linkCards, setLinkCards] = useState([]); // [{id, image, imageMobile, link, position}]

  // برای Drag & Drop
  const [draggedCard, setDraggedCard] = useState(null);

  // News/Articles
  const [newsActive, setNewsActive] = useState(true);
  const [articlesActive, setArticlesActive] = useState(true);
  const [newsCount, setNewsCount] = useState(3);
  const [articlesCount, setArticlesCount] = useState(3);

  // پیش‌نمایش
  const [showPreview, setShowPreview] = useState(false);

  /* ────────────────────────────────────────────────────────────
     Init: GET settings → fill UI
     از هر دو آبجکت raw (remote) و local استفاده می‌کنیم
  ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const remote = await getSettings(); // داده خام از API
        const local = apiToLocal ? apiToLocal(remote || {}) : (remote || {});

        if (!isMounted) return;

        // لوگو
        setLogo(local.logo || remote.logo || '');

        // بنر اصلی (دسکتاپ)
        setBannerImage(local.mainBanner || remote.mainBanner || '');

        // دوتا بنر کناری: دسکتاپ + موبایل + لینک
        const leftBanner = local.leftBanner || remote.leftBanner || '';
        const leftBannerMobile =
          local.leftBannerMobile ||
          remote.leftBannerMobile ||
          '';
        const leftBannerLink =
          local.leftBannerLink ||
          remote.leftBannerLink ||
          '/';

        const rightBanner = local.rightBanner || remote.rightBanner || '';
        const rightBannerMobile =
          local.rightBannerMobile ||
          remote.rightBannerMobile ||
          '';
        const rightBannerLink =
          local.rightBannerLink ||
          remote.rightBannerLink ||
          '/';

        setBannerSideCards([
          {
            id: 'side-left',
            position: 'left',
            image: leftBanner,
            imageMobile: leftBannerMobile,
            link: leftBannerLink,
          },
          {
            id: 'side-right',
            position: 'right',
            image: rightBanner,
            imageMobile: rightBannerMobile,
            link: rightBannerLink,
          },
        ]);

        // imageLinks1 (بالا و پایین بنر)
        const linksSource =
          (Array.isArray(local.imageLinks1) && local.imageLinks1) ||
          (Array.isArray(remote.imageLinks1) && remote.imageLinks1) ||
          [];

        const withIds = linksSource
          .slice()
          .sort((a, b) => {
            const pa = a.position != null ? a.position : 0;
            const pb = b.position != null ? b.position : 0;
            return pa - pb;
          })
          .map((c, i) => ({
            id: 'c-' + (i + 1),
            image: c.image || '',
            imageMobile: c.imageMobile || '',
            link: c.link || '/',
            position: c.position != null ? c.position : (i + 1),
          }));

        setLinkCards(withIds);

        // سایر تنظیمات
        setNewsActive(
          local.newsActive != null
            ? !!local.newsActive
            : !!remote.newsActive
        );
        setArticlesActive(
          local.articlesActive != null
            ? !!local.articlesActive
            : !!remote.articlesActive
        );
        setNewsCount(
          Number(
            local.newsCount != null
              ? local.newsCount
              : remote.newsCount != null
              ? remote.newsCount
              : 3
          )
        );
        setArticlesCount(
          Number(
            local.articlesCount != null
              ? local.articlesCount
              : remote.articlesCount != null
              ? remote.articlesCount
              : 3
          )
        );
      } catch (e) {
        console.error(e);
        setError('دریافت تنظیمات با خطا مواجه شد.');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const sortedCards = useMemo(
    () =>
      linkCards
        .slice()
        .sort((a, b) => {
          const pa = a.position != null ? a.position : 0;
          const pb = b.position != null ? b.position : 0;
          return pa - pb;
        }),
    [linkCards]
  );

  /* ────────────────────────────────────────────────────────────
     Upload handlers (آپلود واقعی به سرور، بدون فشرده‌سازی)
  ──────────────────────────────────────────────────────────── */
  const handleUpload = async (file, options) => {
    if (!file) return;
    const opts = options || {};
    const folder = opts.folder || 'images';
    const onDone = opts.onDone;

    try {
      const url = await uploadFile(file, { folder: folder });
      if (onDone) {
        onDone(url);
      }
    } catch (e) {
      console.error('Upload error:', e);
      alert('آپلود ناموفق بود.');
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, { folder: 'banners', onDone: setBannerImage });
  };

  const handleBannerSideCardUpload = (cardId, e) => {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/sides',
      onDone: (url) => {
        setBannerSideCards((cards) =>
          cards.map((c) =>
            c.id === cardId ? { ...c, image: url } : c
          )
        );
      },
    });
  };

  const handleBannerSideCardMobileUpload = (cardId, e) => {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/sides/mobile',
      onDone: (url) => {
        setBannerSideCards((cards) =>
          cards.map((c) =>
            c.id === cardId ? { ...c, imageMobile: url } : c
          )
        );
      },
    });
  };

  const handleCardImageUpload = (cardId, e) => {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/linked',
      onDone: (url) => {
        setLinkCards((cards) =>
          cards.map((c) =>
            c.id === cardId ? { ...c, image: url } : c
          )
        );
      },
    });
  };

  const handleCardImageMobileUpload = (cardId, e) => {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/linked/mobile',
      onDone: (url) => {
        setLinkCards((cards) =>
          cards.map((c) =>
            c.id === cardId ? { ...c, imageMobile: url } : c
          )
        );
      },
    });
  };

  /* ────────────────────────────────────────────────────────────
     CRUD + DnD برای لینک‌کارت‌ها (imageLinks1)
  ──────────────────────────────────────────────────────────── */
  const addNewCard = () => {
    const maxPos = linkCards.reduce((mx, c) => {
      const p = c.position != null ? c.position : 0;
      return p > mx ? p : mx;
    }, 0);
    setLinkCards((prev) => [
      ...prev,
      {
        id: 'c-' + Date.now(),
        image: '',
        imageMobile: '',
        link: '/',
        position: maxPos + 1,
      },
    ]);
  };

  const deleteCard = (cardId) => {
    setLinkCards((cards) => {
      const filtered = cards.filter((c) => c.id !== cardId);
      return filtered
        .slice()
        .sort((a, b) => {
          const pa = a.position != null ? a.position : 0;
          const pb = b.position != null ? b.position : 0;
          return pa - pb;
        })
        .map((c, i) => ({ ...c, position: i + 1 }));
    });
  };

  const updateCard = (cardId, field, value) => {
    setLinkCards((cards) =>
      cards.map((c) =>
        c.id === cardId ? { ...c, [field]: value } : c
      )
    );
  };

  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetCard) => {
    e.preventDefault();
    if (!draggedCard || draggedCard.id === targetCard.id) return;

    const list = sortedCards;
    const draggedIdx = list.findIndex(
      (x) => x.id === draggedCard.id
    );
    const targetIdx = list.findIndex(
      (x) => x.id === targetCard.id
    );
    if (draggedIdx < 0 || targetIdx < 0) return;

    const next = list.slice();
    const item = next.splice(draggedIdx, 1)[0];
    next.splice(targetIdx, 0, item);

    const renumbered = next.map((c, i) => ({
      ...c,
      position: i + 1,
    }));
    setLinkCards(renumbered);
    setDraggedCard(null);
  };

  // Side cards link edit
  const updateBannerSideCard = (cardId, field, value) => {
    setBannerSideCards((cards) =>
      cards.map((c) =>
        c.id === cardId ? { ...c, [field]: value } : c
      )
    );
  };

  const removeBannerSideCard = (cardId) => {
    setBannerSideCards((cards) =>
      cards.map((c) =>
        c.id === cardId
          ? { ...c, image: '', imageMobile: '', link: '/' }
          : c
      )
    );
  };

  /* ────────────────────────────────────────────────────────────
     SAVE (PATCH)
  ──────────────────────────────────────────────────────────── */
  const saveHeroChanges = async () => {
    try {
      setSaving(true);
      setError('');

      const currentSettings = await getSettings(); // raw

      const left =
        bannerSideCards.find((c) => c.id === 'side-left') || {};
      const right =
        bannerSideCards.find((c) => c.id === 'side-right') || {};

      const leftImage = left.image || '';
      const rightImage = right.image || '';

      const leftImageMobile = left.imageMobile || leftImage;
      const rightImageMobile =
        right.imageMobile || rightImage;

      const leftLink = left.link || '';
      const rightLink = right.link || '';

      const payload = {
        ...currentSettings,

        logo: logo,

        // بنر اصلی: موبایل = همان دسکتاپ (طبق حرف خودت)
        mainBanner: bannerImage,
        mainBannerMobile: bannerImage,

        // بنرهای کناری: دسکتاپ + موبایل + لینک
        leftBanner: leftImage,
        leftBannerMobile: leftImageMobile,
        leftBannerLink: leftLink,

        rightBanner: rightImage,
        rightBannerMobile: rightImageMobile,
        rightBannerLink: rightLink,

        newsActive: newsActive,
        articlesActive: articlesActive,
        newsCount: newsCount,
        articlesCount: articlesCount,

        disableCommentsForPages:
          currentSettings.disableCommentsForPages ||
          null,

        // کارت‌های لینک‌دار (imageLinks1)
        imageLinks1: sortedCards.map((c) => {
          const img = c.image || '';
          const imgMobile = c.imageMobile || img;
          return {
            image: img,
            imageMobile: imgMobile,
            link: c.link,
            position: c.position,
          };
        }),
      };

      console.log('📤 Direct payload:', payload);
      await updateSettings(payload);

      alert('تغییرات ذخیره شد! ✅');
    } catch (e) {
      console.error('خطا در ذخیره:', e);
      setError('ذخیره تنظیمات با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

  /* ────────────────────────────────────────────────────────────
     مقادیر کمکی برای پیش‌نمایش
  ──────────────────────────────────────────────────────────── */
  const hasLeftSide =
    bannerSideCards[0] && !!bannerSideCards[0].image;
  const hasRightSide =
    bannerSideCards[1] && !!bannerSideCards[1].image;

  const topCardsPreview = sortedCards.slice(0, 2);
  const bottomCardsPreview = sortedCards.slice(2);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin" />
          <span>در حال بارگذاری تنظیمات…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-lahzeh" dir="rtl">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            مدیریت صفحه اصلی
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* ── Hero (banner + side images) ─────────────────────── */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                ry="2"
              ></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            بنر اصلی و عکس‌های کناری
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Right Side Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-2 text-center">
                عکس سمت راست (اختیاری)
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 mb-3 flex items-start gap-2">
                <Info
                  size={16}
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-blue-800">
                  <strong>ابعاد روی سایت (دسکتاپ):</strong> حدوداً
                  ۲۶۰×۲۷۷ پیکسل (عرض × ارتفاع)
                </p>
              </div>
              {bannerSideCards[1] && bannerSideCards[1].image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={bannerSideCards[1].image}
                      alt="کارت کناری راست"
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    <button
                      onClick={() =>
                        removeBannerSideCard('side-right')
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* نسخه موبایل کارت راست */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      نسخه موبایل (rightBannerMobile)
                    </label>
                    <div className="flex items-center gap-2">
                      <Smartphone
                        size={16}
                        className="text-gray-500"
                      />
                      <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-xs">
                        <Upload size={16} />
                        <span>
                          {bannerSideCards[1].imageMobile
                            ? 'تغییر تصویر موبایل'
                            : 'آپلود تصویر موبایل'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleBannerSideCardMobileUpload(
                              'side-right',
                              e
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                    {bannerSideCards[1].imageMobile && (
                      <img
                        src={bannerSideCards[1].imageMobile}
                        alt="نسخه موبایل کارت راست"
                        className="w-24 h-20 object-cover rounded border"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      لینک (rightBannerLink)
                    </label>
                    <input
                      type="text"
                      value={bannerSideCards[1].link}
                      onChange={(e) =>
                        updateBannerSideCard(
                          'side-right',
                          'link',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="/example"
                    />
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload
                    size={40}
                    className="text-gray-400 mb-2"
                  />
                  <span className="text-gray-600 text-sm text-center">
                    کلیک کنید برای آپلود
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleBannerSideCardUpload('side-right', e)
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Center Banner */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-2 text-center">
                بنر اصلی (وسط)
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 mb-3">
                <div className="flex items-start gap-2">
                  <Info
                    size={16}
                    className="text-blue-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-xs text-blue-800">
                    <p className="font-bold mb-1">
                      ابعاد روی سایت (دسکتاپ):
                    </p>
                    <p className="mb-1">
                      بنر اصلی با نسبت تقریبی{' '}
                      <strong>۶۶۰×۲۷۷</strong> پیکسل (عرض ×
                      ارتفاع) نمایش داده می‌شود؛ وجود یا عدم
                      وجود عکس‌های کناری فقط عرض نسبی آن را در
                      ردیف تغییر می‌دهد، نه نسبت تصویر را.
                    </p>
                    <p className="mt-1 text-[10px] text-blue-700">
                      می‌توانید تصویر را در ابعاد بزرگ‌تر ولی
                      با همین نسبت طراحی کنید تا کیفیت روی
                      مانیتورهای بزرگ‌تر بهتر باشد.
                    </p>
                  </div>
                </div>
              </div>
              {bannerImage ? (
                <div className="relative">
                  <img
                    src={bannerImage}
                    alt="بنر"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setBannerImage('')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload
                    size={48}
                    className="text-gray-400 mb-2"
                  />
                  <span className="text-gray-600 text-center">
                    کلیک کنید و عکس بنر را با ابعاد مناسب آپلود
                    کنید
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Left Side Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-2 text-center">
                عکس سمت چپ (اختیاری)
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 mb-3 flex items-start gap-2">
                <Info
                  size={16}
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-blue-800">
                  <strong>ابعاد روی سایت (دسکتاپ):</strong> حدوداً
                  ۲۶۰×۲۷۷ پیکسل (عرض × ارتفاع)
                </p>
              </div>
              {bannerSideCards[0] && bannerSideCards[0].image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={bannerSideCards[0].image}
                      alt="کارت کناری چپ"
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    <button
                      onClick={() =>
                        removeBannerSideCard('side-left')
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* نسخه موبایل کارت چپ */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      نسخه موبایل (leftBannerMobile)
                    </label>
                    <div className="flex items-center gap-2">
                      <Smartphone
                        size={16}
                        className="text-gray-500"
                      />
                      <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-xs">
                        <Upload size={16} />
                        <span>
                          {bannerSideCards[0].imageMobile
                            ? 'تغییر تصویر موبایل'
                            : 'آپلود تصویر موبایل'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleBannerSideCardMobileUpload(
                              'side-left',
                              e
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                    {bannerSideCards[0].imageMobile && (
                      <img
                        src={bannerSideCards[0].imageMobile}
                        alt="نسخه موبایل کارت چپ"
                        className="w-24 h-20 object-cover rounded border"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      لینک (leftBannerLink)
                    </label>
                    <input
                      type="text"
                      value={bannerSideCards[0].link}
                      onChange={(e) =>
                        updateBannerSideCard(
                          'side-left',
                          'link',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="/example"
                    />
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload
                    size={40}
                    className="text-gray-400 mb-2"
                  />
                  <span className="text-gray-600 text-sm text-center">
                    کلیک کنید برای آپلود
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleBannerSideCardUpload('side-left', e)
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ── Link Cards (imageLinks1) ────────────────────────── */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              عکس‌های لینک‌دار (بالا و پایین بنر)
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={addNewCard}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus size={20} />
                افزودن عکس جدید
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCards.map((card, idx) => {
              const totalAfterBanner = sortedCards.length - 2;
              const indexAfterBanner = idx - 2;
              const isAfterBanner = idx >= 2;
              const isLastAndOdd =
                isAfterBanner &&
                indexAfterBanner === totalAfterBanner - 1 &&
                totalAfterBanner % 2 === 1;

              return (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, card)}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-move"
                >
                  <div className="flex items-start gap-3">
                    <div className="cursor-grab active:cursor-grabbing mt-2">
                      <GripVertical
                        size={24}
                        className="text-gray-400"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* راهنمای ابعاد */}
                      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 flex items-start gap-2">
                        <Info
                          size={14}
                          className="text-blue-600 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-xs text-blue-800">
                          <p>
                            {isLastAndOdd ? (
                              <>
                                <strong>
                                  عکس تمام‌عرض (بالا/پایین بنر –
                                  دسکتاپ):
                                </strong>{' '}
                                حدوداً ۱۱۸۰×۱۸۰ پیکسل (عرض ×
                                ارتفاع)
                              </>
                            ) : (
                              <>
                                <strong>
                                  عکس نصف‌عرض (بالا/پایین بنر –
                                  دسکتاپ):
                                </strong>{' '}
                                حدوداً ۵۹۰×۱۸۰ پیکسل (عرض ×
                                ارتفاع)
                              </>
                            )}
                          </p>
                          <p className="mt-1 text-[10px] text-blue-700">
                            در نسخه موبایل از{' '}
                            <code>imageMobile</code> استفاده
                            می‌شود؛ اگر خالی باشد، خودش برابر{' '}
                            <code>image</code> ذخیره می‌شود.
                          </p>
                        </div>
                      </div>

                      {/* پیش‌نمایش دسکتاپ کارت */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <div
                          style={{
                            aspectRatio: isLastAndOdd
                              ? '1180 / 180'
                              : '590 / 180',
                          }}
                        >
                          {card.image ? (
                            <img
                              src={card.image}
                              alt="کارت دسکتاپ"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <span className="text-gray-400">
                                بدون عکس (دسکتاپ)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* پیش‌نمایش موبایل کارت */}
                      <div className="border border-dashed border-gray-300 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <Smartphone size={14} />
                            <span>نسخه موبایل این کارت</span>
                          </div>
                        </div>
                        <div
                          className="w-full"
                          style={{ aspectRatio: '172.5 / 142' }}
                        >
                          {card.imageMobile ? (
                            <img
                              src={card.imageMobile}
                              alt="کارت موبایل"
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded">
                              <span className="text-gray-400 text-xs">
                                بدون تصویر موبایل
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* آپلود دسکتاپ */}
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a 2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">
                            {card.image
                              ? 'تغییر عکس دسکتاپ'
                              : 'آپلود عکس دسکتاپ'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleCardImageUpload(card.id, e)
                            }
                            className="hidden"
                          />
                        </label>

                        {/* آپلود موبایل */}
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-gray-50 text-xs">
                          <Smartphone size={16} />
                          <span>
                            {card.imageMobile
                              ? 'تغییر عکس موبایل'
                              : 'آپلود عکس موبایل'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleCardImageMobileUpload(
                                card.id,
                                e
                              )
                            }
                            className="hidden"
                          />
                        </label>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            لینک
                          </label>
                          <input
                            type="text"
                            value={card.link}
                            onChange={(e) =>
                              updateCard(card.id, 'link', e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="/example"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-gray-400">
                          order: {card.position}
                        </div>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2"
                        >
                          <Trash2 size={18} />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save + Preview buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              پیش‌نمایش در اندازه دسکتاپ
            </button>
            <button
              onClick={saveHeroChanges}
              disabled={saving}
              className="bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

        {/* سایر بخش‌ها */}
        <NewsArticlesSettings
          value={{
            newsActive: newsActive,
            articlesActive: articlesActive,
            newsCount: newsCount,
            articlesCount: articlesCount,
          }}
          onChange={(v) => {
            setNewsActive(!!v.newsActive);
            setArticlesActive(!!v.articlesActive);
            setNewsCount(
              Number(
                v.newsCount != null ? v.newsCount : 3
              )
            );
            setArticlesCount(
              Number(
                v.articlesCount != null ? v.articlesCount : 3
              )
            );
          }}
        />
        <LinkedImagesSettings />
      </div>

      {/* ── Preview Modal: دقیقا لایوت دسکتاپ HomePage ───────── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-bold">
                پیش‌نمایش صفحه اصلی (نمای دسکتاپ)
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-100">
              <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[130px] mx-auto py-4">
                {/* لایوت دسکتاپ HomePage */}
                <div className="mt-3">
                  <div className="w-full space-y-4">
                    {/* Top Row */}
                    {topCardsPreview.length > 0 && (
                      <div
                        className={`grid ${
                          topCardsPreview.length === 1
                            ? 'grid-cols-1'
                            : 'grid-cols-2'
                        } gap-4`}
                      >
                        {topCardsPreview.map((card, index) => (
                          <div
                            key={card.id || index}
                            className={`block rounded-lg overflow-hidden shadow-lg w-full ${
                              topCardsPreview.length === 1
                                ? ''
                                : 'aspect-[590/180]'
                            }`}
                            style={
                              topCardsPreview.length === 1
                                ? { height: '180px' }
                                : {}
                            }
                          >
                            {card.image ? (
                              <img
                                src={card.image}
                                alt={'تصویر ' + (index + 1)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">
                                  بدون تصویر
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Banner Row - بنر اصلی + عکس‌های کناری */}
                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns:
                          hasRightSide && hasLeftSide
                            ? '21.6% 54.8% 21.6%'
                            : hasRightSide || hasLeftSide
                            ? '28.2% 71.8%'
                            : '1fr',
                      }}
                    >
                      {/* Right Side Card */}
                      {hasRightSide && (
                        <div className="block rounded-lg overflow-hidden shadow-lg w-full aspect-[260/277]">
                          {bannerSideCards[1].image ? (
                            <img
                              src={bannerSideCards[1].image}
                              alt="تصویر کناری راست"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">
                                بدون تصویر
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Center Banner */}
                      <div className="rounded-lg overflow-hidden shadow-lg w-full aspect-[660/277]">
                        {bannerImage ? (
                          <img
                            src={bannerImage}
                            alt="بنر اصلی"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                              بنر اصلی
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Left Side Card */}
                      {hasLeftSide && (
                        <div className="block rounded-lg overflow-hidden shadow-lg w-full aspect-[260/277]">
                          {bannerSideCards[0].image ? (
                            <img
                              src={bannerSideCards[0].image}
                              alt="تصویر کناری چپ"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">
                                بدون تصویر
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Rows */}
                    {bottomCardsPreview.length > 0 && (
                      <div className="space-y-4">
                        {(() => {
                          const rows = [];
                          for (
                            let i = 0;
                            i < bottomCardsPreview.length;
                            i += 2
                          ) {
                            const card1 =
                              bottomCardsPreview[i];
                            const card2 =
                              bottomCardsPreview[i + 1];

                            rows.push(
                              <div
                                key={'bottom-' + i}
                                className={`grid ${
                                  card2
                                    ? 'grid-cols-2'
                                    : 'grid-cols-1'
                                } gap-4`}
                              >
                                <div
                                  className={`block rounded-lg overflow-hidden shadow-lg w-full ${
                                    card2
                                      ? 'aspect-[590/180]'
                                      : ''
                                  }`}
                                  style={
                                    !card2
                                      ? { height: '180px' }
                                      : {}
                                  }
                                >
                                  {card1.image ? (
                                    <img
                                      src={card1.image}
                                      alt={'تصویر ' + (i + 3)}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-400">
                                        بدون تصویر
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {card2 && (
                                  <div className="block rounded-lg overflow-hidden shadow-lg w-full aspect-[590/180]">
                                    {card2.image ? (
                                      <img
                                        src={card2.image}
                                        alt={'تصویر ' + (i + 4)}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">
                                          بدون تصویر
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return rows;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
