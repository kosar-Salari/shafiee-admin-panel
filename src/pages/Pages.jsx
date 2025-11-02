// src/pages/AdminPanel.jsx - فایل اصلی
import React, { useState } from "react";
import PagesManagement from "../components/pages/PagesManagement";
import HeaderMenuManagement from "../components/pages/HeaderMenuManagement";
import FooterManagement from "../components/pages/FooterManagement";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("pages");
  
  const [pages, setPages] = useState([
    { id: "1", slug: "landing", title: "صفحه لندینگ", createdAt: "2025-10-10T12:00:00Z", active: true },
    { id: "2", slug: "pricing", title: "قیمت‌ها", createdAt: "2025-10-12T09:30:00Z", active: false },
    { id: "3", slug: "about-us", title: "درباره ما", createdAt: "2025-10-15T18:20:00Z", active: true },
    { id: "4", slug: "services", title: "خدمات", createdAt: "2025-10-16T10:00:00Z", active: true },
    { id: "5", slug: "contact", title: "تماس با ما", createdAt: "2025-10-17T14:30:00Z", active: true },
  ]);

  const [menuItems, setMenuItems] = useState([
    {
      id: "m1",
      label: "خانه",
      pageSlug: "landing",
      active: true,
      order: 1,
      children: []
    },
    {
      id: "m2",
      label: "خدمات",
      pageSlug: "services",
      active: true,
      order: 2,
      children: [
        {
          id: "m2-1",
          label: "قیمت‌گذاری",
          pageSlug: "pricing",
          active: true,
          order: 1,
          children: []
        }
      ]
    },
    {
      id: "m3",
      label: "درباره ما",
      pageSlug: "about-us",
      active: true,
      order: 3,
      children: []
    }
  ]);

  const [footerColumns, setFooterColumns] = useState([
    {
      id: "f1",
      title: "پیوند های مفید",
      order: 1,
      links: [
        { id: "l1", text: "درباره ما", url: "/about", icon: "" },
        { id: "l2", text: "تماس با ما", url: "/contact", icon: "" }
      ]
    },
    {
      id: "f2",
      title: "مدارس و شعب",
      order: 2,
      links: [
        { id: "l3", text: "پیش دبستان و دبستان", url: "/primary", icon: "" },
        { id: "l4", text: "دوره اول متوسطه", url: "/middle", icon: "" }
      ]
    },
    {
      id: "f3",
      title: "ما را در شبکه های اجتماعی دنبال کنید",
      order: 3,
      links: [
        { id: "l5", text: "واتساپ", url: "https://wa.me/123", icon: "phone" },
        { id: "l6", text: "تلگرام", url: "https://t.me/school", icon: "send" },
        { id: "l7", text: "اینستاگرام", url: "https://instagram.com/school", icon: "camera" }
      ]
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* هدر اصلی */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">پنل مدیریت</h1>
          
          {/* تب‌ها */}
          <div className="flex gap-2 border-b border-gray-200">
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