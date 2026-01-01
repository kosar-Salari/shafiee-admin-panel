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

  const [leftSideBanners, setLeftSideBanners] = useState([]);
  const [rightSideBanners, setRightSideBanners] = useState([]);

  const [linkCards, setLinkCards] = useState([]);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedBanner, setDraggedBanner] = useState(null);
  const [draggedLeftSide, setDraggedLeftSide] = useState(null);
  const [draggedRightSide, setDraggedRightSide] = useState(null);

  const [newsActive, setNewsActive] = useState(true);
  const [articlesActive, setArticlesActive] = useState(true);
  const [newsCount, setNewsCount] = useState(3);
  const [articlesCount, setArticlesCount] = useState(3);

  const [showPreview, setShowPreview] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentLeftSlide, setCurrentLeftSlide] = useState(0);
  const [currentRightSlide, setCurrentRightSlide] = useState(0);
  const [consultationFormTitle, setConsultationFormTitle] = useState('');
  const [smsWelcomeMessage, setSmsWelcomeMessage] = useState('');
  const [smsConsultationMessage, setSmsConsultationMessage] = useState('');


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

        // بنرهای اصلی
        const bannersSource = Array.isArray(data.imageLinksMain) ? data.imageLinksMain : [];
        if (bannersSource.length === 0 && data.mainBanner) {
          setMainBanners([
            {
              id: 'b-1',
              image: data.mainBanner,
              imageMobile: data.mainBannerMobile || data.mainBanner,
              link: '/',
              position: 1,
              modal: data.mainBannerModal === true,
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
                modal: b.modal === true,
              };
            });
          setMainBanners(withIds);
        }

        // بنرهای سمت چپ
        const leftBannersSource = Array.isArray(data.imageLinksLeft) ? data.imageLinksLeft : [];
        if (leftBannersSource.length === 0 && data.leftBanner) {
          setLeftSideBanners([
            {
              id: 'left-1',
              image: data.leftBanner || '',
              imageMobile: data.leftBannerMobile || '',
              link: data.leftBannerLink || '/',
              position: 1,
              modal: data.leftBannerModal === true,
            },
          ]);
        } else {
          const withLeftIds = leftBannersSource
            .slice()
            .sort(function (a, b) {
              return (a.position || 0) - (b.position || 0);
            })
            .map(function (b, i) {
              return {
                id: 'left-' + (i + 1),
                image: b.image || '',
                imageMobile: b.imageMobile || '',
                link: b.link || '/',
                position: b.position || i + 1,
                modal: b.modal === true,
              };
            });
          setLeftSideBanners(withLeftIds);
        }

        // بنرهای سمت راست
        const rightBannersSource = Array.isArray(data.imageLinksRight) ? data.imageLinksRight : [];
        if (rightBannersSource.length === 0 && data.rightBanner) {
          setRightSideBanners([
            {
              id: 'right-1',
              image: data.rightBanner || '',
              imageMobile: data.rightBannerMobile || '',
              link: data.rightBannerLink || '/',
              position: 1,
              modal: data.rightBannerModal === true,
            },
          ]);
        } else {
          const withRightIds = rightBannersSource
            .slice()
            .sort(function (a, b) {
              return (a.position || 0) - (b.position || 0);
            })
            .map(function (b, i) {
              return {
                id: 'right-' + (i + 1),
                image: b.image || '',
                imageMobile: b.imageMobile || '',
                link: b.link || '/',
                position: b.position || i + 1,
                modal: b.modal === true,
              };
            });
          setRightSideBanners(withRightIds);
        }

        // کارت‌های لینک‌دار
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
        setSmsConsultationMessage(data.smsConsultationMessage || '');

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

  const sortedLeftSideBanners = useMemo(function () {
    return leftSideBanners.slice().sort(function (a, b) {
      return (a.position || 0) - (b.position || 0);
    });
  }, [leftSideBanners]);

  const sortedRightSideBanners = useMemo(function () {
    return rightSideBanners.slice().sort(function (a, b) {
      return (a.position || 0) - (b.position || 0);
    });
  }, [rightSideBanners]);

  const handleUpload = async function (file, options) {
    if (!file) return;
    var opts = options || {};
    var folder = opts.folder || 'images';
    var onDone = opts.onDone;

    try {
      var url = await uploadFile(file, { folder: folder });
      if (onDone) onDone(url);
    } catch (e) {
      console.error('Upload error:', e);
      alert('آپلود ناموفق بود.  لطفاً دوباره تلاش کنید.');
    }
  };

  var handleMainBannerUpload = function (bannerId, e) {
    var file = e.target.files && e.target.files[0];
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

  var handleMainBannerMobileUpload = function (bannerId, e) {
    var file = e.target.files && e.target.files[0];
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

  var handleLeftSideBannerUpload = function (bannerId, e) {
    var file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/sides',
      onDone: function (url) {
        setLeftSideBanners(function (banners) {
          return banners.map(function (b) {
            return b.id === bannerId ? { ...b, image: url } : b;
          });
        });
      },
    });
  };

  var handleLeftSideBannerMobileUpload = function (bannerId, e) {
    var file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/sides/mobile',
      onDone: function (url) {
        setLeftSideBanners(function (banners) {
          return banners.map(function (b) {
            return b.id === bannerId ? { ...b, imageMobile: url } : b;
          });
        });
      },
    });
  };

  var handleRightSideBannerUpload = function (bannerId, e) {
    var file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/sides',
      onDone: function (url) {
        setRightSideBanners(function (banners) {
          return banners.map(function (b) {
            return b.id === bannerId ? { ...b, image: url } : b;
          });
        });
      },
    });
  };

  var handleRightSideBannerMobileUpload = function (bannerId, e) {
    var file = e.target.files && e.target.files[0];
    handleUpload(file, {
      folder: 'banners/sides/mobile',
      onDone: function (url) {
        setRightSideBanners(function (banners) {
          return banners.map(function (b) {
            return b.id === bannerId ? { ...b, imageMobile: url } : b;
          });
        });
      },
    });
  };

  var handleCardImageUpload = function (cardId, e) {
    var file = e.target.files && e.target.files[0];
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

  var handleCardImageMobileUpload = function (cardId, e) {
    var file = e.target.files && e.target.files[0];
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

  var addNewMainBanner = function () {
    var maxPos = mainBanners.reduce(function (mx, b) {
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
          modal: false,
        },
      ]);
    });
  };

  var deleteMainBanner = function (bannerId) {
    setMainBanners(function (banners) {
      var filtered = banners.filter(function (b) {
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

  var updateMainBanner = function (bannerId, field, value) {
    setMainBanners(function (banners) {
      return banners.map(function (b) {
        return b.id === bannerId ? { ...b, [field]: value } : b;
      });
    });
  };

  var handleBannerDragStart = function (e, banner) {
    setDraggedBanner(banner);
    e.dataTransfer.effectAllowed = 'move';
  };

  var handleBannerDragOver = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  var handleBannerDrop = function (e, targetBanner) {
    e.preventDefault();
    if (!draggedBanner || draggedBanner.id === targetBanner.id) return;

    var list = sortedMainBanners;
    var draggedIdx = -1;
    var targetIdx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === draggedBanner.id) draggedIdx = i;
      if (list[i].id === targetBanner.id) targetIdx = i;
    }
    if (draggedIdx < 0 || targetIdx < 0) return;

    var next = list.slice();
    var item = next.splice(draggedIdx, 1)[0];
    next.splice(targetIdx, 0, item);

    var renumbered = next.map(function (b, i) {
      return { ...b, position: i + 1 };
    });
    setMainBanners(renumbered);
    setDraggedBanner(null);
  };

  var addNewLeftSideBanner = function () {
    var maxPos = leftSideBanners.reduce(function (mx, b) {
      return Math.max(mx, b.position || 0);
    }, 0);
    setLeftSideBanners(function (prev) {
      return prev.concat([
        {
          id: 'left-' + Date.now(),
          image: '',
          imageMobile: '',
          link: '/',
          position: maxPos + 1,
          modal: false,
        },
      ]);
    });
  };

  var deleteLeftSideBanner = function (bannerId) {
    setLeftSideBanners(function (banners) {
      var filtered = banners.filter(function (b) {
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

  var updateLeftSideBanner = function (bannerId, field, value) {
    setLeftSideBanners(function (banners) {
      return banners.map(function (b) {
        return b.id === bannerId ? { ...b, [field]: value } : b;
      });
    });
  };

  var handleLeftSideDragStart = function (e, banner) {
    setDraggedLeftSide(banner);
    e.dataTransfer.effectAllowed = 'move';
  };

  var handleLeftSideDragOver = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  var handleLeftSideDrop = function (e, targetBanner) {
    e.preventDefault();
    if (!draggedLeftSide || draggedLeftSide.id === targetBanner.id) return;

    var list = sortedLeftSideBanners;
    var draggedIdx = -1;
    var targetIdx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === draggedLeftSide.id) draggedIdx = i;
      if (list[i].id === targetBanner.id) targetIdx = i;
    }
    if (draggedIdx < 0 || targetIdx < 0) return;

    var next = list.slice();
    var item = next.splice(draggedIdx, 1)[0];
    next.splice(targetIdx, 0, item);

    var renumbered = next.map(function (b, i) {
      return { ...b, position: i + 1 };
    });
    setLeftSideBanners(renumbered);
    setDraggedLeftSide(null);
  };

  var addNewRightSideBanner = function () {
    var maxPos = rightSideBanners.reduce(function (mx, b) {
      return Math.max(mx, b.position || 0);
    }, 0);
    setRightSideBanners(function (prev) {
      return prev.concat([
        {
          id: 'right-' + Date.now(),
          image: '',
          imageMobile: '',
          link: '/',
          position: maxPos + 1,
          modal: false,
        },
      ]);
    });
  };

  var deleteRightSideBanner = function (bannerId) {
    setRightSideBanners(function (banners) {
      var filtered = banners.filter(function (b) {
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

  var updateRightSideBanner = function (bannerId, field, value) {
    setRightSideBanners(function (banners) {
      return banners.map(function (b) {
        return b.id === bannerId ? { ...b, [field]: value } : b;
      });
    });
  };

  var handleRightSideDragStart = function (e, banner) {
    setDraggedRightSide(banner);
    e.dataTransfer.effectAllowed = 'move';
  };

  var handleRightSideDragOver = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  var handleRightSideDrop = function (e, targetBanner) {
    e.preventDefault();
    if (!draggedRightSide || draggedRightSide.id === targetBanner.id) return;

    var list = sortedRightSideBanners;
    var draggedIdx = -1;
    var targetIdx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === draggedRightSide.id) draggedIdx = i;
      if (list[i].id === targetBanner.id) targetIdx = i;
    }
    if (draggedIdx < 0 || targetIdx < 0) return;

    var next = list.slice();
    var item = next.splice(draggedIdx, 1)[0];
    next.splice(targetIdx, 0, item);

    var renumbered = next.map(function (b, i) {
      return { ...b, position: i + 1 };
    });
    setRightSideBanners(renumbered);
    setDraggedRightSide(null);
  };

  var addNewCard = function () {
    var maxPos = linkCards.reduce(function (mx, c) {
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

  var deleteCard = function (cardId) {
    setLinkCards(function (cards) {
      var filtered = cards.filter(function (c) {
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

  var updateCard = function (cardId, field, value) {
    setLinkCards(function (cards) {
      return cards.map(function (c) {
        return c.id === cardId ? { ...c, [field]: value } : c;
      });
    });
  };

  var handleDragStart = function (e, card) {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  var handleDragOver = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  var handleDrop = function (e, targetCard) {
    e.preventDefault();
    if (!draggedCard || draggedCard.id === targetCard.id) return;

    var list = sortedCards;
    var draggedIdx = -1;
    var targetIdx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === draggedCard.id) draggedIdx = i;
      if (list[i].id === targetCard.id) targetIdx = i;
    }
    if (draggedIdx < 0 || targetIdx < 0) return;

    var next = list.slice();
    var item = next.splice(draggedIdx, 1)[0];
    next.splice(targetIdx, 0, item);

    var renumbered = next.map(function (c, i) {
      return { ...c, position: i + 1 };
    });
    setLinkCards(renumbered);
    setDraggedCard(null);
  };

  var saveHeroChanges = async function () {
    try {
      setSaving(true);
      setError('');

      var currentResponse = await getSettings();
      var currentSettings = currentResponse && currentResponse.data ? currentResponse.data : currentResponse || {};

      var firstMainBanner = sortedMainBanners[0] || {};
      var firstLeftBanner = sortedLeftSideBanners[0] || {};
      var firstRightBanner = sortedRightSideBanners[0] || {};

      var payload = {
        logo: logo,
        // فیلدهای قدیمی برای سازگاری
        mainBanner: firstMainBanner.image || '',
        mainBannerMobile: firstMainBanner.imageMobile || firstMainBanner.image || '',
        mainBannerModal: firstMainBanner.modal === true,
        leftBanner: firstLeftBanner.image || '',
        leftBannerMobile: firstLeftBanner.imageMobile || '',
        leftBannerLink: firstLeftBanner.link || '/',
        leftBannerModal: firstLeftBanner.modal === true,
        rightBanner: firstRightBanner.image || '',
        rightBannerMobile: firstRightBanner.imageMobile || '',
        rightBannerLink: firstRightBanner.link || '/',
        rightBannerModal: firstRightBanner.modal === true,
        // آرایه‌ها
        imageLinksMain: sortedMainBanners.map(function (b) {
          return {
            image: b.image || '',
            imageMobile: b.imageMobile || b.image || '',
            link: b.link || '/',
            position: b.position,
            modal: b.modal === true,
          };
        }),
        imageLinksLeft: sortedLeftSideBanners.map(function (b) {
          return {
            image: b.image || '',
            imageMobile: b.imageMobile || b.image || '',
            link: b.link || '/',
            position: b.position,
            modal: b.modal === true,
          };
        }),
        imageLinksRight: sortedRightSideBanners.map(function (b) {
          return {
            image: b.image || '',
            imageMobile: b.imageMobile || b.image || '',
            link: b.link || '/',
            position: b.position,
            modal: b.modal === true,
          };
        }),
        imageLinks1: sortedCards.map(function (c) {
          return {
            image: c.image || '',
            imageMobile: c.imageMobile || c.image || '',
            link: c.link || '/',
            position: c.position,
          };
        }),
        // بقیه فیلدها
        newsActive: newsActive,
        articlesActive: articlesActive,
        newsCount: newsCount,
        articlesCount: articlesCount,
        footerColumns: currentSettings.footerColumns || [],
        menuItems: currentSettings.menuItems || [],
        imageLinks2: currentSettings.imageLinks2 || [],
        disableCommentsForPages: currentSettings.disableCommentsForPages || [],
        smsWelcomeMessage: smsWelcomeMessage,
        smsConsultationMessage: smsConsultationMessage,
        consultationFormTitle: currentSettings.consultationFormTitle || '',
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

  var saveConsultationTitle = async function () {
    try {
      setSaving(true);
      setError('');
      setSaveMsg('');

      var currentResponse = await getSettings();
      var currentSettings = currentResponse && currentResponse.data ? currentResponse.data : currentResponse || {};

      var payload = {
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

  var hasLeftSide = sortedLeftSideBanners.length > 0 && sortedLeftSideBanners.some(function (b) { return b.image; });
  var hasRightSide = sortedRightSideBanners.length > 0 && sortedRightSideBanners.some(function (b) { return b.image; });

  var topCardsPreview = [];
  var bottomCardsPreview = sortedCards;

  var nextSlide = function () {
    if (sortedMainBanners.length > 0) {
      setCurrentSlide(function (prev) {
        return (prev + 1) % sortedMainBanners.length;
      });
    }
  };

  var prevSlide = function () {
    if (sortedMainBanners.length > 0) {
      setCurrentSlide(function (prev) {
        return (prev - 1 + sortedMainBanners.length) % sortedMainBanners.length;
      });
    }
  };

  var nextLeftSlide = function () {
    if (sortedLeftSideBanners.length > 0) {
      setCurrentLeftSlide(function (prev) {
        return (prev + 1) % sortedLeftSideBanners.length;
      });
    }
  };

  var prevLeftSlide = function () {
    if (sortedLeftSideBanners.length > 0) {
      setCurrentLeftSlide(function (prev) {
        return (prev - 1 + sortedLeftSideBanners.length) % sortedLeftSideBanners.length;
      });
    }
  };

  var nextRightSlide = function () {
    if (sortedRightSideBanners.length > 0) {
      setCurrentRightSlide(function (prev) {
        return (prev + 1) % sortedRightSideBanners.length;
      });
    }
  };

  var prevRightSlide = function () {
    if (sortedRightSideBanners.length > 0) {
      setCurrentRightSlide(function (prev) {
        return (prev - 1 + sortedRightSideBanners.length) % sortedRightSideBanners.length;
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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg: px-8">
          <h1 className="text-2xl font-bold text-gray-900">مدیریت صفحه اصلی</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg: px-8">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {/* بنرهای اسلایدری اصلی */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              بنرهای اسلایدری (وسط صفحه)
            </h2>
            <button onClick={addNewMainBanner} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Plus size={20} />
              افزودن بنر جدید
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">راهنما: </p>
                <p>این بنرها در وسط صفحه اصلی به صورت اسلایدر نمایش داده می‌شوند.</p>
                <p className="mt-1"><strong>ابعاد پیشنهادی (دسکتاپ):</strong> <strong>۶۶۰ در ۳۱۰</strong> پیکسل</p>
                <p className="text-xs text-blue-700 mt-1">برای ترتیب‌دهی، کارت‌ها را بکشید و رها کنید. </p>
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
                <input type="file" accept="image/*" onChange={function (e) {
                  var file = e.target.files && e.target.files[0];
                  if (file) {
                    handleUpload(file, {
                      folder: 'banners',
                      onDone: function (url) {
                        setMainBanners([{ id: 'b-' + Date.now(), image: url, imageMobile: '', link: '/', position: 1, modal: false }]);
                      },
                    });
                  }
                }} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMainBanners.map(function (banner, idx) {
                return (
                  <div key={banner.id} draggable onDragStart={function (e) { handleBannerDragStart(e, banner); }} onDragOver={handleBannerDragOver} onDrop={function (e) { handleBannerDrop(e, banner); }} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-move bg-white">
                    <div className="flex items-start gap-3">
                      <div className="cursor-grab active:cursor-grabbing mt-1">
                        <GripVertical size={20} className="text-gray-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">بنر {idx + 1}</span>
                          <button onClick={function () { deleteMainBanner(banner.id); }} className="text-red-500 hover:text-red-700 p-1">
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
                          <input type="file" accept="image/*" onChange={function (e) { handleMainBannerUpload(banner.id, e); }} className="hidden" />
                        </label>

                        <div className="flex items-center gap-2">
                          <Smartphone size={16} className="text-gray-500 flex-shrink-0" />
                          <label className="flex-1 flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-xs">
                            <Upload size={14} />
                            <span>{banner.imageMobile ? 'تغییر موبایل' : 'آپلود موبایل'}</span>
                            <input type="file" accept="image/*" onChange={function (e) { handleMainBannerMobileUpload(banner.id, e); }} className="hidden" />
                          </label>
                          {banner.imageMobile && (
                            <img src={banner.imageMobile} alt="موبایل" className="w-12 h-10 object-cover rounded border flex-shrink-0" />
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">لینک بنر</label>
                          <input type="text" value={banner.link} onChange={function (e) { updateMainBanner(banner.id, 'link', e.target.value); }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="/products" />
                        </div>

                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <input type="checkbox" id={'modal-main-' + banner.id} checked={banner.modal === true} onChange={function (e) { updateMainBanner(banner.id, 'modal', e.target.checked); }} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                          <label htmlFor={'modal-main-' + banner.id} className="text-sm text-purple-800 cursor-pointer">
                            باز شدن فرم مشاوره بعد از کلیک
                          </label>
                        </div>

                        <div className="text-xs text-gray-400 text-left">ترتیب:  {banner.position}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* بنرهای کناری */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            بنرهای کناری (راست و چپ)
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p>این بنرها در کنار بنر اصلی (راست و چپ) نمایش داده می‌شوند.</p>
                <p className="mt-1"><strong>ابعاد پیشنهادی: </strong> <strong>۲۶۰ در ۳۱۰</strong> پیکسل</p>
                <p><strong>در حالت موبایل:</strong> <strong>۳۴۳ در ۱۶۰</strong> پیکسل</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* بنرهای سمت راست */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-center">بنرهای سمت راست</h3>
                <button onClick={addNewRightSideBanner} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm">
                  <Plus size={16} />
                  افزودن
                </button>
              </div>

              {sortedRightSideBanners.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">هنوز بنری اضافه نشده است</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedRightSideBanners.map(function (banner, idx) {
                    return (
                      <div key={banner.id} draggable onDragStart={function (e) { handleRightSideDragStart(e, banner); }} onDragOver={handleRightSideDragOver} onDrop={function (e) { handleRightSideDrop(e, banner); }} className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 transition-all cursor-move bg-gray-50">
                        <div className="flex items-start gap-2">
                          <div className="cursor-grab active:cursor-grabbing mt-1">
                            <GripVertical size={16} className="text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">بنر راست {idx + 1}</span>
                              <button onClick={function () { deleteRightSideBanner(banner.id); }} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <div className="aspect-[260/310] bg-gray-100 rounded-lg overflow-hidden border">
                              {banner.image ? (
                                <img src={banner.image} alt={'بنر راست ' + (idx + 1)} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  <span>بدون تصویر</span>
                                </div>
                              )}
                            </div>

                            <label className="flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer hover:bg-white text-xs">
                              <Upload size={14} />
                              <span>{banner.image ? 'تغییر دسکتاپ' : 'آپلود دسکتاپ'}</span>
                              <input type="file" accept="image/*" onChange={function (e) { handleRightSideBannerUpload(banner.id, e); }} className="hidden" />
                            </label>

                            <div className="flex items-center gap-2">
                              <Smartphone size={14} className="text-gray-500" />
                              <label className="flex-1 flex items-center justify-center gap-1 border border-dashed rounded-lg p-1. 5 cursor-pointer hover:bg-white text-xs">
                                <Upload size={12} />
                                <span>{banner.imageMobile ? 'تغییر موبایل' : 'آپلود موبایل'}</span>
                                <input type="file" accept="image/*" onChange={function (e) { handleRightSideBannerMobileUpload(banner.id, e); }} className="hidden" />
                              </label>
                              {banner.imageMobile && (
                                <img src={banner.imageMobile} alt="موبایل" className="w-8 h-6 object-cover rounded border" />
                              )}
                            </div>

                            <input type="text" value={banner.link} onChange={function (e) { updateRightSideBanner(banner.id, 'link', e.target.value); }} className="w-full px-2 py-1.5 border rounded-lg text-xs" placeholder="لینک" />

                            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                              <input type="checkbox" id={'modal-right-' + banner.id} checked={banner.modal === true} onChange={function (e) { updateRightSideBanner(banner.id, 'modal', e.target.checked); }} className="w-3. 5 h-3.5 text-purple-600 rounded focus:ring-purple-500" />
                              <label htmlFor={'modal-right-' + banner.id} className="text-xs text-purple-800 cursor-pointer">
                                باز شدن فرم مشاوره
                              </label>
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

            {/* بنرهای سمت چپ */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-center">بنرهای سمت چپ</h3>
                <button onClick={addNewLeftSideBanner} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm">
                  <Plus size={16} />
                  افزودن
                </button>
              </div>

              {sortedLeftSideBanners.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">هنوز بنری اضافه نشده است</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedLeftSideBanners.map(function (banner, idx) {
                    return (
                      <div key={banner.id} draggable onDragStart={function (e) { handleLeftSideDragStart(e, banner); }} onDragOver={handleLeftSideDragOver} onDrop={function (e) { handleLeftSideDrop(e, banner); }} className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 transition-all cursor-move bg-gray-50">
                        <div className="flex items-start gap-2">
                          <div className="cursor-grab active: cursor-grabbing mt-1">
                            <GripVertical size={16} className="text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">بنر چپ {idx + 1}</span>
                              <button onClick={function () { deleteLeftSideBanner(banner.id); }} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <div className="aspect-[260/310] bg-gray-100 rounded-lg overflow-hidden border">
                              {banner.image ? (
                                <img src={banner.image} alt={'بنر چپ ' + (idx + 1)} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  <span>بدون تصویر</span>
                                </div>
                              )}
                            </div>

                            <label className="flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer hover:bg-white text-xs">
                              <Upload size={14} />
                              <span>{banner.image ? 'تغییر دسکتاپ' : 'آپلود دسکتاپ'}</span>
                              <input type="file" accept="image/*" onChange={function (e) { handleLeftSideBannerUpload(banner.id, e); }} className="hidden" />
                            </label>

                            <div className="flex items-center gap-2">
                              <Smartphone size={14} className="text-gray-500" />
                              <label className="flex-1 flex items-center justify-center gap-1 border border-dashed rounded-lg p-1.5 cursor-pointer hover:bg-white text-xs">
                                <Upload size={12} />
                                <span>{banner.imageMobile ? 'تغییر موبایل' : 'آپلود موبایل'}</span>
                                <input type="file" accept="image/*" onChange={function (e) { handleLeftSideBannerMobileUpload(banner.id, e); }} className="hidden" />
                              </label>
                              {banner.imageMobile && (
                                <img src={banner.imageMobile} alt="موبایل" className="w-8 h-6 object-cover rounded border" />
                              )}
                            </div>

                            <input type="text" value={banner.link} onChange={function (e) { updateLeftSideBanner(banner.id, 'link', e.target.value); }} className="w-full px-2 py-1.5 border rounded-lg text-xs" placeholder="لینک" />

                            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                              <input type="checkbox" id={'modal-left-' + banner.id} checked={banner.modal === true} onChange={function (e) { updateLeftSideBanner(banner.id, 'modal', e.target.checked); }} className="w-3.5 h-3.5 text-purple-600 rounded focus:ring-purple-500" />
                              <label htmlFor={'modal-left-' + banner.id} className="text-xs text-purple-800 cursor-pointer">
                                باز شدن فرم مشاوره
                              </label>
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
          </div>
        </div>

        {/* عکس‌های لینک‌دار */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13. 828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-. 758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              عکس‌های لینک‌دار (زیر بنر)
            </h2>
            <button onClick={addNewCard} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Plus size={20} />
              افزودن عکس جدید
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">راهنمای ابعاد:</p>
                <p><strong>۳تایی:</strong> ۳۸۳×۲۱۰ | <strong>۲تایی:</strong> ۵۹۰×۲۱۰ | <strong>تکی:</strong> ۱۱۸۰×۲۱۰</p>
                <p><strong>موبایل:</strong> ۳۴۳×۱۶۰ پیکسل</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md: grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCards.map(function (card, idx) {
              var total = sortedCards.length;
              var rowStart = Math.floor(idx / 3) * 3;
              var remaining = total - rowStart;
              var countInThisRow = Math.min(3, remaining);

              var recommendedText = '';
              var aspect = '590/210';
              if (countInThisRow === 3) {
                recommendedText = 'سه‌تایی:  ۳۸۳×۲۱۰';
                aspect = '383/210';
              } else if (countInThisRow === 2) {
                recommendedText = 'دوتایی: ۵۹۰×۲۱۰';
                aspect = '590/210';
              } else {
                recommendedText = 'تکی: ۱۱۸۰×۲۱۰';
                aspect = '1180/210';
              }

              return (
                <div key={card.id} draggable onDragStart={function (e) { handleDragStart(e, card); }} onDragOver={handleDragOver} onDrop={function (e) { handleDrop(e, card); }} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-move">
                  <div className="flex items-start gap-3">
                    <div className="cursor-grab active:cursor-grabbing mt-1">
                      <GripVertical size={20} className="text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                        <p className="text-xs text-blue-800"><strong>ابعاد پیشنهادی:</strong> {recommendedText}</p>
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
                        <input type="file" accept="image/*" onChange={function (e) { handleCardImageUpload(card.id, e); }} className="hidden" />
                      </label>

                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-gray-500" />
                        <label className="flex-1 flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-50 text-xs">
                          <Upload size={14} />
                          <span>{card.imageMobile ? 'تغییر موبایل' : 'آپلود موبایل'}</span>
                          <input type="file" accept="image/*" onChange={function (e) { handleCardImageMobileUpload(card.id, e); }} className="hidden" />
                        </label>
                        {card.imageMobile && (
                          <img src={card.imageMobile} alt="موبایل" className="w-10 h-8 object-cover rounded border" />
                        )}
                      </div>

                      <input type="text" value={card.link} onChange={function (e) { updateCard(card.id, 'link', e.target.value); }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="لینک" />

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">ترتیب: {card.position}</span>
                        <button onClick={function () { deleteCard(card.id); }} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 flex items-center gap-1 text-sm">
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
            <button onClick={function () { setCurrentSlide(0); setCurrentLeftSlide(0); setCurrentRightSlide(0); setShowPreview(true); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
              پیش‌نمایش
            </button>
            <button onClick={saveHeroChanges} disabled={saving} className="bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

        <NewsArticlesSettings
          value={{ newsActive: newsActive, articlesActive: articlesActive, newsCount: newsCount, articlesCount: articlesCount }}
          onChange={function (v) { setNewsActive(!!v.newsActive); setArticlesActive(!!v.articlesActive); setNewsCount(Number(v.newsCount || 3)); setArticlesCount(Number(v.articlesCount || 3)); }}
        />
        <LinkedImagesSettings />

        {/* عنوان فرم مشاوره */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">عنوان فرم مشاوره</h2>
          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="text-sm text-blue-800">این متن به عنوان عنوان بالای فرم مشاوره در سایت نمایش داده می‌شود.</div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">consultationFormTitle</label>
          <input type="text" value={consultationFormTitle} onChange={function (e) { setConsultationFormTitle(e.target.value); }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="مثلاً: درخواست مشاوره" />
          <div className="flex items-center justify-between mt-4">
            <button onClick={saveConsultationTitle} disabled={saving} className="bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
            {saveMsg && (
              <div className={'text-sm px-3 py-2 rounded-lg ' + (saveMsgType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
                {saveMsg}
              </div>
            )}
          </div>
        </div>

        {/* پیامک خوش‌آمدگویی */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">متن پیامک خوش‌آمدگویی</h2>
          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="text-sm text-blue-800">این متن بعد از ورود هر کاربر به عنوان پیامک خوش‌آمدگویی برای او ارسال می‌شود. </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">smsWelcomeMessage</label>
          <textarea value={smsWelcomeMessage} onChange={function (e) { setSmsWelcomeMessage(e.target.value); }} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[120px]" placeholder="مثلاً: سلام! به سایت ما خوش آمدید..." />
          <div className="flex items-center justify-between mt-4">
            <button onClick={saveHeroChanges} disabled={saving} className="bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>

        {/* پیامک فرم مشاوره */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">متن پیامک فرم مشاوره</h2>
          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4">
            <div className="text-sm text-blue-800">این متن بعد از ثبت فرم مشاوره توسط کاربر، به عنوان پیامک برای او ارسال می‌شود.</div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">smsConsultationMessage</label>
          <textarea value={smsConsultationMessage} onChange={function (e) { setSmsConsultationMessage(e.target.value); }} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[120px]" placeholder="مثلاً: درخواست مشاوره شما ثبت شد..." />
          <div className="flex items-center justify-between mt-4">
            <button onClick={saveHeroChanges} disabled={saving} className="bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>
      </div>

      {/* پیش‌نمایش */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold">پیش‌نمایش صفحه اصلی (نمای دسکتاپ)</h3>
              <button onClick={function () { setShowPreview(false); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-100">
              <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[130px] mx-auto py-4">
                <div className="mt-3">
                  <div className="w-full space-y-4">
                    {topCardsPreview.length > 0 && (
                      <div className={'grid ' + (topCardsPreview.length === 1 ? 'grid-cols-1' : 'grid-cols-2') + ' gap-4'}>
                        {topCardsPreview.map(function (card, index) {
                          return (
                            <div key={card.id || index} className={'block rounded-lg overflow-hidden shadow-lg w-full ' + (topCardsPreview.length === 1 ? '' : 'aspect-[590/210]')} style={topCardsPreview.length === 1 ? { height: '210px' } : {}}>
                              {card.image ? (
                                <img src={card.image} alt={'تصویر ' + (index + 1)} className="w-full h-full object-cover" />
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

                    <div className="grid gap-3" style={{ gridTemplateColumns: hasRightSide && hasLeftSide ? '21. 6% 54.8% 21.6%' : hasRightSide || hasLeftSide ? '28.2% 71.8%' : '1fr' }}>
                      {hasRightSide && (
                        <div className="block rounded-lg overflow-hidden shadow-lg w-full aspect-[260/310] relative">
                          {sortedRightSideBanners.length > 0 && sortedRightSideBanners[currentRightSlide] && sortedRightSideBanners[currentRightSlide].image ? (
                            <img src={sortedRightSideBanners[currentRightSlide].image} alt="تصویر کناری راست" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">بدون تصویر</span>
                            </div>
                          )}
                          {sortedRightSideBanners.length > 1 && (
                            <>
                              <button onClick={prevRightSlide} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow">
                                <ChevronRight size={14} />
                              </button>
                              <button onClick={nextRightSlide} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow">
                                <ChevronLeft size={14} />
                              </button>
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                {sortedRightSideBanners.map(function (_, idx) {
                                  return (
                                    <button key={idx} onClick={function () { setCurrentRightSlide(idx); }} className={'w-1. 5 h-1.5 rounded-full ' + (idx === currentRightSlide ? 'bg-white' : 'bg-white/50')} />
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="rounded-lg overflow-hidden shadow-lg w-full aspect-[660/310] relative">
                        {sortedMainBanners.length > 0 ? (
                          <>
                            {sortedMainBanners[currentSlide] && sortedMainBanners[currentSlide].image ? (
                              <img src={sortedMainBanners[currentSlide].image} alt="بنر اصلی" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">بنر {currentSlide + 1}</span>
                              </div>
                            )}
                            {sortedMainBanners.length > 1 && (
                              <>
                                <button onClick={prevSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow">
                                  <ChevronRight size={20} />
                                </button>
                                <button onClick={nextSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow">
                                  <ChevronLeft size={20} />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1. 5">
                                  {sortedMainBanners.map(function (_, idx) {
                                    return (
                                      <button key={idx} onClick={function () { setCurrentSlide(idx); }} className={'w-2 h-2 rounded-full ' + (idx === currentSlide ? 'bg-white' : 'bg-white/50')} />
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
                        <div className="block rounded-lg overflow-hidden shadow-lg w-full aspect-[260/310] relative">
                          {sortedLeftSideBanners.length > 0 && sortedLeftSideBanners[currentLeftSlide] && sortedLeftSideBanners[currentLeftSlide].image ? (
                            <img src={sortedLeftSideBanners[currentLeftSlide].image} alt="تصویر کناری چپ" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400">بدون تصویر</span>
                            </div>
                          )}
                          {sortedLeftSideBanners.length > 1 && (
                            <>
                              <button onClick={prevLeftSlide} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow">
                                <ChevronRight size={14} />
                              </button>
                              <button onClick={nextLeftSlide} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow">
                                <ChevronLeft size={14} />
                              </button>
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                {sortedLeftSideBanners.map(function (_, idx) {
                                  return (
                                    <button key={idx} onClick={function () { setCurrentLeftSlide(idx); }} className={'w-1.5 h-1.5 rounded-full ' + (idx === currentLeftSlide ? 'bg-white' : 'bg-white/50')} />
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {bottomCardsPreview.length > 0 && (
                      <div className="space-y-4">
                        {(function () {
                          var rows = [];
                          for (var i = 0; i < bottomCardsPreview.length; i += 3) {
                            var rowItems = bottomCardsPreview.slice(i, i + 3);
                            var count = rowItems.length;
                            var colsClass = count === 3 ? 'grid-cols-3' : count === 2 ? 'grid-cols-2' : 'grid-cols-1';
                            rows.push(
                              <div key={'bottom-' + i} className={'grid ' + colsClass + ' gap-4'}>
                                {rowItems.map(function (card, idx) {
                                  return (
                                    <div key={(card.id || 'p') + '-' + idx} className="block rounded-lg overflow-hidden shadow-lg w-full h-[180px] xl:h-[210px]">
                                      {card.image ? (
                                        <img src={card.image} alt={'تصویر ' + (i + idx + 1)} className="w-full h-full object-cover" />
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