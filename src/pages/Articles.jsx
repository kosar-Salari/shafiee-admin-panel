// src/pages/Articles.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, ChevronDown, ChevronLeft, Search, Calendar,
  FolderTree, Edit2, Trash2, Eye, CheckCircle2, AlertTriangle
} from 'lucide-react';

import {
  fetchArticleCategories,
  createArticleCategory,
  deleteArticleCategory as apiDeleteCategory,
} from '../services/articleCategoriesService';

import {
  buildTree, getPath as getPathFromTree, getPathMap,
} from '../utils/categoryTree';

export default function Articles() {
  // --- دسته‌بندی‌ها
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [categoriesFlat, setCategoriesFlat] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  // --- مقالات (فعلاً local)
  const [articles, setArticles] = useState([]);

  // --- تب‌ها و فیلترها
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // --- مودال‌ها و فرم‌ها
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', parentId: null });

  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articleForm, setArticleForm] = useState({ title: '', slug: '', categoryId: '' });

  // --- وضعیت بارگذاری/خطا
  const [loadingCats, setLoadingCats] = useState(true);
  const [errorCats, setErrorCats] = useState('');

  // --- مدال نتیجه
  const [resultModal, setResultModal] = useState({
    open: false, type: 'success', title: '', message: '',
  });

  // --- مدال تأیید حذف (همیشه قبل از حذف)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  useEffect(() => { loadInitial(); }, []);

  async function refreshCats() {
    setLoadingCats(true);
    setErrorCats('');
    try {
      const flat = await fetchArticleCategories();
      setCategoriesFlat(flat);
      setCategoriesTree(buildTree(flat));
    } catch (e) {
      console.error(e);
      setErrorCats('خطا در دریافت دسته‌بندی‌ها');
    } finally {
      setLoadingCats(false);
    }
  }

  async function loadInitial() {
    await refreshCats();
    try {
      const articlesResult = await window.storage.get('article-items');
      if (articlesResult) setArticles(JSON.parse(articlesResult.value));
    } catch {}
  }

  const saveArticles = async (newArticles) => {
    try {
      await window.storage.set('article-items', JSON.stringify(newArticles || articles));
    } catch (error) {
      console.error('Error saving articles:', error);
    }
  };

  const pathMap = useMemo(() => getPathMap(categoriesTree, ' / '), [categoriesTree]);

  // --- ایجاد دسته (بدون optimistic) → بعدش ری‌فچ
  const addCategory = async () => {
    const name = newCategory.name.trim();
    if (!name) return;

    let payload;
    if (newCategory.parentId != null && newCategory.parentId !== '') {
      const parentNum = Number(newCategory.parentId);
      if (!Number.isFinite(parentNum)) {
        setResultModal({
          open: true, type: 'error', title: 'خطای اعتبارسنجی',
          message: 'شناسهٔ والد معتبر نیست.',
        });
        return;
      }
      payload = { name, parentId: parentNum };
    } else {
      payload = { name }; // ریشه
    }

    try {
      await createArticleCategory(payload);
      await refreshCats(); // id واقعی را از سرور بگیر
      setNewCategory({ name: '', parentId: null });
      setShowCategoryModal(false);
      setResultModal({
        open: true, type: 'success', title: 'دسته‌بندی ایجاد شد',
        message: `«${name}» با موفقیت اضافه شد.`,
      });
    } catch (e) {
      console.error(e);
      const apiErrors = e?.response?.data?.errors;
      const serverMsg = e?.response?.data?.message || e?.response?.data?.error;
      const msg = Array.isArray(apiErrors) && apiErrors.length
        ? apiErrors.map(x => `${x.path}: ${x.msg}`).join(' | ')
        : (serverMsg || 'ایجاد دسته‌بندی ناموفق بود.');
      setResultModal({ open: true, type: 'error', title: 'خطا در ایجاد', message: msg });
    }
  };

  // --- باز کردن مدال تأیید حذف (همیشه)
  const handleAskDelete = (categoryId) => {
    setConfirmDelete({ open: true, id: categoryId });
  };

  // --- اجرای حذف بعد از تأیید
  const performDelete = async (categoryId) => {
    const catName = categoriesFlat.find(c => String(c.id) === String(categoryId))?.name ?? 'دسته';
    try {
      await apiDeleteCategory(categoryId);
      await refreshCats();
      setFilterCategory(prev => (String(prev) === String(categoryId) ? '' : prev));
      setResultModal({
        open: true, type: 'success', title: 'دسته‌بندی حذف شد',
        message: `«${catName}» با موفقیت حذف شد.`,
      });
    } catch (e) {
      console.error(e);
      const apiErrors = e?.response?.data?.errors;
      const serverMsg = e?.response?.data?.message || e?.response?.data?.error;
      const msg = Array.isArray(apiErrors) && apiErrors.length
        ? apiErrors.map(x => `${x.path}: ${x.msg}`).join(' | ')
        : (serverMsg || 'حذف دسته‌بندی ناموفق بود.');
      setResultModal({ open: true, type: 'error', title: 'خطا در حذف', message: msg });
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const getCategoryPath = (categoryId) => getPathFromTree(categoriesTree, categoryId) || [];

  const renderCategoryTree = (cats, level = 0, selectable = false, onSelect = null) =>
    cats.map(cat => (
      <div key={cat.id} style={{ marginRight: `${level * 20}px` }}>
        <div
          className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${selectable ? 'cursor-pointer' : ''}`}
          onClick={() => selectable && onSelect && onSelect(cat.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {cat.children?.length > 0 && (
              <button onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id); }}>
                {expandedCategories[cat.id] ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
            <FolderTree size={16} className="text-purple-600" />
            <span className="font-medium">{cat.name}</span>
            {selectable && selectedCategory === cat.id && (
              <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">انتخاب شده</span>
            )}
          </div>
          {!selectable && (
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setNewCategory({ name: '', parentId: cat.id }); setShowCategoryModal(true); }}
                className="text-green-600 hover:text-green-700" title="زیردسته"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAskDelete(cat.id); }}
                className="text-red-600 hover:text-red-700" title="حذف"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        {cat.children?.length > 0 && expandedCategories[cat.id] &&
          renderCategoryTree(cat.children, level + 1, selectable, onSelect)}
      </div>
    ));

  const startCreateArticle = () => {
    setShowArticleModal(true);
    setArticleForm({ title: '', slug: '', categoryId: '' });
    setSelectedCategory('');
  };

  const confirmArticleCategory = () => {
    if (!articleForm.title || !articleForm.slug || !selectedCategory) return;
    const articleItem = {
      id: Date.now().toString(),
      title: articleForm.title,
      slug: articleForm.slug,
      categoryId: selectedCategory,
      date: new Date().toISOString()
    };
    const updatedArticles = [...articles, articleItem];
    setArticles(updatedArticles);
    saveArticles(updatedArticles);
    setShowArticleModal(false);
    window.location.href =
      `/builder?articleId=${articleItem.id}&category=${selectedCategory}&title=${articleForm.title}&slug=${articleForm.slug}`;
  };

  const deleteArticle = (articleId) => {
    const updatedArticles = articles.filter(a => a.id !== articleId);
    setArticles(updatedArticles);
    saveArticles(updatedArticles);
  };

  const filteredArticles = articles.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || String(item.categoryId) === String(filterCategory);
    const matchesDate = !filterDate || item.date.startsWith(filterDate);
    return matchesSearch && matchesCategory && matchesDate;
  });

  // گزینه‌های فیلتر با مسیر کامل
  const filterOptions = useMemo(() => {
    const options = categoriesFlat.map(cat => ({
      id: String(cat.id),
      label: pathMap[String(cat.id)] || cat.name,
    }));
    options.sort((a, b) => a.label.localeCompare(b.label, 'fa'));
    return options;
  }, [categoriesFlat, pathMap]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-lahzeh" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">مدیریت مقالات</h1>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >لیست مقالات</button>
            <button onClick={() => setActiveTab('categories')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'categories' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >مدیریت دسته‌بندی</button>
            <button onClick={startCreateArticle}
              className="mr-auto px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2">
              <Plus size={20} />ایجاد مقاله جدید
            </button>
          </div>
        </div>

        {/* Categories */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">دسته‌بندی‌ها</h2>
              <button
                onClick={() => { setNewCategory({ name: '', parentId: null }); setShowCategoryModal(true); }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Plus size={18} /> دسته جدید
              </button>
            </div>

            {loadingCats ? (
              <p className="text-gray-500">در حال دریافت دسته‌بندی‌ها…</p>
            ) : errorCats ? (
              <p className="text-red-600">{errorCats}</p>
            ) : (
              <div className="space-y-2">
                {categoriesTree.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">هنوز دسته‌بندی ایجاد نشده است</p>
                ) : (
                  renderCategoryTree(categoriesTree)
                )}
              </div>
            )}
          </div>
        )}

        {/* List */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                <input
                  type="text" placeholder="جستجو در عناوین..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                title="فیلتر بر اساس دسته‌بندی"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {filterOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>

              <input
                type="date" value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">مقاله‌ای یافت نشد</p>
              ) : (
                filteredArticles.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FolderTree size={16} />
                            {getCategoryPath(item.categoryId).join(' / ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {new Date(item.date).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">آدرس: /articles/{item.slug}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => window.location.href = `/builder?articleId=${item.id}`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="ویرایش در صفحه‌ساز"
                        ><Edit2 size={18} /></button>
                        <button
                          onClick={() => window.open(`/articles/${item.slug}`, '_blank')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="نمایش"
                        ><Eye size={18} /></button>
                        <button
                          onClick={() => deleteArticle(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="حذف"
                        ><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal: Create Category */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">
                {newCategory.parentId ? 'افزودن زیردسته' : 'ایجاد دسته جدید'}
              </h3>

              <input
                type="text" placeholder="نام دسته‌بندی"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              {newCategory.parentId && (
                <p className="text-sm text-gray-600 mb-4">
                  زیردسته از: {getCategoryPath(newCategory.parentId).join(' / ')}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={addCategory}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  ایجاد
                </button>
                <button onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Article */}
        {showArticleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">ایجاد مقاله جدید</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان مقاله</label>
                  <input
                    type="text" placeholder="عنوان مقاله را وارد کنید"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">آدرس (Slug)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">/articles/</span>
                    <input
                      type="text" placeholder="article-slug"
                      value={articleForm.slug}
                      onChange={(e) => setArticleForm({
                        ...articleForm, slug: e.target.value.replace(/\s+/g, '-').toLowerCase()
                      })}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">انتخاب دسته‌بندی</label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {categoriesTree.length === 0 ? (
                      <p className="text-gray-500 text-center">ابتدا یک دسته‌بندی ایجاد کنید</p>
                    ) : (
                      renderCategoryTree(categoriesTree, 0, true, setSelectedCategory)
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmArticleCategory}
                  disabled={!articleForm.title || !articleForm.slug || !selectedCategory}
                  className="flex-1 px-4 py-3 bg绿色-600 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  ادامه به صفحه‌ساز
                </button>
                <button
                  onClick={() => setShowArticleModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Result */}
        {resultModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-start gap-3">
                {resultModal.type === 'success'
                  ? <CheckCircle2 className="text-green-600 shrink-0" size={28} />
                  : <AlertTriangle className="text-red-600 shrink-0" size={28} />
                }
                <div>
                  <h4 className="text-lg font-bold mb-1">{resultModal.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{resultModal.message}</p>
                </div>
              </div>
              <div className="mt-6 text-left">
                <button
                  onClick={() => setResultModal(m => ({ ...m, open: false }))}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                >
                  باشه
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal (همیشه قبل از حذف) */}
        {confirmDelete.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
              <p className="text-lg font-bold mb-4">آیا از حذف این دسته مطمئن هستید؟</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setConfirmDelete({ open: false, id: null }); }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  خیر
                </button>
                <button
                  onClick={() => {
                    const id = confirmDelete.id;
                    setConfirmDelete({ open: false, id: null });
                    performDelete(id);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  بله
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
