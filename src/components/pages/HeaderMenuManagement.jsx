import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Menu,
  Link2,
  Pencil,
  Trash2,
  Image,
  Upload,
  X,
  Tag,
} from "lucide-react";

// مقدار خاص برای نشان‌دادن که این منو فقط عنوان است و لینک ندارد
const NO_LINK_PATH = "#NO_LINK_CATEGORY#";

// گزینه‌های ثابت هدر
const SPECIAL_TARGETS = [
  { value: "", label: "صفحه اصلی", path: "/" },
  { value: "news", label: "صفحه اخبار", path: "/news" },
  { value: "articles", label: "صفحه مقالات", path: "/articles" },
  { value: NO_LINK_PATH, label: "فقط عنوان (بدون لینک)", path: NO_LINK_PATH },
];

// value مخصوص placeholder سلکت
const PLACEHOLDER_VALUE = "__placeholder";

// نرمال‌سازی اسلاگ صفحات: حذف "pages/" و "/pages/" از ابتدای اسلاگ
const normalizePageSlug = (slug) => {
  if (!slug || slug === NO_LINK_PATH) return slug;
  let s = String(slug).trim();

  // لینک‌های خارجی را دست نزن
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // حذف اسلش ابتدایی
  if (s.startsWith("/")) s = s.slice(1);

  // حذف "pages/" در ابتدای مسیر (case-insensitive)
  if (s.toLowerCase().startsWith("pages/")) {
    s = s.slice("pages/".length);
  }

  return s;
};

// تابع کمکی: تبدیل مقدار ذخیره‌شده به آدرس قابل نمایش
function getDisplayPathFromSlug(slug) {
  if (slug === NO_LINK_PATH) return "بدون لینک";
  if (slug === "") {
    const specialHome = SPECIAL_TARGETS.find((s) => s.value === "");
    return specialHome?.path || "/";
  }
  if (!slug) return "";

  const special = SPECIAL_TARGETS.find((s) => s.value === slug);
  if (special) return special.path;

  if (slug.startsWith("/")) return slug;
  return `/${slug}`;
}

function getTargetDisplayPath(target) {
  if (!target) return "";
  if (target.type === "article") return `/articles/${target.slug}`;
  if (target.type === "news") return `/news/${target.slug}`;

  // برای صفحات معمولی یا هر نوع دیگری: اسلاگ نرمال‌شده بدون "/pages"
  const raw = target.slug || target.path || "";
  const normalized = normalizePageSlug(raw);
  return getDisplayPathFromSlug(normalized);
}

