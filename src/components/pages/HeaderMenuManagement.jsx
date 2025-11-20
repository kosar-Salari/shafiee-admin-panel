// src/components/pages/HeaderMenuManagement.jsx
import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Menu,
  Link2,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import useFileUpload from "../../hooks/useFileUpload";
import { updateSettings, getSettings } from "../../services/settingsService";

const SPECIAL_TARGETS = [
  { value: "__HOME__", label: "صفحه اصلی", path: "/" },
  { value: "__NEWS_ROOT__", label: "صفحه اخبار", path: "/news" },
  { value: "__ARTICLES_ROOT__", label: "صفحه مقالات", path: "/articles" },
];




// تابع کمکی: تبدیل مقدار ذخیره‌شده به آدرس قابل نمایش
function getDisplayPathFromSlug(slug) {
  if (!slug) return "";

  // گزینه‌های ثابت
  const special = SPECIAL_TARGETS.find((s) => s.value === slug);
  if (special) return special.path;

  // اگر خود slug از قبل با / شروع شده
  if (slug.startsWith("/")) return slug;

  // در غیر این صورت، یک / اولش اضافه می‌کنیم
  return `/${slug}`;
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

  return (
    <div className="mb-2">
      <div
        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
        style={{ marginRight: `${level * 24}px` }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {/* دکمه‌های جابه‌جایی */}
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

            {/* باز/بسته کردن زیرمنو */}
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
              </div>

              {item.pageSlug && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Link2 className="w-3 h-3" />
                  <span dir="ltr">{getDisplayPathFromSlug(item.pageSlug)}</span>
                </div>
              )}
            </div>
          </div>

          {/* اکشن‌ها */}
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

      {/* رندر بچه‌ها */}
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
}) {
  // ====== Logo upload via backend (S3) ======
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [tempFile, setTempFile] = useState(null);
  const { doUpload, uploading, progress, error } = useFileUpload("logos");

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

  const handleConfirmLogo = async () => {
    try {
      if (!tempFile) return;

      // 1. آپلود فایل به S3
      const url = await doUpload(tempFile, "logos");

      // 2. گرفتن settings فعلی از بک‌اند
      const currentSettings = await getSettings();

      // 3. ارسال کل settings با logo جدید
      await updateSettings({
        ...currentSettings,
        logo: url
      });

      // 4. آپدیت state و بستن modal
      setLogo(url);
      setShowLogoModal(false);
      setTempFile(null);

      // 5. نمایش پیام موفقیت
      alert("لوگو با موفقیت ذخیره و آپلود شد ✅");

    } catch (e) {
      console.error("خطا در ذخیره لوگو:", e);
      alert("خطا در ذخیره لوگو");
      // Modal رو نبند تا کاربر بتونه دوباره تلاش کنه
    }
  };
  const handleCancelLogo = () => {
    setShowLogoModal(false);
    setTempFile(null);
  };

  const handleRemoveLogo = async () => {
    const ok = confirm("لوگو حذف شود؟");
    if (!ok) return;

    try {
      // گرفتن settings فعلی
      const currentSettings = await getSettings();

      // ارسال با logo خالی
      await updateSettings({
        ...currentSettings,
        logo: ""
      });

      // آپدیت state
      setLogo("");
      alert("لوگو با موفقیت حذف شد ✅");
    } catch (e) {
      console.error("خطا در حذف لوگو:", e);
      alert("خطا در حذف لوگو");
    }
  };

  // ====== Menu tree ops ======
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuLabel, setMenuLabel] = useState("");
  const [menuPageSlug, setMenuPageSlug] = useState("");
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

  const handleToggleMenuItem = (itemId) => {
    const updateInTree = (items) =>
      items.map((item) => {
        if (item.id === itemId) return { ...item };
        if (item.children)
          return { ...item, children: updateInTree(item.children) };
        return item;
      });

    setMenuItems((prev) => updateInTree([...prev]));
  };

  const handleEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setMenuLabel(item.label);
    setMenuPageSlug(item.pageSlug);
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
    if (!menuPageSlug) return alert("صفحه مورد نظر را انتخاب کنید");

    const nextTopOrder = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return 1;
      return Math.max(...arr.map((x) => Number(x.order || 0))) + 1;
    };

    const newItem = {
      id: editingMenuItem?.id || `m-${Date.now()}`,
      label: menuLabel.trim(),
      pageSlug: menuPageSlug, // اینجا هرچی انتخاب شده همان ذخیره می‌شود
      order: editingMenuItem
        ? editingMenuItem.order || 1
        : menuParentId
          ? 1
          : nextTopOrder(menuItems),
      children: editingMenuItem?.children || [],
    };

    if (editingMenuItem) {
      // ویرایش
      const updateInTree = (items) =>
        items.map((item) => {
          if (item.id === editingMenuItem.id) return newItem;
          if (item.children)
            return { ...item, children: updateInTree(item.children) };
          return item;
        });

      let updated = updateInTree([...menuItems]);

      if (menuParentId) {
        // اگر ویرایش هم‌زمان والد را عوض کرده‌ایم:
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
      // آیتم جدید
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
      {/* بخش مدیریت لوگو */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-700">لوگوی هدر</h2>
        </div>

        <div className="flex items-start gap-6">
          {/* Preview */}
          <div className="flex-shrink-0">
            {logo ? (
              <div className="relative group">
                <div className="w-40 h-40 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                  {/* eslint-disable-next-line */}
                  <img
                    src={logo}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
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
              <div className="w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span className="text-sm">بدون لوگو</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
              <span>{logo ? "تغییر لوگو" : "آپلود لوگو"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoPick}
                className="hidden"
              />
            </label>

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
                سایز پیشنهادی: 200x60 پیکسل
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal آپلود/تأیید لوگو */}
      {showLogoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCancelLogo}
          />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              آپلود لوگو
            </h3>

            <div className="bg-gray-50 rounded-xl p-6 mb-5 border-2 border-gray-200">
              {tempFile ? (
                <div className="text-sm">
                  <div className="mb-2 font-medium">فایل انتخاب‌شده:</div>
                  <div className="text-gray-700">
                    {tempFile.name} ({Math.round(tempFile.size / 1024)} KB)
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">فایلی انتخاب نشده</div>
              )}
              {uploading && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-indigo-600 rounded"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {progress}%
                  </div>
                </div>
              )}
              {error && (
                <div className="text-red-600 mt-3 text-sm">{error}</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancelLogo}
                className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmLogo}
                disabled={!tempFile || uploading}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium shadow-sm disabled:opacity-60"
              >
                {uploading ? "در حال آپلود…" : "آپلود و ثبت"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مدیریت آیتم‌های منو */}
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

      {/* Modal افزودن/ویرایش آیتم منو */}
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
                  {/* Placeholder واقعی که در لیست دیده نمی‌شود */}
                  {!menuPageSlug && (
                    <option value="" hidden>
                      انتخاب کنید
                    </option>
                  )}

                  {/* ابتدا ۳ مقصد ثابت */}
                  {SPECIAL_TARGETS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} ({s.path})
                    </option>
                  ))}

                  {/* سپس صفحات داینامیک */}
                  {pages.map((page) => (
                    <option key={page.id} value={page.slug}>
                      {page.title} ({getDisplayPathFromSlug(page.slug)})
                    </option>
                  ))}
                </select>


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
    </>
  );
}
