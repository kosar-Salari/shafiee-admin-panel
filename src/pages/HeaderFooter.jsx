// src/pages/HeaderFooterPage.jsx
import { useEffect, useState } from "react";
import HeaderMenuManagement from "../components/pages/HeaderMenuManagement";
import FooterManagement from "../components/pages/FooterManagement";
import { getSettings, updateSettings } from "../services/settingsService";
import { getPages } from "../services/pagesService";
import { getArticles } from "../services/articlesService";
import { getNews } from "../services/newsService";

// --- helpers: footerColumns ---
function normalizeFooterColumnsFromApi(apiCols) {
  if (!Array.isArray(apiCols)) return [];
  return apiCols.map((col, idx) => ({
    id: col.id || `f-${idx}`,
    title: col.title || "",
    order:
      typeof col.order === "number"
        ? col.order
        : idx + 1,
    links: Array.isArray(col.items)
      ? col.items.map((item, j) => ({
          id: item.id || `l-${idx}-${j}`,
          text: item.text || "",
          url: item.link || "", // از link می‌خوانیم
          icon: item.icon || "",
        }))
      : [],
  }));
}

function buildFooterColumnsPayload(uiCols) {
  if (!Array.isArray(uiCols)) return [];
  const sorted = [...uiCols].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  return sorted.map((col, idx) => ({
    title: col.title || "",
    order: idx + 1,
    items: Array.isArray(col.links)
      ? col.links.map((l, linkIdx) => ({
          text: l.text || "",
          link: l.url || "", // به link برمی‌گردانیم
          icon: l.icon || "",
          position: linkIdx + 1,
        }))
      : [],
  }));
}

// --- helpers: menuItems ---
function linkToSlug(link) {
  if (!link) return "";
  if (link.startsWith("/pages/")) return link.replace("/pages/", "");
  if (link.startsWith("/articles/")) return link.replace("/articles/", "");
  if (link.startsWith("/news/")) return link.replace("/news/", "");
  return link.replace(/^\//, "");
}

function normalizeMenuFromApi(apiItems) {
  if (!Array.isArray(apiItems)) return [];
  let counter = 0;

  const mapItem = (item, index) => {
    counter += 1;
    const uiItem = {
      id: item.id || `m-${counter}`,
      label: item.text || "",
      pageSlug: linkToSlug(item.link || ""),
      active: true, // بک‌اند فیلد active ندارد؛ همه را فعال می‌گیریم
      order:
        typeof item.position === "number"
          ? item.position
          : index + 1,
      children: [],
    };
    if (Array.isArray(item.children) && item.children.length) {
      uiItem.children = item.children.map(mapItem);
    }
    return uiItem;
  };

  return apiItems.map(mapItem);
}

function buildMenuPayloadFromUi(uiItems, targets) {
  if (!Array.isArray(uiItems)) return [];

  const findTarget = (slug) =>
    targets.find((t) => t.slug === slug) || null;

  const sortedTop = [...uiItems].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const mapItem = (uiItem, idx, siblingsSorted) => {
    if (uiItem.active === false) return null;

    const target = findTarget(uiItem.pageSlug);

    // برای page: path از targets می‌آید (الان /{slug} است)
    // برای article/news هم path مخصوص خودشان است.
    const link = target?.path || `/${uiItem.pageSlug}`;

    const childrenSorted = Array.isArray(uiItem.children)
      ? [...uiItem.children].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        )
      : [];

    const childrenPayload = childrenSorted
      .map((child, childIdx, arr) =>
        mapItem(child, childIdx, arr)
      )
      .filter(Boolean);

    const payload = {
      text: uiItem.label || "",
      link,
      position: idx + 1,
    };
    if (childrenPayload.length) {
      payload.children = childrenPayload;
    }
    return payload;
  };

  return sortedTop
    .map((item, idx, arr) => mapItem(item, idx, arr))
    .filter(Boolean);
}