const MenuItem = ({
  item,
  level = 0,
  parentId = null,
  onEdit,
  onDelete,
  onMove,
  pages,
  siblings,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const itemIndex = siblings.findIndex((s) => s.id === item.id);
  const canMoveUp = itemIndex > 0;
  const canMoveDown = itemIndex < siblings.length - 1;

  const itemSlugNormalized = normalizePageSlug(item.pageSlug);

  const target = Array.isArray(pages)
    ? pages.find(
      (p) => normalizePageSlug(p.slug) === itemSlugNormalized
    )
    : null;

  const isNoLink = item.pageSlug === NO_LINK_PATH;

  const displayPath = isNoLink
    ? "بدون لینک"
    : target
      ? getTargetDisplayPath(target)
      : getDisplayPathFromSlug(itemSlugNormalized);

  const typeLabel = target?.typeLabel || "";

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
                onClick={() => onMove(item.id, "up", parentId)}
                disabled={!canMoveUp}
                className={`p-0.5 rounded ${canMoveUp
                    ? "hover:bg-gray-100 text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                  }`}
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onMove(item.id, "down", parentId)}
                disabled={!canMoveDown}
                className={`p-0.5 rounded ${canMoveDown
                    ? "hover:bg-gray-100 text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                  }`}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {item.children && item.children.length > 0 && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800">
                  {item.label}
                </span>
                {isNoLink && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    <Tag className="w-3 h-3" />
                    فقط عنوان
                  </span>
                )}
              </div>

              {item.pageSlug !== undefined && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {isNoLink ? (
                    <Tag className="w-3 h-3" />
                  ) : (
                    <Link2 className="w-3 h-3" />
                  )}
                  <span dir="ltr">
                    {typeLabel && <span>{typeLabel} </span>}
                    {displayPath}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          {item.children.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              level={level + 1}
              parentId={item.id}
              onEdit={onEdit}
              onDelete={onDelete}
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

export default function HeaderMenuManagement({
  menuItems,
  setMenuItems,
  pages,
  logo,
  setLogo,
  onLogoUpload,          // 👈 از والد می‌آید
  logoUploading,         // 👈 استیت لودر از والد
  logoUploadProgress,    // 👈 درصد پیشرفت
  logoUploadError,       // 👈 پیام خطا
}) {
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [tempFile, setTempFile] = useState(null);

  // انتخاب اولیه فایل
  const handleLogoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return alert("لطفاً فایل تصویری انتخاب کنید");
    if (file.size > 10 * 1024 * 1024)
      return alert("حجم فایل نباید بیشتر از 10MB باشد");

    setTempFile(file);
    setShowLogoModal(true);
  };

  // تأیید در مودال → اینجاست که آپلود واقعی را صدا می‌زنیم
  const handleConfirmLogo = () => {
    if (!tempFile) return;

    if (onLogoUpload) {
      // آپلود واقعی + ذخیره سمت بک‌اند در HeaderFooterPage انجام می‌شود
      onLogoUpload(tempFile);
    } else {
      // حالت fallback: فقط پیش‌نمایش لوکال
      const url = URL.createObjectURL(tempFile);
      setLogo(url);
    }

    setShowLogoModal(false);
    setTempFile(null);
  };

  const handleCancelLogo = () => {
    if (logoUploading) return; // وسط آپلود مودال را نبند
    setShowLogoModal(false);
    setTempFile(null);
  };

  const handleRemoveLogo = () => {
    const ok = confirm("لوگو حذف شود؟");
    if (ok) setLogo("");
  };

  // --- بقیه کد منو (مثل قبل) ---
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuLabel, setMenuLabel] = useState("");
  const [menuPageSlug, setMenuPageSlug] = useState(PLACEHOLDER_VALUE);
  const [menuParentId, setMenuParentId] = useState("");
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const handleDeleteMenuItem = (itemId) => {
    const deleteFromTree = (items) =>
      items.filter((item) => {
        if (item.id === itemId) return false;
        if (item.children) item.children = deleteFromTree(item.children);
        return true;
      });

    const ok = confirm("این آیتم منو حذف شود؟");
    if (!ok) return;

    setMenuItems((prev) => deleteFromTree([...prev]));
  };

  const handleEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setMenuLabel(item.label);

    const storedSlug = item.pageSlug;
    let initialSlug;

    if (storedSlug === undefined) {
      initialSlug = PLACEHOLDER_VALUE;
    } else if (storedSlug === NO_LINK_PATH) {
      initialSlug = NO_LINK_PATH;
    } else if (storedSlug === "") {
      initialSlug = "";
    } else {
      initialSlug = normalizePageSlug(storedSlug);
    }

    setMenuPageSlug(initialSlug);
    setMenuParentId("");
    setShowMenuModal(true);
  };

  const getAllMenuItems = (items, level = 0) => {
    let result = [];
    items.forEach((item) => {
      result.push({ ...item, level });
      if (item.children?.length)
        result = [...result, ...getAllMenuItems(item.children, level + 1)];
    });
    return result;
  };
  const allMenuItemsFlat = getAllMenuItems(menuItems);

  const handleSaveMenuItem = () => {
    if (!menuLabel.trim()) return alert("عنوان منو را وارد کنید");
    if (menuPageSlug === PLACEHOLDER_VALUE)
      return alert("صفحه مورد نظر را انتخاب کنید");

    const nextTopOrder = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return 1;
      return Math.max(...arr.map((x) => Number(x.order || 0))) + 1;
    };

    let finalSlug;
    if (menuPageSlug === NO_LINK_PATH) {
      finalSlug = NO_LINK_PATH;
    } else if (menuPageSlug === "") {
      finalSlug = "";
    } else {
      finalSlug = normalizePageSlug(menuPageSlug);
    }

    const newItem = {
      id: editingMenuItem?.id || `m-${Date.now()}`,
      label: menuLabel.trim(),
      pageSlug: finalSlug,
      order: editingMenuItem
        ? editingMenuItem.order || 1
        : menuParentId
          ? 1
          : nextTopOrder(menuItems),
      children: editingMenuItem?.children || [],
    };

    if (editingMenuItem) {
      const updateInTree = (items) =>
        items.map((item) => {
          if (item.id === editingMenuItem.id) return newItem;
          if (item.children)
            return { ...item, children: updateInTree(item.children) };
          return item;
        });

      let updated = updateInTree([...menuItems]);

      if (menuParentId) {
        const removeFromTree = (items) =>
          items
            .map((item) => {
              if (item.id === newItem.id) return null;
              if (item.children)
                return { ...item, children: removeFromTree(item.children) };
              return item;
            })
            .filter(Boolean);

        updated = removeFromTree(updated);

        const addToParent = (items) =>
          items.map((item) => {
            if (item.id === menuParentId) {
              return {
                ...item,
                children: [...(item.children || []), newItem],
              };
            }
            if (item.children)
              return { ...item, children: addToParent(item.children) };
            return item;
          });

        updated = addToParent(updated);
      }

      setMenuItems(updated);
    } else {
      if (menuParentId) {
        const addToTree = (items) =>
          items.map((item) => {
            if (item.id === menuParentId) {
              return {
                ...item,
                children: [...(item.children || []), newItem],
              };
            }
            if (item.children)
              return { ...item, children: addToTree(item.children) };
            return item;
          });
        setMenuItems((prev) => addToTree([...prev]));
      } else {
        setMenuItems((prev) => [...prev, newItem]);
      }
    }

    setShowMenuModal(false);
    setMenuLabel("");
    setMenuPageSlug(PLACEHOLDER_VALUE);
    setMenuParentId("");
    setEditingMenuItem(null);
  };

  const openNewMenuModal = () => {
    setEditingMenuItem(null);
    setMenuLabel("");
    setMenuPageSlug(PLACEHOLDER_VALUE);
    setMenuParentId("");
    setShowMenuModal(true);
  };

  const moveMenuItem = (itemId, direction, parentId = null) => {
    const moveInArray = (items) => {
      const idx = items.findIndex((item) => item.id === itemId);
      if (idx === -1) return items;
      if (direction === "up" && idx === 0) return items;
      if (direction === "down" && idx === items.length - 1) return items;
      const newArr = [...items];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      [newArr[idx], newArr[targetIdx]] = [newArr[targetIdx], newArr[idx]];
      return newArr.map((item, i) => ({ ...item, order: i + 1 }));
    };

    if (!parentId) {
      setMenuItems((prev) => moveInArray(prev));
    } else {
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              children: moveInArray(item.children || []),
            };
          }
          if (item.children) {
            return {
              ...item,
              children: item.children.map((child) => {
                if (child.id === parentId) {
                  return {
                    ...child,
                    children: moveInArray(child.children || []),
                  };
                }
                return child;
              }),
            };
          }
          return item;
        })
      );
    }
  };

  return (
    <>
      {/* بخش لوگو */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-700">لوگوی هدر</h2>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {logo ? (
              <div className="relative group">
                {/* پیش‌نمایش شبیه هدر: نوار افقی */}
                <div className="h-16 w-52 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center px-4">
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="h-16 w-52 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 px-4">
                <Image className="w-8 h-8 mb-1" />
                <span className="text-xs">بدون لوگو</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
              <span>{logo ? "تغییر لوگو" : "آپلود لوگو"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoPick}
                className="hidden"
                disabled={logoUploading}
              />
            </label>

            {/* لودر و فیدبک زیر دکمه مثل قبل */}
            {logoUploading && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  <span>
                    در حال آپلود لوگو
                    {logoUploadProgress ? `... ${logoUploadProgress}%` : "..."}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${logoUploadProgress || 10}%` }}
                  />
                </div>
              </div>
            )}

            {logoUploadError && !logoUploading && (
              <div className="mt-3 text-xs text-red-600">
                {logoUploadError}
              </div>
            )}

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                فرمت‌های مجاز: PNG, JPG, SVG
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                حداکثر حجم: 10 مگابایت
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                سایز پیشنهادی: حداقل ۲۴۰×۷۰ پیکسل
                <span className="text-xs text-gray-500">
                  (یا بزرگ‌تر با نسبت تقریبی ۱ به ۳٫۵)
                </span>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* هدر منو */}
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
          <li>• می‌توانید برای منوهای والد گزینه "فقط عنوان (بدون لینک)" را انتخاب کنید</li>
          <li>• می‌توانید زیرمنو (منوی آبشاری) ایجاد کنید</li>
          <li>• ترتیب منو با دکمه‌های ↑ و ↓ قابل تغییر است</li>
        </ul>
      </div>

      <div className="space-y-2">
        {menuItems.length === 0 && (
          <div className="p-6 bg-white border border-gray-200 rounded-xl text-center text-gray-500">
            هنوز آیتمی به منو اضافه نشده است.
          </div>
        )}

        {[...menuItems]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              onEdit={handleEditMenuItem}
              onDelete={handleDeleteMenuItem}
              onMove={moveMenuItem}
              pages={pages}
              siblings={menuItems}
            />
          ))}
      </div>

      {/* مودال منو */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMenuModal(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">
              {editingMenuItem ? "ویرایش آیتم منو" : "افزودن آیتم منو"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  عنوان منو
                </label>
                <input
                  value={menuLabel}
                  onChange={(e) => setMenuLabel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: خانه"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700">
                  صفحه مقصد
                </label>

                <select
                  value={menuPageSlug}
                  onChange={(e) => setMenuPageSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {menuPageSlug === PLACEHOLDER_VALUE && (
                    <option value={PLACEHOLDER_VALUE} hidden>
                      انتخاب کنید
                    </option>
                  )}

                  {SPECIAL_TARGETS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} {s.path !== NO_LINK_PATH && `(${s.path})`}
                    </option>
                  ))}

                  {pages.map((page) => {
                    const normalizedSlug = normalizePageSlug(page.slug);
                    return (
                      <option key={page.id} value={normalizedSlug}>
                        {page.typeLabel ? `${page.typeLabel} ` : ""}
                        {page.title} ({getTargetDisplayPath(page)})
                      </option>
                    );
                  })}
                </select>

                {menuPageSlug === NO_LINK_PATH && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    این منو فقط به عنوان عنوان نمایش داده می‌شود و لینک ندارد
                    (مناسب برای منوهای والد)
                  </p>
                )}
              </div>

              {!editingMenuItem && (
                <div>
                  <label className="block text-sm mb-1 text-gray-700">
                    منوی والد (اختیاری)
                  </label>
                  <select
                    value={menuParentId}
                    onChange={(e) => setMenuParentId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">بدون والد (منوی اصلی)</option>
                    {allMenuItemsFlat.map((item) => (
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

      {/* مودال تأیید لوگو */}
      {showLogoModal && tempFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCancelLogo}
          />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
            <h3 className="text-lg font-bold mb-4">تأیید لوگو</h3>
            <div className="mb-4 flex justify-center">
              <img
                src={URL.createObjectURL(tempFile)}
                alt="Preview"
                className="max-w-full max-h-60 object-contain rounded-lg border"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancelLogo}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                disabled={logoUploading}
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmLogo}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={logoUploading}
              >
                {logoUploading ? "در حال آپلود..." : "تأیید و آپلود"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
