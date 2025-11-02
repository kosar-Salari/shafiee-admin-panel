// src/pages/Articles.jsx
import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronLeft, Search, Calendar, FolderTree, Edit2, Trash2, Eye } from 'lucide-react';

export default function Articles() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', parentId: null });
  
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articleForm, setArticleForm] = useState({ title: '', slug: '', categoryId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const categoriesResult = await window.storage.get('article-categories');
      const articlesResult = await window.storage.get('article-items');
      
      if (categoriesResult) {
        setCategories(JSON.parse(categoriesResult.value));
      }
      if (articlesResult) {
        setArticles(JSON.parse(articlesResult.value));
      }
    } catch (error) {
      console.log('No data found, starting fresh');
    }
  };

  const saveData = async (newCategories, newArticles) => {
    try {
      await window.storage.set('article-categories', JSON.stringify(newCategories || categories));
      await window.storage.set('article-items', JSON.stringify(newArticles || articles));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const category = {
      id: Date.now().toString(),
      name: newCategory.name,
      parentId: newCategory.parentId,
      children: []
    };
    
    const updatedCategories = [...categories];
    
    if (category.parentId) {
      const addToParent = (cats) => {
        for (let cat of cats) {
          if (cat.id === category.parentId) {
            cat.children.push(category);
            return true;
          }
          if (cat.children.length > 0 && addToParent(cat.children)) {
            return true;
          }
        }
        return false;
      };
      addToParent(updatedCategories);
    } else {
      updatedCategories.push(category);
    }
    
    setCategories(updatedCategories);
    saveData(updatedCategories, articles);
    setNewCategory({ name: '', parentId: null });
    setShowCategoryModal(false);
  };

  const deleteCategory = (categoryId) => {
    const removeCategory = (cats) => {
      return cats.filter(cat => {
        if (cat.id === categoryId) return false;
        if (cat.children.length > 0) {
          cat.children = removeCategory(cat.children);
        }
        return true;
      });
    };
    
    const updatedCategories = removeCategory([...categories]);
    setCategories(updatedCategories);
    saveData(updatedCategories, articles);
  };

  const startCreateArticle = () => {
    setShowArticleModal(true);
    setArticleForm({ title: '', slug: '', categoryId: '' });
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
    saveData(categories, updatedArticles);
    
    setShowArticleModal(false);
    window.location.href = `/builder?articleId=${articleItem.id}&category=${selectedCategory}&title=${articleForm.title}&slug=${articleForm.slug}`;
  };

  const deleteArticle = (articleId) => {
    const updatedArticles = articles.filter(a => a.id !== articleId);
    setArticles(updatedArticles);
    saveData(categories, updatedArticles);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getCategoryPath = (categoryId) => {
    const findPath = (cats, id, currentPath = []) => {
      for (let cat of cats) {
        if (cat.id === id) {
          return [...currentPath, cat.name];
        }
        if (cat.children.length > 0) {
          const found = findPath(cat.children, id, [...currentPath, cat.name]);
          if (found) return found;
        }
      }
      return null;
    };
    return findPath(categories, categoryId) || [];
  };

  const renderCategoryTree = (cats, level = 0, selectable = false, onSelect = null) => {
    return cats.map(cat => (
      <div key={cat.id} style={{ marginRight: `${level * 20}px` }}>
        <div className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded ${selectable ? 'cursor-pointer' : ''}`}
             onClick={() => selectable && onSelect && onSelect(cat.id)}>
          <div className="flex items-center gap-2 flex-1">
            {cat.children.length > 0 && (
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
                className="text-green-600 hover:text-green-700"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        {cat.children.length > 0 && expandedCategories[cat.id] && 
          renderCategoryTree(cat.children, level + 1, selectable, onSelect)}
      </div>
    ));
  };

  const filteredArticles = articles.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.categoryId === filterCategory;
    const matchesDate = !filterDate || item.date.startsWith(filterDate);
    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">مدیریت مقالات</h1>
          
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              لیست مقالات
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'categories' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              مدیریت دسته‌بندی
            </button>
            <button
              onClick={startCreateArticle}
              className="mr-auto px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              ایجاد مقاله جدید
            </button>
          </div>
        </div>

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">دسته‌بندی‌ها</h2>
              <button
                onClick={() => { setNewCategory({ name: '', parentId: null }); setShowCategoryModal(true); }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Plus size={18} />
                دسته جدید
              </button>
            </div>
            
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">هنوز دسته‌بندی ایجاد نشده است</p>
              ) : (
                renderCategoryTree(categories)
              )}
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="جستجو در عناوین..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={filterDate}
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
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => window.open(`/articles/${item.slug}`, '_blank')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => deleteArticle(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">
                {newCategory.parentId ? 'افزودن زیردسته' : 'ایجاد دسته جدید'}
              </h3>
              
              <input
                type="text"
                placeholder="نام دسته‌بندی"
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
                <button
                  onClick={addCategory}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  ایجاد
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}

        {showArticleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">ایجاد مقاله جدید</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان مقاله</label>
                  <input
                    type="text"
                    placeholder="عنوان مقاله را وارد کنید"
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
                      type="text"
                      placeholder="article-slug"
                      value={articleForm.slug}
                      onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">انتخاب دسته‌بندی</label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-gray-500 text-center">ابتدا یک دسته‌بندی ایجاد کنید</p>
                    ) : (
                      renderCategoryTree(categories, 0, true, setSelectedCategory)
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmArticleCategory}
                  disabled={!articleForm.title || !articleForm.slug || !selectedCategory}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
}