export default function HeaderFooterPage() {
  const [settings, setSettings] = useState(null); // کل تنظیمات
  const [menuUi, setMenuUi] = useState([]); // منوی هدر برای UI
  const [footerUi, setFooterUi] = useState([]); // فوتر برای UI
  const [targets, setTargets] = useState([]); // صفحات + مقالات + اخبار برای منو

  const [activeSection, setActiveSection] = useState("header");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // --------- load settings + link targets ----------
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [settingsData, pages, articles, news] = await Promise.all([
          getSettings(),
          getPages(),
          getArticles(),
          getNews(),
        ]);

        if (!mounted) return;

        const disableComments = Array.isArray(
          settingsData.disableCommentsForPages
        )
          ? settingsData.disableCommentsForPages
          : [];

        setSettings({
          ...settingsData,
          disableCommentsForPages: disableComments,
        });

        setMenuUi(normalizeMenuFromApi(settingsData.menuItems || []));
        setFooterUi(
          normalizeFooterColumnsFromApi(
            settingsData.footerColumns || []
          )
        );

        // 🔥 اینجا path صفحات را بدون /pages می‌سازیم
        const pageTargets = (pages || []).map((p) => ({
          id: `page-${p.id}`,
          type: "page",
          typeLabel: "[صفحه]",
          slug: p.slug,
          title: p.title,
          path: `/${p.slug}`, // قبلاً `/pages/${p.slug}` بود
        }));

        const articleTargets = (articles || []).map((a) => ({
          id: `article-${a.id}`,
          type: "article",
          typeLabel: "[مقاله]",
          slug: a.slug,
          title: a.title,
          path: `/articles/${a.slug}`,
        }));

        const newsTargets = (news || []).map((n) => ({
          id: `news-${n.id}`,
          type: "news",
          typeLabel: "[خبر]",
          slug: n.slug,
          title: n.title,
          path: `/news/${n.slug}`,
        }));

        setTargets([...pageTargets, ...articleTargets, ...newsTargets]);
      } catch (e) {
        console.error(e);
        if (mounted) setError("خطا در دریافت تنظیمات سایت");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // --------- handlers برای تغییر لوگو ----------
  const handleLogoChange = (updater) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const nextLogo =
        typeof updater === "function" ? updater(prev.logo) : updater;
      return { ...prev, logo: nextLogo };
    });
  };

  // --------- ذخیره تنظیمات ----------
  const handleSaveChanges = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);

      const menuPayload = buildMenuPayloadFromUi(menuUi, targets);
      const footerPayload = buildFooterColumnsPayload(footerUi);

      const payload = {
        ...settings,
        logo: settings.logo || "",
        menuItems: menuPayload,
        footerColumns: footerPayload,
        disableCommentsForPages: Array.isArray(
          settings.disableCommentsForPages
        )
          ? settings.disableCommentsForPages
          : [],
      };

      await updateSettings(payload);

      setSettings((prev) =>
        prev
          ? {
              ...prev,
              menuItems: menuPayload,
              footerColumns: footerPayload,
            }
          : prev
      );

      setLastSavedAt(new Date());
      alert("تغییرات با موفقیت ذخیره شد");
    } catch (e) {
      console.error(e);
      setError("در ذخیره تغییرات خطایی رخ داد");
      alert("در ذخیره تغییرات خطایی رخ داد");
    } finally {
      setSaving(false);
    }
  };

  const renderLastSavedText = () => {
    if (!lastSavedAt) return "برای ذخیره تغییرات از دکمه پایین استفاده کنید.";
    try {
      const t = lastSavedAt.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `آخرین ذخیره در ساعت ${t}`;
    } catch {
      return "تغییرات ذخیره شد.";
    }
  };

  // --------- UI States ----------
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
          <div className="h-80 w-full bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-red-700 text-sm">
          {error || "تنظیمات سایت یافت نشد."}
        </div>
      </div>
    );
  }

  // --------- Render ----------
  return (
    <div className="h-full flex flex-col p-4">
      <div className="max-w-5xl w-full mx-auto mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          تنظیمات هدر و فوتر
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          لوگوی سایت، منوی هدر و ستون‌های فوتر را از این بخش مدیریت کنید.
        </p>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="max-w-5xl w-full flex flex-col flex-1 min-h-0">
          <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-sm flex flex-col flex-1 min-h-0">
            {/* تب‌ها */}
            <div className="px-4 pt-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSection("header")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeSection === "header"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  مدیریت هدر
                </button>
                <button
                  onClick={() => setActiveSection("footer")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeSection === "footer"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  مدیریت فوتر
                </button>
              </div>

              {error && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                  {error}
                </span>
              )}
            </div>

            {/* محتوا */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {activeSection === "header" && (
                <HeaderMenuManagement
                  logo={settings.logo}
                  setLogo={handleLogoChange}
                  menuItems={menuUi}
                  setMenuItems={setMenuUi}
                  pages={targets}
                />
              )}

              {activeSection === "footer" && (
                <FooterManagement
                  footerColumns={footerUi}
                  setFooterColumns={setFooterUi}
                />
              )}
            </div>

            {/* نوار پایین */}
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/80 rounded-b-2xl">
              <span className="text-xs text-gray-500">
                {renderLastSavedText()}
              </span>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
