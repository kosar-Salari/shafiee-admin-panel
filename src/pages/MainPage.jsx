// src/pages/MainPage.jsx
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import NewsArticlesSettings from '../components/NewsArticlesSettings';
import LinkedImagesSettings from '../components/LinkImageManager';
import { getSettings, updateSettings } from '../services/settingsService';
import { uploadFile } from '../services/uploadService';

export default function AdminMainPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [saveMsg, setSaveMsg] = useState('');
  const [saveMsgType, setSaveMsgType] = useState('success');

  const [logo, setLogo] = useState('');
  const [mainBanners, setMainBanners] = useState([]);

  const [bannerSideCards, setBannerSideCards] = useState([
    { id: 'side-left', position: 'left', image: '', imageMobile: '', link: '/' },
    { id: 'side-right', position: 'right', image: '', imageMobile: '', link: '/' },
  ]);

  const [linkCards, setLinkCards] = useState([]);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedBanner, setDraggedBanner] = useState(null);

  const [newsActive, setNewsActive] = useState(true);
  const [articlesActive, setArticlesActive] = useState(true);
  const [newsCount, setNewsCount] = useState(3);
  const [articlesCount, setArticlesCount] = useState(3);

  const [showPreview, setShowPreview] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [consultationFormTitle, setConsultationFormTitle] = useState('');
  const [smsWelcomeMessage, setSmsWelcomeMessage] = useState('');

  useEffect(function () {
    let isMounted = true;
    (async function () {
      try {
        setLoading(true);
        setError('');
        const remote = await getSettings();
        const data = remote && remote.data ? remote.data : remote || {};

        if (!isMounted) return;

        setLogo(data.logo || '');

        const bannersSource = Array.isArray(data.imageLinksMain) ? data.imageLinksMain : [];

        if (bannersSource.length === 0 && data.mainBanner) {
          setMainBanners([
            {
              id: 'b-1',
              image: data.mainBanner,
              imageMobile: data.mainBannerMobile || data.mainBanner,
              link: '/',
              position: 1,
            },
          ]);
        } else {
          const withIds = bannersSource
            .slice()
            .sort(function (a, b) {
              return (a.position || 0) - (b.position || 0);
            })
            .map(function (b, i) {
              return {
                id: 'b-' + (i + 1),
                image: b.image || '',
                imageMobile: b.imageMobile || '',
                link: b.link || '/',
                position: b.position || i + 1,
              };
            });
          setMainBanners(withIds);
        }

        setBannerSideCards([
          {
            id: 'side-left',
            position: 'left',
            image: data.leftBanner || '',
            imageMobile: data.leftBannerMobile || '',
            link: data.leftBannerLink || '/',
          },
          {
            id: 'side-right',
            position: 'right',
            image: data.rightBanner || '',
            imageMobile: data.rightBannerMobile || '',
            link: data.rightBannerLink || '/',
          },
        ]);

        const linksSource = Array.isArray(data.imageLinks1) ? data.imageLinks1 : [];
        const withCardIds = linksSource
          .slice()
          .sort(function (a, b) {
            return (a.position || 0) - (b.position || 0);
          })
          .map(function (c, i) {
            return {
              id: 'c-' + (i + 1),
              image: c.image || '',
              imageMobile: c.imageMobile || '',
              link: c.link || '/',
              position: c.position || i + 1,
            };
          });
        setLinkCards(withCardIds);

        setNewsActive(data.newsActive !== undefined ? data.newsActive : true);
        setArticlesActive(data.articlesActive !== undefined ? data.articlesActive : true);
        setNewsCount(Number(data.newsCount || 3));
        setArticlesCount(Number(data.articlesCount || 3));
        setConsultationFormTitle(data.consultationFormTitle || '');
        setSmsWelcomeMessage(data.smsWelcomeMessage || '');

      } catch (e) {
        console.error(e);
        setError('دریافت تنظیمات با خطا مواجه شد.');
      } finally {
        setLoading(false);
      }
    })();
    return function () {
      isMounted = false;
    };
  }, []);

  const sortedCards = useMemo(function () {
    return linkCards.slice().sort(function (a, b) {
      return (a.position || 0) - (b.position || 0);
    });
  }, [linkCards]);

  const sortedMainBanners = useMemo(function () {
    return mainBanners.slice().sort(function (a, b) {
      return (a.position || 0) - (b.position || 0);
    });
  }, [mainBanners]);

  const handleUpload = async function (file, options) {
    if (!file) return;
    const opts = options || {};
    const folder = opts.folder || 'images';
    const onDone = opts.onDone;

    try {
      const url = await uploadFile(file, { folder: folder });
      if (onDone) onDone(url);
    } catch (e) {
      console.error('Upload error:', e);
      alert('آپلود ناموفق بود.  لطفاً دوباره تلاش کنید.');
    }
  };

  const handleMainBannerUpload = function (bannerId, e) {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners',
      onDone: function (url) {
        setMainBanners(function (banners) {
          return banners.map(function (b) {
            return b.id === bannerId ? { ...b, image: url } : b;
          });
        });
      },
    });
  };

  const handleMainBannerMobileUpload = function (bannerId, e) {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/mobile',
      onDone: function (url) {
        setMainBanners(function (banners) {
          return banners.map(function (b) {
            return b.id === bannerId ? { ...b, imageMobile: url } : b;
          });
        });
      },
    });
  };

  const handleBannerSideCardUpload = function (cardId, e) {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/sides',
      onDone: function (url) {
        setBannerSideCards(function (cards) {
          return cards.map(function (c) {
            return c.id === cardId ? { ...c, image: url } : c;
          });
        });
      },
    });
  };

  const handleBannerSideCardMobileUpload = function (cardId, e) {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/sides/mobile',
      onDone: function (url) {
        setBannerSideCards(function (cards) {
          return cards.map(function (c) {
            return c.id === cardId ? { ...c, imageMobile: url } : c;
          });
        });
      },
    });
  };

  const handleCardImageUpload = function (cardId, e) {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/linked',
      onDone: function (url) {
        setLinkCards(function (cards) {
          return cards.map(function (c) {
            return c.id === cardId ? { ...c, image: url } : c;
          });
        });
      },
    });
  };

  const handleCardImageMobileUpload = function (cardId, e) {
    const file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/linked/mobile',
      onDone: function (url) {
        setLinkCards(function (cards) {
          return cards.map(function (c) {
            return c.id === cardId ? { ...c, imageMobile: url } : c;
          });
        });
      },
    });
  };

  const addNewMainBanner = function () {
    const maxPos = mainBanners.reduce(function (mx, b) {
      return Math.max(mx, b.position || 0);
    }, 0);
    setMainBanners(function (prev) {
      return prev.concat([
        {
          id: 'b-' + Date.now(),
          image: '',
          imageMobile: '',
          link: '/',
          position: maxPos + 1,
        },
      ]);
    });
  };

  const deleteMainBanner = function (bannerId) {
    setMainBanners(function (banners) {
      const filtered = banners.filter(function (b) {
        return b.id !== bannerId;
      });
      return filtered
        .slice()
        .sort(function (a, b) {
          return (a.position || 0) - (b.position || 0);
        })
        .map(function (b, i) {
          return { ...b, position: i + 1 };
        });
    });
  };

  const updateMainBanner = function (bannerId, field, value) {
    setMainBanners(function (banners) {
      return banners.map(function (b) {
        return b.id === bannerId ? { ...b, [field]: value } : b;
      });
    });
  };

  const handleBannerDragStart = function (e, banner) {
    setDraggedBanner(banner);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBannerDragOver = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleBannerDrop = function (e, targetBanner) {
    e.preventDefault();
    if (!draggedBanner || draggedBanner.id === targetBanner.id) return;

    const list = sortedMainBanners;
    let draggedIdx = -1;
    let targetIdx = -1;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === draggedBanner.id) draggedIdx = i;
      if (list[i].id === targetBanner.id) targetIdx = i;
    }
    if (draggedIdx < 0 || targetIdx < 0) return;

    const next = list.slice();
    const item = next.splice(draggedIdx, 1)[0];
    next.splice(targetIdx, 0, item);

    const renumbered = next.map(function (b, i) {
      return { ...b, position: i + 1 };
    });
    setMainBanners(renumbered);
    setDraggedBanner(null);
  };

  const addNewCard = function () {
    const maxPos = linkCards.reduce(function (mx, c) {
      return Math.max(mx, c.position || 0);
    }, 0);
    setLinkCards(function (prev) {
      return prev.concat([
        {
          id: 'c-' + Date.now(),
          image: '',
          imageMobile: '',
          link: '/',
          position: maxPos + 1,
        },
      ]);
    });
  };

  const deleteCard = function (cardId) {
    setLinkCards(function (cards) {
      const filtered = cards.filter(function (c) {
        return c.id !== cardId;
      });
      return filtered
        .slice()
        .sort(function (a, b) {
          return (a.position || 0) - (b.position || 0);
        })
        .map(function (c, i) {
          return { ...c, position: i + 1 };
        });
    });
  };

  const updateCard = function (cardId, field, value) {
    setLinkCards(function (cards) {
      return cards.map(function (c) {
        return c.id === cardId ? { ...c, [field]: value } : c;
      });
    });
  };

  const handleDragStart = function (e, card) {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = function (e, targetCard) {
    e.preventDefault();
    if (!draggedCard || draggedCard.id === targetCard.id) return;

    const list = sortedCards;
    let draggedIdx = -1;
    let targetIdx = -1;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === draggedCard.id) draggedIdx = i;
      if (list[i].id === targetCard.id) targetIdx = i;
    }
    if (draggedIdx < 0 || targetIdx < 0) return;

    const next = list.slice();
    const item = next.splice(draggedIdx, 1)[0];
    next.splice(targetIdx, 0, item);

    const renumbered = next.map(function (c, i) {
      return { ...c, position: i + 1 };
    });
    setLinkCards(renumbered);
    setDraggedCard(null);
  };

  const updateBannerSideCard = function (cardId, field, value) {
    setBannerSideCards(function (cards) {
      return cards.map(function (c) {
        return c.id === cardId ? { ...c, [field]: value } : c;
      });
    });
  };

  const removeBannerSideCard = function (cardId) {
    setBannerSideCards(function (cards) {
      return cards.map(function (c) {
        return c.id === cardId ? { ...c, image: '', imageMobile: '', link: '/' } : c;
      });
    });
  };

  const saveHeroChanges = async function () {
    try {
      setSaving(true);
      setError('');

      const currentResponse = await getSettings();
      const currentSettings = currentResponse && currentResponse.data ? currentResponse.data : currentResponse || {};

      const left = bannerSideCards[0] || {};
      const right = bannerSideCards[1] || {};

      const payload = {
        logo: logo,
        mainBanner: sortedMainBanners[0] ? sortedMainBanners[0].image || '' : '',
        mainBannerMobile: sortedMainBanners[0]
          ? sortedMainBanners[0].imageMobile || sortedMainBanners[0].image || ''
          : '',
        leftBanner: left.image || '',
        leftBannerMobile: left.imageMobile || left.image || '',
        leftBannerLink: left.link || '/',
        rightBanner: right.image || '',
        rightBannerMobile: right.imageMobile || right.image || '',
        rightBannerLink: right.link || '/',
        newsActive: newsActive,
        articlesActive: articlesActive,
        newsCount: newsCount,
        articlesCount: articlesCount,
        footerColumns: currentSettings.footerColumns || [],
        menuItems: currentSettings.menuItems || [],
        imageLinks1: sortedCards.map(function (c) {
          return {
            image: c.image || '',
            imageMobile: c.imageMobile || c.image || '',
            link: c.link || '/',
            position: c.position,
          };
        }),
        imageLinks2: currentSettings.imageLinks2 || [],
        imageLinksMain: sortedMainBanners.map(function (b) {
          return {
            image: b.image || '',
            imageMobile: b.imageMobile || b.image || '',
            link: b.link || '/',
            position: b.position,
          };
        }),
        disableCommentsForPages: currentSettings.disableCommentsForPages || [],
        smsWelcomeMessage: smsWelcomeMessage,

      };

      await updateSettings(payload);
      alert('تغییرات ذخیره شد!  ✅');
    } catch (e) {
      console.error('خطا در ذخیره:', e);
      setError('ذخیره تنظیمات با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

  const saveConsultationTitle = async function () {
    try {
      setSaving(true);
      setError('');
      setSaveMsg('');

      const currentResponse = await getSettings();
      const currentSettings = currentResponse && currentResponse.data ? currentResponse.data : currentResponse || {};

      const payload = {
        ...currentSettings,
        consultationFormTitle: consultationFormTitle,
      };

      await updateSettings(payload);

      setSaveMsgType('success');
      setSaveMsg('ذخیره شد ✅');
    } catch (e) {
      console.error('خطا در ذخیره عنوان فرم مشاوره:', e);
      setSaveMsgType('error');
      setSaveMsg('ذخیره ناموفق بود ❌');
    } finally {
      setSaving(false);
      setTimeout(function () {
        setSaveMsg('');
      }, 2500);
    }
  };

  const hasLeftSide = bannerSideCards[0] && bannerSideCards[0].image;
  const hasRightSide = bannerSideCards[1] && bannerSideCards[1].image;

  const topCardsPreview = [];
  const bottomCardsPreview = sortedCards;

  const nextSlide = function () {
    if (sortedMainBanners.length > 0) {
      setCurrentSlide(function (prev) {
        return (prev + 1) % sortedMainBanners.length;
      });
    }
  };

  const prevSlide = function () {
    if (sortedMainBanners.length > 0) {
      setCurrentSlide(function (prev) {
        return (prev - 1 + sortedMainBanners.length) % sortedMainBanners.length;
      });
    }
  };

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
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded mb-6">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              بنرهای اسلایدری (وسط صفحه)
            </h2>
            <button
              onClick={addNewMainBanner}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={20} />
              افزودن بنر جدید
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">راهنما:</p>
                <p>این بنرها در وسط صفحه اصلی به صورت اسلایدر نمایش داده می‌شوند.</p>
                <p className="mt-1">
                  <strong>ابعاد پیشنهادی (دسکتاپ):</strong> <strong>۶۶۰ در ۳۱۰</strong> پیکسل
                </p>
                <p className="text-xs text-blue-700 mt-1">برای ترتیب‌دهی، کارت‌ها را بکشید و رها کنید.</p>
              </div>
            </div>
          </div>

          {sortedMainBanners.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-3">هنوز بنری اضافه نشده است</p>
              <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                <Upload size={18} />
                <span>آپلود اولین بنر</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={function (e) {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      handleUpload(file, {
                        folder: 'banners',
                        onDone: function (url) {
                          setMainBanners([
                            {
                              id: 'b-' + Date.now(),
                              image: url,
                              imageMobile: '',
                              link: '/',
                              position: 1,
                            },
                          ]);
                        },
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMainBanners.map(function (banner, idx) {
                return (
                  <div
                    key={banner.id}
                    draggable
                    onDragStart={function (e) {
                      handleBannerDragStart(e, banner);
                    }}
                    onDragOver={handleBannerDragOver}
                    onDrop={function (e) {
                      handleBannerDrop(e, banner);
                    }}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-move bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="cursor-grab active:cursor-grabbing mt-1">
                        <GripVertical size={20} className="text-gray-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">بنر {idx + 1}</span>
                          <button
                            onClick={function () {
                              deleteMainBanner(banner.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="aspect-[660/310] bg-gray-100 rounded-lg overflow-hidden border">
                          {banner.image ? (
                            <img src={banner.image} alt={'بنر ' + (idx + 1)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span>بدون تصویر</span>
                            </div>
                          )}
                        </div>

                        <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-sm">
                          <Upload size={16} />
                          <span>{banner.image ? 'تغییر تصویر دسکتاپ' : 'آپلود تصویر دسکتاپ'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={function (e) {
                              handleMainBannerUpload(banner.id, e);
                            }}
                            className="hidden"
                          />
                        </label>

                        <div className="flex items-center gap-2">
                          <Smartphone size={16} className="text-gray-500 flex-shrink-0" />
                          <label className="flex-1 flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-xs">
                            <Upload size={14} />
                            <span>{banner.imageMobile ? 'تغییر موبایل' : 'آپلود موبایل'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={function (e) {
                                handleMainBannerMobileUpload(banner.id, e);
                              }}
                              className="hidden"
                            />
                          </label>
                          {banner.imageMobile && (
                            <img src={banner.imageMobile} alt="موبایل" className="w-12 h-10 object-cover rounded border flex-shrink-0" />
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">لینک بنر</label>
                          <input
                            type="text"
                            value={banner.link}
                            onChange={function (e) {
                              updateMainBanner(banner.id, 'link', e.target.value);
                            }}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="/products"
                          />
                        </div>

                        <div className="text-xs text-gray-400 text-left">ترتیب: {banner.position}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            عکس‌های کناری بنر (اختیاری)
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p>این عکس‌ها در کنار بنر اصلی (راست و چپ) نمایش داده می‌شوند.</p>
                <p className="mt-1">
                  <strong>ابعاد پیشنهادی:</strong> <strong>۲۶۰ در ۳۱۰</strong> پیکسل
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-3 text-center">عکس سمت راست</h3>
              {bannerSideCards[1] && bannerSideCards[1].image ? (
                <div className="space-y-3">
                  <div className="relative aspect-[260/310] rounded-lg overflow-hidden">
                    <img src={bannerSideCards[1].image} alt="کارت کناری راست" className="w-full h-full object-cover" />
                    <button
                      onClick={function () {
                        removeBannerSideCard('side-right');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-gray-500" />
                    <label className="flex-1 flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-xs">
                      <Upload size={14} />
                      <span>{bannerSideCards[1].imageMobile ? 'تغییر موبایل' : 'آپلود موبایل'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={function (e) {
                          handleBannerSideCardMobileUpload('side-right', e);
                        }}
                        className="hidden"
                      />
                    </label>
                    {bannerSideCards[1].imageMobile && (
                      <img src={bannerSideCards[1].imageMobile} alt="موبایل" className="w-10 h-8 object-cover rounded border" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={bannerSideCards[1].link}
                    onChange={function (e) {
                      updateBannerSideCard('side-right', 'link', e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="لینک"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer aspect-[260/310] hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 text-sm">کلیک برای آپلود</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={function (e) {
                      handleBannerSideCardUpload('side-right', e);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-3 text-center">عکس سمت چپ</h3>
              {bannerSideCards[0] && bannerSideCards[0].image ? (
                <div className="space-y-3">
                  <div className="relative aspect-[260/310] rounded-lg overflow-hidden">
                    <img src={bannerSideCards[0].image} alt="کارت کناری چپ" className="w-full h-full object-cover" />
                    <button
                      onClick={function () {
                        removeBannerSideCard('side-left');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-gray-500" />
                    <label className="flex-1 flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-xs">
                      <Upload size={14} />
                      <span>{bannerSideCards[0].imageMobile ? 'تغییر موبایل' : 'آپلود موبایل'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={function (e) {
                          handleBannerSideCardMobileUpload('side-left', e);
                        }}
                        className="hidden"
                      />
                    </label>
                    {bannerSideCards[0].imageMobile && (
                      <img src={bannerSideCards[0].imageMobile} alt="موبایل" className="w-10 h-8 object-cover rounded border" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={bannerSideCards[0].link}
                    onChange={function (e) {
                      updateBannerSideCard('side-left', 'link', e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="لینک"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer aspect-[260/310] hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 text-sm">کلیک برای آپلود</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={function (e) {
                      handleBannerSideCardUpload('side-left', e);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-0.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              عکس‌های لینک‌دار (زیر بنر)
            </h2>
            <button
              onClick={addNewCard}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={20} />
              افزودن عکس جدید
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">راهنمای ابعاد برای جلوگیری از دفرمه شدن:</p>
                <p>نمایش سایت در هر ردیف حداکثر ۳ عکس است. اگر تعداد کمتر باشد، همان تعداد عرض را پر می‌کنند.</p>
                <p className="mt-1">
                  <strong>۳تایی:</strong> ۳۸۳در۲۱۰ &nbsp; | &nbsp;
                  <strong>۲تایی:</strong> ۵۹۰در۲۱۰ &nbsp; | &nbsp;
                  <strong>تکی:</strong> ۱۱۸۰در۲۱۰
                </p>
                <p className="text-xs text-blue-700 mt-1">اگر نسبت رعایت نشود، در سایت با object-cover از اطراف برش می‌خورد.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCards.map(function (card, idx) {
              const total = sortedCards.length;
              const rowStart = Math.floor(idx / 3) * 3;
              const remaining = total - rowStart;
              const countInThisRow = Math.min(3, remaining);

              let recommendedText = '';
              let aspect = '590/210';
              if (countInThisRow === 3) {
                recommendedText = 'سه‌تایی: ۳۸۳در۲۱۰';
                aspect = '383/210';
              } else if (countInThisRow === 2) {
                recommendedText = 'دوتایی: ۵۹۰در۲۱۰';
                aspect = '590/210';
              } else {
                recommendedText = 'تکی: ۱۱۸۰در۲۱۰';
                aspect = '1180/210';
              }

              return (
                <div
                  key={card.id}
                  draggable
                  onDragStart={function (e) {
                    handleDragStart(e, card);
                  }}
                  onDragOver={handleDragOver}
                  onDrop={function (e) {
                    handleDrop(e, card);
                  }}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-move"
                >
                  <div className="flex items-start gap-3">
                    <div className="cursor-grab active:cursor-grabbing mt-1">
                      <GripVertical size={20} className="text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                        <p className="text-xs text-blue-800">
                          <strong>ابعاد پیشنهادی:</strong> {recommendedText}
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <div style={{ aspectRatio: aspect }}>
                          {card.image ? (
                            <img src={card.image} alt="کارت" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <span className="text-gray-400">بدون عکس</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-sm">
                        <Upload size={16} />
                        <span>{card.image ? 'تغییر دسکتاپ' : 'آپلود دسکتاپ'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={function (e) {
                            handleCardImageUpload(card.id, e);
                          }}
                          className="hidden"
                        />
                      </label>

                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-gray-500" />
                        <label className="flex-1 flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-xs">
                          <Upload size={14} />
                          <span>{card.imageMobile ? 'تغییر موبایل' : 'آپلود موبایل'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={function (e) {
                              handleCardImageMobileUpload(card.id, e);
                            }}
                            className="hidden"
                          />
                        </label>
                        {card.imageMobile && (
                          <img src={card.imageMobile} alt="موبایل" className="w-10 h-8 object-cover rounded border" />
                        )}
                      </div>

                      <input
                        type="text"
                        value={card.link}
                        onChange={function (e) {
                          updateCard(card.id, 'link', e.target.value);
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="لینک"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">ترتیب: {card.position}</span>
                        <button
                          onClick={function () {
                            deleteCard(card.id);
                          }}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 flex items-center gap-1 text-sm"
                        >
                          <Trash2 size={14} />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <button
              onClick={function () {
                setCurrentSlide(0);
                setShowPreview(true);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              پیش‌نمایش
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

        <NewsArticlesSettings
          value={{
            newsActive: newsActive,
            articlesActive: articlesActive,
            newsCount: newsCount,
            articlesCount: articlesCount,
          }}
          onChange={function (v) {
            setNewsActive(!!v.newsActive);
            setArticlesActive(!!v.articlesActive);
            setNewsCount(Number(v.newsCount || 3));
            setArticlesCount(Number(v.articlesCount || 3));
          }}
        />
        <LinkedImagesSettings />

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">عنوان فرم مشاوره</h2>

          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="text-sm text-blue-800">این متن به عنوان عنوان بالای فرم مشاوره در سایت نمایش داده می‌شود.</div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">consultationFormTitle</label>
          <input
            type="text"
            value={consultationFormTitle}
            onChange={(e) => setConsultationFormTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="مثلاً: درخواست مشاوره"
          />

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={saveConsultationTitle}
              disabled={saving}
              className="bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>

            {saveMsg && (
              <div
                className={
                  'text-sm px-3 py-2 rounded-lg ' +
                  (saveMsgType === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200')
                }
              >
                {saveMsg}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">متن پیامک خوش‌آمدگویی</h2>

          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="text-sm text-blue-800">
              این متن بعد از ورود هر کاربر به عنوان پیامک خوش‌آمدگویی برای او ارسال می‌شود.
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">smsWelcomeMessage</label>

          <textarea
            value={smsWelcomeMessage}
            onChange={(e) => setSmsWelcomeMessage(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm min-h-[120px]"
            placeholder="مثلاً: سلام! به سایت ما خوش آمدید..."
          />

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={saveHeroChanges}
              disabled={saving}
              className="bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold">پیش‌نمایش صفحه اصلی (نمای دسکتاپ)</h3>
              <button
                onClick={function () {
                  setShowPreview(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-100">
              <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[130px] mx-auto py-4">
                <div className="mt-3">
                  <div className="w-full space-y-4">
                    {topCardsPreview.length > 0 && (
                      <div
                        className={`grid ${topCardsPreview.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}
                      >
                        {topCardsPreview.map(function (card, index) {
                          return (
                            <div
                              key={card.id || index}
                              className={`block rounded-lg overflow-hidden shadow-lg w-full ${topCardsPreview.length === 1 ? '' : 'aspect-[590/210]'
                                }`}
                              style={topCardsPreview.length === 1 ? { height: '210px' } : {}}
                            >
                              {card.image ? (
                                <img
                                  src={card.image}
                                  alt={'تصویر ' + (index + 1)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400">بدون تصویر</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: hasRightSide && hasLeftSide ? '21.6% 54.8% 21.6%' : hasRightSide || hasLeftSide ? '28.2% 71.8%' : '1fr',
                      }}
                    >
                      {hasRightSide && (
                        <div className="block rounded-lg overflow-hidden shadow-lg w-full aspect-[260/310]">
                          {bannerSideCards[1].image ? (
                            <img
                              src={bannerSideCards[1].image}
                              alt="تصویر کناری راست"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">بدون تصویر</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="rounded-lg overflow-hidden shadow-lg w-full aspect-[660/310] relative">
                        {sortedMainBanners.length > 0 ? (
                          <>
                            {sortedMainBanners[currentSlide] && sortedMainBanners[currentSlide].image ? (
                              <img
                                src={sortedMainBanners[currentSlide].image}
                                alt="بنر اصلی"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">بنر {currentSlide + 1}</span>
                              </div>
                            )}

                            {sortedMainBanners.length > 1 && (
                              <>
                                <button
                                  onClick={prevSlide}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                                >
                                  <ChevronRight size={20} />
                                </button>
                                <button
                                  onClick={nextSlide}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                                >
                                  <ChevronLeft size={20} />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                  {sortedMainBanners.map(function (_, idx) {
                                    return (
                                      <button
                                        key={idx}
                                        onClick={function () {
                                          setCurrentSlide(idx);
                                        }}
                                        className={'w-2 h-2 rounded-full ' + (idx === currentSlide ? 'bg-white' : 'bg-white/50')}
                                      />
                                    );
                                  })}
                                </div>
                                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded text-xs">
                                  {currentSlide + 1}/{sortedMainBanners.length}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">بنر اصلی</span>
                          </div>
                        )}
                      </div>

                      {hasLeftSide && (
                        <div className="block rounded-lg overflow-hidden shadow-lg w-full aspect-[260/310]">
                          {bannerSideCards[0].image ? (
                            <img
                              src={bannerSideCards[0].image}
                              alt="تصویر کناری چپ"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">بدون تصویر</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {bottomCardsPreview.length > 0 && (
                      <div className="space-y-4">
                        {(function () {
                          const rows = [];
                          for (let i = 0; i < bottomCardsPreview.length; i += 3) {
                            const rowItems = bottomCardsPreview.slice(i, i + 3);
                            const count = rowItems.length;
                            const colsClass = count === 3 ? 'grid-cols-3' : count === 2 ? 'grid-cols-2' : 'grid-cols-1';

                            rows.push(
                              <div key={'bottom-' + i} className={'grid ' + colsClass + ' gap-4'}>
                                {rowItems.map(function (card, idx) {
                                  return (
                                    <div
                                      key={(card.id || 'p') + '-' + idx}
                                      className="block rounded-lg overflow-hidden shadow-lg w-full h-[180px] xl:h-[210px]"
                                    >
                                      {card.image ? (
                                        <img
                                          src={card.image}
                                          alt={'تصویر ' + (i + idx + 1)}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-gray-400">بدون تصویر</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
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

