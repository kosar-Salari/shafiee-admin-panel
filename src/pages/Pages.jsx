// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import PagesManagement from "../components/pages/PagesManagement";
import HeaderMenuManagement from "../components/pages/HeaderMenuManagement";
import FooterManagement from "../components/pages/FooterManagement";

import { getSettings, updateSettings } from "../services/settingsService";
import { apiToLocal, localToApi } from "../services/settingsMapper";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("pages");

  // ====== Loading / Saving ======
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ====== Settings state (از API) ======
  const [logo, setLogo] = useState("");
  const [mainBanner, setMainBanner] = useState("");
  const [rightBanner, setRightBanner] = useState("");
  const [leftBanner, setLeftBanner] = useState("");

  const [newsActive, setNewsActive] = useState(true);
  const [articlesActive, setArticlesActive] = useState(true);
  const [newsCount, setNewsCount] = useState(5);
  const [articlesCount, setArticlesCount] = useState(5);

  const [menuItems, setMenuItems] = useState([]);
  const [footerColumns, setFooterColumns] = useState([]);

  // ====== Local demo pages (ربطی به API نداره) ======
  const [pages, setPages] = useState([
    { id: "1", slug: "landing", title: "صفحه لندینگ", createdAt: "2025-10-10T12:00:00Z", active: true },
    { id: "2", slug: "pricing", title: "قیمت‌ها", createdAt: "2025-10-12T09:30:00Z", active: false },
    { id: "3", slug: "about-us", title: "درباره ما", createdAt: "2025-10-15T18:20:00Z", active: true },
    { id: "4", slug: "services", title: "خدمات", createdAt: "2025-10-16T10:00:00Z", active: true },
    { id: "5", slug: "contact", title: "تماس با ما", createdAt: "2025-10-17T14:30:00Z", active: true },
  ]);

  // ====== Load settings ======
  const loadSettings = async () => {
    setLoading(true);
    try {
      const api = await getSettings();
      const local = apiToLocal(api);

      setLogo(local.logo || "");
      setMainBanner(local.mainBanner || "");
      setRightBanner(local.rightBanner || "");
      setLeftBanner(local.leftBanner || "");

      setNewsActive(!!local.newsActive);
      setArticlesActive(!!local.articlesActive);
      setNewsCount(Number(local.newsCount || 5));
      setArticlesCount(Number(local.articlesCount || 5));

      setMenuItems(local.menuItems || []);
      setFooterColumns(local.footerColumns || []);
      // اگر imageLinks1/2 UI داری، اینجا set کن
    } catch (e) {
      console.error(e);
      alert("خطا در دریافت تنظیمات سایت");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // ====== Save settings (PATCH) ======
  const handleSaveSettings = async () => {
  setSaving(true);
  try {
    const payload = localToApi({
      logo,
      mainBanner,
      rightBanner,
      leftBanner,
      newsActive,
      articlesActive,
      newsCount,
      articlesCount,
      menuItems,
      footerColumns,
      imageLinks1: [],
      imageLinks2: [],
    });

    // 👇 لاگ یک‌جا و تمیز
    console.groupCollapsed('%c[AdminPanel] Payload آماده‌ی ارسال', 'color:#2563eb;font-weight:700;');
    console.log('📦 Local snapshot:', {
      logo, mainBanner, rightBanner, leftBanner,
      newsActive, articlesActive, newsCount, articlesCount,
      menuItems, footerColumns
    });
    console.table(menuItems.map(m => ({
      label: m.label, slug: m.pageSlug, order: m.order
    })));
    console.log('➡️ payload.menuItems:', payload.menuItems);
    console.log('➡️ payload.footerColumns:', payload.footerColumns);
    console.groupEnd();

    await updateSettings(payload);
    alert("تنظیمات با موفقیت ذخیره شد ✅");
  } catch (e) {
    console.error('[AdminPanel] Save error:', e?.response?.status, e?.response?.data || e);
    alert(e?.response?.data?.message || "خطا در ذخیره تنظیمات");
  } finally {
    setSaving(false);
  }
};


  return (
    <div className="min-h-screen font-lahzeh bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* هدر / اکشن‌ها */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">پنل مدیریت</h1>
            <p className="text-sm text-gray-500">
              {loading ? "در حال دریافت تنظیمات…" : "تنظیمات سایت را ویرایش کنید و ذخیره نمایید"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSettings}
              disabled={loading || saving}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              بازخوانی
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={loading || saving}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
            </button>
          </div>
        </div>

        {/* تب‌ها */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "pages"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            مدیریت صفحات
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "menu"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            مدیریت منوی هدر
          </button>
          <button
            onClick={() => setActiveTab("footer")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "footer"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            مدیریت فوتر
          </button>
        </div>

        {/* محتوای تب‌ها */}
        {activeTab === "pages" && (
          <PagesManagement pages={pages} setPages={setPages} />
        )}

        {activeTab === "menu" && (
          <HeaderMenuManagement
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            pages={pages}
            logo={logo}
            setLogo={setLogo}
          />
        )}

        {activeTab === "footer" && (
          <FooterManagement
            footerColumns={footerColumns}
            setFooterColumns={setFooterColumns}
          />
        )}


      </div>
    </div>
  );
}
