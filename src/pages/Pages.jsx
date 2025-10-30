import React, { useState, useMemo } from "react";
import { Search, Pencil, Trash2, CheckCircle2, Circle, Plus, Menu, ChevronDown, ChevronUp, GripVertical, Link2 } from "lucide-react";

// Badge وضعیت
const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
      active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"
    }`}
  >
    {active ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
    {active ? "فعال" : "غیرفعال"}
  </span>
);

// سوییچ وضعیت
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange?.(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? "bg-green-500" : "bg-gray-300"
    }`}
    aria-pressed={checked}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
);

// نوار جستجو
const SearchBar = ({ value, onChange }) => (
  <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
    <Search className="w-4 h-4 text-gray-500" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="جستجو بر اساس نام یا عنوان…"
      className="flex-1 outline-none text-sm bg-transparent"
    />
  </div>
);

const formatDateFA = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return iso;
  }
};

// کامپوننت آیتم منو (با قابلیت زیرمنو)
const MenuItem = ({ item, level = 0, parentId = null, onEdit, onDelete, onToggle, onMove, pages, siblings }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const getPagePath = (slug) => {
    const page = pages.find(p => p.slug === slug);
    return page ? `/${slug}` : '#';
  };

  const itemIndex = siblings.findIndex(s => s.id === item.id);
  const canMoveUp = itemIndex > 0;
  const canMoveDown = itemIndex < siblings.length - 1;

  return (
    <div className="mb-2">
      <div 
        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
        style={{ marginRight: `${level * 24}px` }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => onMove(item.id, 'up', parentId)}
                disabled={!canMoveUp}
                className={`p-0.5 rounded ${canMoveUp ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onMove(item.id, 'down', parentId)}
                disabled={!canMoveDown}
                className={`p-0.5 rounded ${canMoveDown ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            
            {item.children && item.children.length > 0 && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800">{item.label}</span>
                <StatusBadge active={item.active} />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link2 className="w-3 h-3" />
                <span dir="ltr">{getPagePath(item.pageSlug)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Toggle checked={item.active} onChange={(next) => onToggle(item.id, next)} />
            
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Pencil className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && item.children && item.children.length > 0 && (
        <div className="mt-2">
          {item.children.map(child => (
            <MenuItem
              key={child.id}
              item={child}
              level={level + 1}
              parentId={item.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onMove={onMove}
              pages={pages}
              siblings={item.children}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("pages"); // "pages" | "menu" | "footer"
  
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

  const [query, setQuery] = useState("");
  const [showPageModal, setShowPageModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // Menu modal states
  const [menuLabel, setMenuLabel] = useState("");
  const [menuPageSlug, setMenuPageSlug] = useState("");
  const [menuParentId, setMenuParentId] = useState("");
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  // Footer modal states
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [showFooterLinkModal, setShowFooterLinkModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [currentColumnId, setCurrentColumnId] = useState(null);
  const [footerColumnTitle, setFooterColumnTitle] = useState("");
  const [footerLinkText, setFooterLinkText] = useState("");
  const [footerLinkUrl, setFooterLinkUrl] = useState("");
  const [footerLinkIcon, setFooterLinkIcon] = useState("");

  // Page parent selection
  const [pageParentSlug, setPageParentSlug] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) => p.slug.toLowerCase().includes(q) || (p.title ?? "").toLowerCase().includes(q)
    );
  }, [pages, query]);

  const handleDeletePage = async (page) => {
    const ok = confirm(`صفحه «${page.title || page.slug}» حذف شود؟`);
    if (!ok) return;
    setPages((prev) => prev.filter((x) => x.id !== page.id));
  };

  const handleTogglePageActive = (page, next) => {
    setPages((prev) => prev.map((x) => (x.id === page.id ? { ...x, active: next } : x)));
  };

  const handleCreatePage = async () => {
    if (!newSlug.trim()) return alert("آدرس صفحه را وارد کنید");
    if (!/^[a-z0-9-]+$/.test(newSlug)) return alert("آدرس فقط با حروف کوچک انگلیسی، عدد و خط تیره");

    setCreating(true);
    try {
      const slug = newSlug.trim();
      const title = (newTitle.trim() || slug);
      const local = {
        id: crypto.randomUUID?.() || String(Date.now()),
        slug,
        title,
        parentSlug: pageParentSlug || null, // اضافه شد
        createdAt: new Date().toISOString(),
        active: true,
      };

      setPages((prev) => [local, ...prev]);
      setShowPageModal(false);
      setNewSlug("");
      setNewTitle("");
      setPageParentSlug("");
      
      alert(`صفحه با موفقیت ساخته شد!\nآدرس: ${local.parentSlug ? `/${local.parentSlug}/${slug}` : `/${slug}`}`);
    } finally {
      setCreating(false);
    }
  };

  const handleEditPage = (page) => {
    alert(`ویرایش صفحه: ${page.title}\nآدرس: /${page.slug}`);
  };

  // Menu functions
  const handleDeleteMenuItem = (itemId) => {
    const deleteFromTree = (items) => {
      return items.filter(item => {
        if (item.id === itemId) return false;
        if (item.children) {
          item.children = deleteFromTree(item.children);
        }
        return true;
      });
    };
    
    const ok = confirm("این آیتم منو حذف شود؟");
    if (!ok) return;
    
    setMenuItems(prev => deleteFromTree([...prev]));
  };

  const handleToggleMenuItem = (itemId, active) => {
    const updateInTree = (items) => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, active };
        }
        if (item.children) {
          return { ...item, children: updateInTree(item.children) };
        }
        return item;
      });
    };
    
    setMenuItems(prev => updateInTree([...prev]));
  };

  const handleEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setMenuLabel(item.label);
    setMenuPageSlug(item.pageSlug);
    setMenuParentId("");
    setShowMenuModal(true);
  };

  const handleSaveMenuItem = () => {
    if (!menuLabel.trim()) return alert("عنوان منو را وارد کنید");
    if (!menuPageSlug) return alert("صفحه مورد نظر را انتخاب کنید");

    const newItem = {
      id: editingMenuItem?.id || `m-${Date.now()}`,
      label: menuLabel.trim(),
      pageSlug: menuPageSlug,
      active: true,
      order: editingMenuItem?.order || Date.now(),
      children: editingMenuItem?.children || []
    };

    if (editingMenuItem) {
      // ویرایش
      const updateInTree = (items) => {
        return items.map(item => {
          if (item.id === editingMenuItem.id) {
            return newItem;
          }
          if (item.children) {
            return { ...item, children: updateInTree(item.children) };
          }
          return item;
        });
      };
      setMenuItems(prev => updateInTree([...prev]));
    } else {
      // ساخت جدید
      if (menuParentId) {
        // اضافه کردن به زیرمنو
        const addToTree = (items) => {
          return items.map(item => {
            if (item.id === menuParentId) {
              return {
                ...item,
                children: [...(item.children || []), newItem]
              };
            }
            if (item.children) {
              return { ...item, children: addToTree(item.children) };
            }
            return item;
          });
        };
        setMenuItems(prev => addToTree([...prev]));
      } else {
        // اضافه کردن به منوی اصلی
        setMenuItems(prev => [...prev, newItem]);
      }
    }

    setShowMenuModal(false);
    setMenuLabel("");
    setMenuPageSlug("");
    setMenuParentId("");
    setEditingMenuItem(null);
  };

  const openNewMenuModal = () => {
    setEditingMenuItem(null);
    setMenuLabel("");
    setMenuPageSlug("");
    setMenuParentId("");
    setShowMenuModal(true);
  };

  // لیست تمام آیتم‌های منو برای انتخاب parent (به صورت بازگشتی)
  const getAllMenuItems = (items, level = 0) => {
    let result = [];
    items.forEach(item => {
      result.push({ ...item, level });
      if (item.children && item.children.length > 0) {
        result = [...result, ...getAllMenuItems(item.children, level + 1)];
      }
    });
    return result;
  };

  const allMenuItemsFlat = getAllMenuItems(menuItems);

  // Footer functions
  const handleAddColumn = () => {
    if (footerColumns.length >= 4) {
      return alert("حداکثر 4 ستون مجاز است");
    }
    setEditingColumn(null);
    setFooterColumnTitle("");
    setShowFooterModal(true);
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setFooterColumnTitle(column.title);
    setShowFooterModal(true);
  };

  const handleSaveColumn = () => {
    if (!footerColumnTitle.trim()) return alert("عنوان ستون را وارد کنید");

    if (editingColumn) {
      setFooterColumns(prev => prev.map(col => 
        col.id === editingColumn.id 
          ? { ...col, title: footerColumnTitle.trim() }
          : col
      ));
    } else {
      const newColumn = {
        id: `f-${Date.now()}`,
        title: footerColumnTitle.trim(),
        order: footerColumns.length + 1,
        links: []
      };
      setFooterColumns(prev => [...prev, newColumn]);
    }

    setShowFooterModal(false);
    setFooterColumnTitle("");
    setEditingColumn(null);
  };

  const handleDeleteColumn = (columnId) => {
    const ok = confirm("این ستون حذف شود؟");
    if (!ok) return;
    setFooterColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const handleAddLink = (columnId) => {
    setCurrentColumnId(columnId);
    setEditingLink(null);
    setFooterLinkText("");
    setFooterLinkUrl("");
    setFooterLinkIcon("");
    setShowFooterLinkModal(true);
  };

  const handleEditLink = (columnId, link) => {
    setCurrentColumnId(columnId);
    setEditingLink(link);
    setFooterLinkText(link.text);
    setFooterLinkUrl(link.url);
    setFooterLinkIcon(link.icon);
    setShowFooterLinkModal(true);
  };

  const handleSaveLink = () => {
    if (!footerLinkText.trim()) return alert("متن لینک را وارد کنید");
    if (!footerLinkUrl.trim()) return alert("آدرس لینک را وارد کنید");

    const newLink = {
      id: editingLink?.id || `l-${Date.now()}`,
      text: footerLinkText.trim(),
      url: footerLinkUrl.trim(),
      icon: footerLinkIcon.trim()
    };

    setFooterColumns(prev => prev.map(col => {
      if (col.id === currentColumnId) {
        if (editingLink) {
          return {
            ...col,
            links: col.links.map(link => link.id === editingLink.id ? newLink : link)
          };
        } else {
          return {
            ...col,
            links: [...col.links, newLink]
          };
        }
      }
      return col;
    }));

    setShowFooterLinkModal(false);
    setFooterLinkText("");
    setFooterLinkUrl("");
    setFooterLinkIcon("");
    setEditingLink(null);
    setCurrentColumnId(null);
  };

  const handleDeleteLink = (columnId, linkId) => {
    const ok = confirm("این لینک حذف شود؟");
    if (!ok) return;
    
    setFooterColumns(prev => prev.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          links: col.links.filter(link => link.id !== linkId)
        };
      }
      return col;
    }));
  };

  const moveColumn = (columnId, direction) => {
    setFooterColumns(prev => {
      const idx = prev.findIndex(c => c.id === columnId);
      if (idx === -1) return prev;
      
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      
      const newArr = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newArr[idx], newArr[targetIdx]] = [newArr[targetIdx], newArr[idx]];
      
      return newArr.map((col, i) => ({ ...col, order: i + 1 }));
    });
  };

  const moveMenuItem = (itemId, direction, parentId = null) => {
    const moveInArray = (items) => {
      const idx = items.findIndex(item => item.id === itemId);
      if (idx === -1) return items;
      
      if (direction === 'up' && idx === 0) return items;
      if (direction === 'down' && idx === items.length - 1) return items;
      
      const newArr = [...items];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newArr[idx], newArr[targetIdx]] = [newArr[targetIdx], newArr[idx]];
      
      return newArr.map((item, i) => ({ ...item, order: i + 1 }));
    };

    if (!parentId) {
      setMenuItems(prev => moveInArray(prev));
    } else {
      setMenuItems(prev => prev.map(item => {
        if (item.id === parentId) {
          return { ...item, children: moveInArray(item.children) };
        }
        if (item.children) {
          return { ...item, children: item.children.map(child => {
            if (child.id === parentId) {
              return { ...child, children: moveInArray(child.children) };
            }
            return child;
          })};
        }
        return item;
      }));
    }
  };

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

        {/* محتوای تب صفحات */}
        {activeTab === "pages" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center mb-6 gap-3">
              <h2 className="text-lg font-bold text-gray-700 sm:justify-self-start">صفحات من</h2>
              <div className="flex items-center gap-2 justify-self-start sm:justify-self-end w-full sm:w-auto">
                <div className="flex-1 sm:flex-none min-w-[220px]">
                  <SearchBar value={query} onChange={setQuery} />
                </div>
                <button
                  onClick={() => setShowPageModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  افزودن
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl text-center text-gray-500">
                  نتیجه‌ای پیدا نشد.
                </div>
              )}

              {filtered.map((p) => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm text-gray-500">نام:</span>
                        <span className="font-semibold" dir="ltr">{p.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm text-gray-500">عنوان:</span>
                        <span className="font-medium text-gray-800">{p.title || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm text-gray-500">آدرس:</span>
                        <span className="text-indigo-600 font-mono text-sm" dir="ltr">/{p.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500">تاریخ ایجاد:</span>
                        <span className="text-gray-700">{formatDateFA(p.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">وضعیت:</span>
                        <StatusBadge active={p.active} />
                        <Toggle checked={p.active} onChange={(next) => handleTogglePageActive(p, next)} />
                      </div>

                      <button
                        onClick={() => handleEditPage(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        <Pencil className="w-4 h-4" />
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDeletePage(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* محتوای تب منوی هدر */}
        {activeTab === "menu" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-700">آیتم‌های منوی هدر</h2>
              <button
                onClick={openNewMenuModal}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                افزودن آیتم منو
              </button>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-indigo-700 mb-2">
                <Menu className="w-4 h-4" />
                <span className="font-semibold">نکات مهم:</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mr-6">
                <li>• هر آیتم منو به یک صفحه از صفحات شما لینک می‌شود</li>
                <li>• می‌توانید زیرمنو (منوی آبشاری) ایجاد کنید</li>
                <li>• آدرس زیرصفحات به صورت خودکار از صفحه اصلی ساخته می‌شود</li>
              </ul>
            </div>

            <div className="space-y-2">
              {menuItems.length === 0 && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl text-center text-gray-500">
                  هنوز آیتمی به منو اضافه نشده است.
                </div>
              )}

              {menuItems.map(item => (
                <MenuItem
                  key={item.id}
                  item={item}
                  onEdit={handleEditMenuItem}
                  onDelete={handleDeleteMenuItem}
                  onToggle={handleToggleMenuItem}
                  onMove={moveMenuItem}
                  pages={pages}
                  siblings={menuItems}
                />
              ))}
            </div>
          </>
        )}

        {/* محتوای تب فوتر */}
        {activeTab === "footer" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-700">ستون‌های فوتر</h2>
              <button
                onClick={handleAddColumn}
                disabled={footerColumns.length >= 4}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                افزودن ستون ({footerColumns.length}/4)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {footerColumns.map((column, idx) => (
                <div key={column.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800">{column.title}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveColumn(column.id, 'up')}
                        disabled={idx === 0}
                        className={`p-1 rounded ${idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveColumn(column.id, 'down')}
                        disabled={idx === footerColumns.length - 1}
                        className={`p-1 rounded ${idx === footerColumns.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {column.links.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">بدون لینک</p>
                    )}
                    {column.links.map(link => (
                      <div key={link.id} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {link.icon && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{link.icon}</span>
                          )}
                          <span className="text-sm truncate">{link.text}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditLink(column.id, link)}
                            className="p-1 hover:bg-white rounded"
                          >
                            <Pencil className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(column.id, link.id)}
                            className="p-1 hover:bg-white rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddLink(column.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      <Plus className="w-3 h-3" />
                      لینک
                    </button>
                    <button
                      onClick={() => handleEditColumn(column)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal ساخت صفحه */}
      {showPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !creating && setShowPageModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">ساخت صفحه جدید</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">آدرس (Slug)</label>
                <input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: landing-page"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">
                  آدرس صفحه: {pageParentSlug ? `/${pageParentSlug}/` : '/'}{newSlug || "..."}
                </p>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">عنوان</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: صفحه لندینگ"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">صفحه والد (اختیاری)</label>
                <select
                  value={pageParentSlug}
                  onChange={(e) => setPageParentSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">بدون والد (صفحه اصلی)</option>
                  {pages.map(page => (
                    <option key={page.id} value={page.slug}>
                      {page.title} (/{page.slug})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  برای ایجاد زیرصفحه، صفحه والد را انتخاب کنید
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPageModal(false)}
                disabled={creating}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleCreatePage}
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating ? "در حال ساخت…" : "ساخت"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal افزودن/ویرایش آیتم منو */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMenuModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">
              {editingMenuItem ? "ویرایش آیتم منو" : "افزودن آیتم منو"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">عنوان منو</label>
                <input
                  value={menuLabel}
                  onChange={(e) => setMenuLabel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: خانه"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1 text-gray-700">صفحه مقصد</label>
                <select
                  value={menuPageSlug}
                  onChange={(e) => setMenuPageSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">انتخاب کنید</option>
                  {pages.map(page => (
                    <option key={page.id} value={page.slug}>
                      {page.title} (/{page.slug})
                    </option>
                  ))}
                </select>
              </div>

              {!editingMenuItem && (
                <div>
                  <label className="block text-sm mb-1 text-gray-700">منوی والد (اختیاری)</label>
                  <select
                    value={menuParentId}
                    onChange={(e) => setMenuParentId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">بدون والد (منوی اصلی)</option>
                    {allMenuItemsFlat.map(item => (
                      <option key={item.id} value={item.id}>
                        {"—".repeat(item.level)} {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    برای ایجاد زیرمنو، منوی والد را انتخاب کنید
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowMenuModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveMenuItem}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {editingMenuItem ? "ذخیره تغییرات" : "افزودن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal افزودن/ویرایش ستون فوتر */}
      {showFooterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFooterModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">
              {editingColumn ? "ویرایش ستون" : "افزودن ستون"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">عنوان ستون</label>
                <input
                  value={footerColumnTitle}
                  onChange={(e) => setFooterColumnTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: پیوند های مفید"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFooterModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveColumn}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {editingColumn ? "ذخیره تغییرات" : "افزودن"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal افزودن/ویرایش لینک فوتر */}
      {showFooterLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFooterLinkModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">
              {editingLink ? "ویرایش لینک" : "افزودن لینک"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">متن لینک</label>
                <input
                  value={footerLinkText}
                  onChange={(e) => setFooterLinkText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: درباره ما"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">آدرس (URL)</label>
                <input
                  value={footerLinkUrl}
                  onChange={(e) => setFooterLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: /about یا https://example.com"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700">آیکن (اختیاری)</label>
                <input
                  value={footerLinkIcon}
                  onChange={(e) => setFooterLinkIcon(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: phone, send, camera"
                />
                <p className="text-xs text-gray-500 mt-1">
                  نام آیکن از Lucide React (مثل phone, mail, home)
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFooterLinkModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveLink}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {editingLink ? "ذخیره تغییرات" : "افزودن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}