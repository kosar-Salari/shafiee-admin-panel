import React, { useState } from 'react';
import { Upload, Plus, Trash2, GripVertical } from 'lucide-react';

const AdminMainPage = () => {
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerSideCards, setBannerSideCards] = useState([
    { id: 'side-left', position: 'left', image: null, link: '/' },
    { id: 'side-right', position: 'right', image: null, link: '/' }
  ]);
  const [linkCards, setLinkCards] = useState([
    { id: 1, image: null, link: '/middle-school' },
    { id: 2, image: null, link: '/elementary' },
    { id: 3, image: null, link: '/virtual-tour' },
    { id: 4, image: null, link: '/achievements' },
  ]);
  const [draggedCard, setDraggedCard] = useState(null);

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBannerImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerSideCardUpload = (cardId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerSideCards(cards => cards.map(card => 
          card.id === cardId ? { ...card, image: e.target.result } : card
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBannerSideCard = (cardId, field, value) => {
    setBannerSideCards(cards => cards.map(card => 
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const removeBannerSideCard = (cardId) => {
    setBannerSideCards(cards => cards.map(card => 
      card.id === cardId ? { ...card, image: null, link: '/' } : card
    ));
  };

  const handleCardImageUpload = (cardId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLinkCards(cards => cards.map(card => 
          card.id === cardId ? { ...card, image: e.target.result } : card
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewCard = () => {
    const newCard = {
      id: Date.now(),
      image: null,
      link: '/'
    };
    setLinkCards([...linkCards, newCard]);
  };

  const deleteCard = (cardId) => {
    setLinkCards(cards => cards.filter(card => card.id !== cardId));
  };

  const updateCard = (cardId, field, value) => {
    setLinkCards(cards => cards.map(card => 
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetCard) => {
    e.preventDefault();
    if (!draggedCard || draggedCard.id === targetCard.id) return;

    const draggedIndex = linkCards.findIndex(c => c.id === draggedCard.id);
    const targetIndex = linkCards.findIndex(c => c.id === targetCard.id);

    const newCards = [...linkCards];
    newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, draggedCard);

    setLinkCards(newCards);
    setDraggedCard(null);
  };

  const saveChanges = () => {
    const data = { bannerImage, bannerSideCards, linkCards };
    console.log('ذخیره تغییرات:', data);
    alert('تغییرات با موفقیت ذخیره شد! ✅');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">مدیریت صفحه اصلی</h1>
            <button
              onClick={saveChanges}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ذخیره تغییرات
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Section with Side Cards */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            بنر اصلی و عکس‌های کناری
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Right Side Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-3 text-center">عکس سمت راست (اختیاری)</h3>
              {bannerSideCards[1].image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={bannerSideCards[1].image} 
                      alt="کارت کناری راست" 
                      className="w-full h-64 object-cover rounded-lg" 
                    />
                    <button
                      onClick={() => removeBannerSideCard('side-right')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">لینک</label>
                    <input
                      type="text"
                      value={bannerSideCards[1].link}
                      onChange={(e) => updateBannerSideCard('side-right', 'link', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="/example"
                    />
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 text-sm text-center">کلیک کنید برای آپلود</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerSideCardUpload('side-right', e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Center Banner */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-3 text-center">بنر اصلی (وسط)</h3>
              {bannerImage ? (
                <div className="relative">
                  <img src={bannerImage} alt="بنر" className="w-full h-64 object-cover rounded-lg" />
                  <button
                    onClick={() => setBannerImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload size={48} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 text-center">کلیک کنید و عکس بنر را آپلود کنید</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Left Side Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-bold mb-3 text-center">عکس سمت چپ (اختیاری)</h3>
              {bannerSideCards[0].image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={bannerSideCards[0].image} 
                      alt="کارت کناری چپ" 
                      className="w-full h-64 object-cover rounded-lg" 
                    />
                    <button
                      onClick={() => removeBannerSideCard('side-left')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">لینک</label>
                    <input
                      type="text"
                      value={bannerSideCards[0].link}
                      onChange={(e) => updateBannerSideCard('side-left', 'link', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="/example"
                    />
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer h-64 hover:bg-gray-50 rounded-lg">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-gray-600 text-sm text-center">کلیک کنید برای آپلود</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerSideCardUpload('side-left', e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Link Cards Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              عکس‌های لینک‌دار (بالا و پایین بنر)
            </h2>
            <button
              onClick={addNewCard}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={20} />
              افزودن عکس جدید
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {linkCards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => handleDragStart(e, card)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, card)}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-move"
              >
                <div className="flex items-start gap-3">
                  <div className="cursor-grab active:cursor-grabbing mt-2">
                    <GripVertical size={24} className="text-gray-400" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* Image Preview */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      {card.image ? (
                        <img 
                          src={card.image} 
                          alt="کارت" 
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="h-48 flex items-center justify-center bg-gray-50">
                          <span className="text-gray-400">بدون عکس</span>
                        </div>
                      )}
                    </div>

                    {/* Upload & Link Controls */}
                    <div className="space-y-3">
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{card.image ? 'تغییر عکس' : 'آپلود عکس'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCardImageUpload(card.id, e)}
                          className="hidden"
                        />
                      </label>

                      <div>
                        <label className="block text-sm font-medium mb-1">لینک</label>
                        <input
                          type="text"
                          value={card.link}
                          onChange={(e) => updateCard(card.id, 'link', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="/example"
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">پیش‌نمایش صفحه اصلی</h2>
          <div className="border-2 rounded-lg p-4 bg-gray-50">
            {/* Top Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {linkCards.slice(0, 2).map(card => (
                <div key={card.id} className="rounded-lg overflow-hidden border-2 border-gray-300">
                  {card.image ? (
                    <img src={card.image} alt="کارت" className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">بدون عکس</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Banner Row with Side Cards */}
            <div className="grid grid-cols-12 gap-4 my-4">
              {/* Right Side Card */}
              {bannerSideCards[1].image && (
                <div className="col-span-2 rounded-lg overflow-hidden border-2 border-gray-300">
                  <img src={bannerSideCards[1].image} alt="کناری راست" className="w-full h-64 object-cover" />
                </div>
              )}
              
              {/* Center Banner */}
              <div className={`${bannerSideCards[0].image && bannerSideCards[1].image ? 'col-span-8' : bannerSideCards[0].image || bannerSideCards[1].image ? 'col-span-10' : 'col-span-12'} rounded-lg overflow-hidden`}>
                {bannerImage ? (
                  <img src={bannerImage} alt="بنر" className="w-full h-64 object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded-lg">
                    <span className="text-gray-500">بنر اصلی</span>
                  </div>
                )}
              </div>

              {/* Left Side Card */}
              {bannerSideCards[0].image && (
                <div className="col-span-2 rounded-lg overflow-hidden border-2 border-gray-300">
                  <img src={bannerSideCards[0].image} alt="کناری چپ" className="w-full h-64 object-cover" />
                </div>
              )}
            </div>

            {/* Bottom Rows */}
            <div className="grid grid-cols-2 gap-4">
              {linkCards.slice(2, 6).map(card => (
                <div key={card.id} className="rounded-lg overflow-hidden border-2 border-gray-300">
                  {card.image ? (
                    <img src={card.image} alt="کارت" className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">بدون عکس</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMainPage;