// src/pages/AdminMainPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Upload, Plus, Trash2, GripVertical, Loader2, Info } from 'lucide-react';
import NewsArticlesSettings from '../components/NewsArticlesSettings';
import LinkedImagesSettings from '../components/LinkImageManager';

import { getSettings,updateSettings} from '../services/settingsService';

import {localToApi , apiToLocal } from '../services/settingsMapper';
import {uploadFile} from '../services/uploadService';

export default function AdminMainPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ───── Core UI state (mapped از بک‌اند)
  const [logo, setLogo] = useState('');
  const [bannerImage, setBannerImage] = useState(''); // mainBanner
  const [bannerSideCards, setBannerSideCards] = useState([
    { id: 'side-left', position: 'left', image: '', link: '/' },
    { id: 'side-right', position: 'right', image: '', link: '/' },
  ]);

  // imageLinks1: عکس‌های بالا/پایین بنر (همون "linkCards" شما)
  const [linkCards, setLinkCards] = useState([]); // [{id, image, link, position}]

  // برای Drag & Drop
  const [draggedCard, setDraggedCard] = useState(null);

  // News/Articles (اگر داخل NewsArticlesSettings مدیریت می‌کنی، این‌ها را هم‌سان کن)
  const [newsActive, setNewsActive] = useState(true);
  const [articlesActive, setArticlesActive] = useState(true);
  const [newsCount, setNewsCount] = useState(3);
  const [articlesCount, setArticlesCount] = useState(3);

  /* ────────────────────────────────────────────────────────────
     Init: GET settings → fill UI
  ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const apiData = await getSettings();
        const local = apiToLocal(apiData);

        if (!isMounted) return;

        setLogo(local.logo || '');
        setBannerImage(local.mainBanner || '');
        setBannerSideCards([
          { id: 'side-left', position: 'left', image: local.leftBanner || '', link: '/' },
          { id: 'side-right', position: 'right', image: local.rightBanner || '', link: '/' },
        ]);

        // فقط imageLinks1 را در این صفحه مدیریت می‌کنیم (طبق توضیح شما: بالا و پایین بنر)
        const links = Array.isArray(local.imageLinks1) ? local.imageLinks1 : [];
        const withIds = links
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((c, i) => ({ id: `c-${i + 1}`, image: c.image || '', link: c.link || '/', position: c.position ?? (i + 1) }));
        setLinkCards(withIds);

        setNewsActive(!!local.newsActive);
        setArticlesActive(!!local.articlesActive);
        setNewsCount(Number(local.newsCount ?? 3));
        setArticlesCount(Number(local.articlesCount ?? 3));
      } catch (e) {
        setError('دریافت تنظیمات با خطا مواجه شد.');
      } finally {
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const sortedCards = useMemo(
    () => linkCards.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [linkCards]
  );

  /* ────────────────────────────────────────────────────────────
     Upload handlers (آپلود واقعی به سرور، بدون فشرده‌سازی)
  ──────────────────────────────────────────────────────────── */
  const handleUpload = async (file, { folder = 'images', onDone }) => {
    if (!file) return;
    try {
      const url = await uploadFile(file, { folder });
      if (onDone) onDone(url);
    } catch (e) {
      console.error('Upload error:', e);
      alert('آپلود ناموفق بود.');
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    handleUpload(file, { folder: 'banners', onDone: setBannerImage });
  };
  const handleBannerSideCardUpload = (cardId, e) => {
    const file = e.target.files?.[0];
    handleUpload(file, {
      folder: 'banners/sides',
      onDone: (url) => {
        setBannerSideCards((cards) =>
          cards.map((c) => (c.id === cardId ? { ...c, image: url } : c))
        );
      },
    });
  };
  const handleCardImageUpload = (cardId, e) => {
    const file = e.target.files?.[0];
    handleUpload(file, {
      folder: 'banners/linked',
      onDone: (url) => {
        setLinkCards((cards) =>
          cards.map((c) => (c.id === cardId ? { ...c, image: url } : c))
        );
      },
    });
  };

  /* ────────────────────────────────────────────────────────────
     CRUD + DnD برای لینک‌کارت‌ها (imageLinks1)
  ──────────────────────────────────────────────────────────── */
  const addNewCard = () => {
    const maxPos = linkCards.reduce((mx, c) => Math.max(mx, c.position ?? 0), 0);
    setLinkCards((prev) => [...prev, { id: `c-${Date.now()}`, image: '', link: '/', position: maxPos + 1 }]);
  };
  const deleteCard = (cardId) => {
    setLinkCards((cards) => {
      const filtered = cards.filter((c) => c.id !== cardId);
      // Re-number positions
      return filtered
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((c, i) => ({ ...c, position: i + 1 }));
    });
  };
  const updateCard = (cardId, field, value) => {
    setLinkCards((cards) => cards.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)));
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

    // مرتب‌سازی مجدد بر اساس position
    const list = sortedCards; // already sorted
    const draggedIdx = list.findIndex((x) => x.id === draggedCard.id);
    const targetIdx = list.findIndex((x) => x.id === targetCard.id);
    if (draggedIdx < 0 || targetIdx < 0) return;

    const next = list.slice();
    const [item] = next.splice(draggedIdx, 1);
    next.splice(targetIdx, 0, item);

    // Re-number positions
    const renumbered = next.map((c, i) => ({ ...c, position: i + 1 }));
    setLinkCards(renumbered);
    setDraggedCard(null);
  };

  // Side cards link edit
  const updateBannerSideCard = (cardId, field, value) => {
    setBannerSideCards((cards) => cards.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)));
  };
  const removeBannerSideCard = (cardId) => {
    setBannerSideCards((cards) => cards.map((c) => (c.id === cardId ? { ...c, image: '', link: '/' } : c)));
  };

  /* ────────────────────────────────────────────────────────────
     SAVE (PATCH) — دقیقاً با همان فرمت خواسته‌شده
  ──────────────────────────────────────────────────────────── */
  const saveHeroChanges = async () => {
    // تبدیل state به فرمت api
    const localBundle = {
      logo,
      mainBanner: bannerImage,
      rightBanner: bannerSideCards.find((c) => c.id === 'side-right')?.image || '',
      leftBanner: bannerSideCards.find((c) => c.id === 'side-left')?.image || '',
      newsActive,
      articlesActive,
      newsCount,
      articlesCount,
      // فقط imageLinks1 را از این صفحه ارسال می‌کنیم
      imageLinks1: sortedCards.map((c) => ({ image: c.image, link: c.link, position: c.position })),
      imageLinks2: [], // اگر صفحه‌ی دیگری مدیریت می‌کند، اینجا دست نزن
      menuItems: [],   // این صفحه مدیریت منو ندارد
      footerColumns: [], // همین‌طور
    };

    const payload = localToApi(localBundle);

    try {
      setSaving(true);
      setError('');
      await updateSettings(payload);
      alert('تغییرات ذخیره شد! ✅');
    } catch (e) {
      setError('ذخیره تنظیمات با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

  /* ────────────────────────────────────────────────────────────
     UI
  ──────────────────────────────────────────────────────────── */
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
          <h1 className="text-2xl font-bold text-gray-900">مدیریت صفحه اصلی</h1>
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            بنر اصلی و عکس‌های کناری
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Right Side Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-2 text-center">عکس سمت راست (اختیاری)</h3>
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 mb-3 flex items-start gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>ابعاد پیشنهادی:</strong> 380×640 
                </p>
              </div>
              {bannerSideCards[1]?.image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img src={bannerSideCards[1].image} alt="کارت کناری راست" className="w-full h-80 object-cover rounded-lg" />
                    <button
                      onClick={() => removeBannerSideCard('side-right')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">لینک</label>
                    <input
                      type="text"
                      value={bannerSideCards[1].link}
                      onChange={(e) => updateBannerSideCard('side-right', 'link', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="/example"
                    />
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 text-sm text-center">کلیک کنید برای آپلود</span>
                  <input type="file" accept="image/*" onChange={(e) => handleBannerSideCardUpload('side-right', e)} className="hidden" />
                </label>
              )}
            </div>

            {/* Center Banner */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-2 text-center">بنر اصلی (وسط)</h3>
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 mb-3">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-bold mb-1">ابعاد پیشنهادی:</p>
                    <p className="mb-1">• با دو عکس کناری: <strong>380×1280</strong> </p>
                    <p className="mb-1">• با یک عکس کناری: <strong>380×1600</strong> </p>
                    <p>• بدون عکس کناری: <strong>380×1920</strong> </p>
                  </div>
                </div>
              </div>
              {bannerImage ? (
                <div className="relative">
                  <img src={bannerImage} alt="بنر" className="w-full h-80 object-cover rounded-lg" />
                  <button
                    onClick={() => setBannerImage('')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload size={48} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 text-center">کلیک کنید و عکس بنر را آپلود کنید</span>
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Left Side Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-2 text-center">عکس سمت چپ (اختیاری)</h3>
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 mb-3 flex items-start gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>ابعاد پیشنهادی:</strong> 380×640 پیکسل 
                </p>
              </div>
              {bannerSideCards[0]?.image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img src={bannerSideCards[0].image} alt="کارت کناری چپ" className="w-full h-80 object-cover rounded-lg" />
                    <button
                      onClick={() => removeBannerSideCard('side-left')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">لینک</label>
                    <input
                      type="text"
                      value={bannerSideCards[0].link}
                      onChange={(e) => updateBannerSideCard('side-left', 'link', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="/example"
                    />
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 text-sm text-center">کلیک کنید برای آپلود</span>
                  <input type="file" accept="image/*" onChange={(e) => handleBannerSideCardUpload('side-left', e)} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ── Link Cards (imageLinks1) ────────────────────────── */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
              // تشخیص اینکه این کارت آخری و فرد است یا نه
              const totalAfterBanner = sortedCards.length - 2;
              const indexAfterBanner = idx - 2;
              const isAfterBanner = idx >= 2;
              const isLastAndOdd = isAfterBanner && indexAfterBanner === totalAfterBanner - 1 && totalAfterBanner % 2 === 1;

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
                      <GripVertical size={24} className="text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* راهنمای ابعاد */}
                      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 flex items-start gap-2">
                        <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-800">
                          {isLastAndOdd ? (
                            <>
                              <strong>عکس تمام‌عرض:</strong> 192×1920
                            </>
                          ) : (
                            <>
                              <strong>عکس نصف‌عرض:</strong> 192×960
                            </>
                          )}
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        {card.image ? (
                          <img src={card.image} alt="کارت" className="w-full h-48 object-cover" />
                        ) : (
                          <div className="h-48 flex items-center justify-center bg-gray-50">
                            <span className="text-gray-400">بدون عکس</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a 2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">{card.image ? 'تغییر عکس' : 'آپلود عکس'}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleCardImageUpload(card.id, e)} className="hidden" />
                        </label>
                        <div>
                          <label className="block text-sm font-medium mb-1">لینک</label>
                          <input
                            type="text"
                            value={card.link}
                            onChange={(e) => updateCard(card.id, 'link', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="/example"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-gray-400">order: {card.position}</div>
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

          {/* Save only this section */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveHeroChanges}
              disabled={saving}
              className="bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

        {/* ── Preview (Hero) ──────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">پیش‌نمایش بخش بالای صفحه</h2>
          <div className="border-2 rounded-lg p-4 bg-gray-50">
            {/* Top Row (اولین دو کارت) */}
            {sortedCards.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {sortedCards.slice(0, 2).map((card) => (
                  <div key={card.id} className="rounded-lg overflow-hidden border-2 border-gray-300">
                    {card.image ? (
                      <img src={card.image} alt="کارت" className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">بدون عکس</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Banner Row with Side Cards */}
            <div className="grid grid-cols-12 gap-4 my-4 items-stretch">
              {/* Right Side Card */}
              {bannerSideCards[1]?.image && (
                <div className="col-span-3 rounded-lg overflow-hidden border-2 border-gray-300">
                  <img src={bannerSideCards[1].image} alt="کناری راست" className="w-full h-[380px] object-cover" />
                </div>
              )}

              {/* Center Banner — col-span بسته به وجود کناری‌ها */}
              <div
                className={[
                  bannerSideCards[0]?.image && bannerSideCards[1]?.image
                    ? 'col-span-6'
                    : (bannerSideCards[0]?.image || bannerSideCards[1]?.image)
                      ? 'col-span-9'
                      : 'col-span-12',
                  'rounded-lg overflow-hidden border-2 border-gray-300',
                ].join(' ')}
              >
                {bannerImage ? (
                  <img src={bannerImage} alt="بنر" className="w-full h-[380px] object-cover" />
                ) : (
                  <div className="w-full h-[380px] bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">بنر اصلی</span>
                  </div>
                )}
              </div>

              {/* Left Side Card */}
              {bannerSideCards[0]?.image && (
                <div className="col-span-3 rounded-lg overflow-hidden border-2 border-gray-300">
                  <img src={bannerSideCards[0].image} alt="کناری چپ" className="w-full h-[380px] object-cover" />
                </div>
              )}
            </div>

            {/* Bottom Rows — کارت‌های بعدی با پشتیبانی از full-width */}
            {sortedCards.length > 2 && (
              <div className="space-y-4">
                {(() => {
                  const remaining = sortedCards.slice(2);
                  const rows = [];
                  
                  for (let i = 0; i < remaining.length; i += 2) {
                    const isLastAndOdd = i === remaining.length - 1;
                    
                    if (isLastAndOdd) {
                      // آخری فرد است - full width
                      rows.push(
                        <div key={`row-${i}`} className="w-full">
                          <div className="rounded-lg overflow-hidden border-2 border-gray-300">
                            {remaining[i].image ? (
                              <img src={remaining[i].image} alt="کارت" className="w-full h-48 object-cover" />
                            ) : (
                              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">بدون عکس (تمام‌عرض)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      // دو تایی معمولی
                      rows.push(
                        <div key={`row-${i}`} className="grid grid-cols-2 gap-4">
                          {[remaining[i], remaining[i + 1]].filter(Boolean).map((card) => (
                            <div key={card.id} className="rounded-lg overflow-hidden border-2 border-gray-300">
                              {card.image ? (
                                <img src={card.image} alt="کارت" className="w-full h-48 object-cover" />
                              ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400">بدون عکس</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                  }
                  
                  return rows;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* سایر بخش‌ها (اگر لازم) */}
        <NewsArticlesSettings
          value={{
            newsActive, articlesActive, newsCount, articlesCount,
          }}
          onChange={(v) => {
            setNewsActive(!!v.newsActive);
            setArticlesActive(!!v.articlesActive);
            setNewsCount(Number(v.newsCount ?? 3));
            setArticlesCount(Number(v.articlesCount ?? 3));
          }}
        />
        <LinkedImagesSettings />
      </div>
    </div>
  );
}