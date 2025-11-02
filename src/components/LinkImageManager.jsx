import React, { useState } from 'react';
import { Upload, Plus, Trash2, Save, GripVertical } from 'lucide-react';

const LinkedImagesSettings = () => {
  const [linkedImages, setLinkedImages] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  const addLinkedImage = () => {
    setLinkedImages(prev => [...prev, { 
      id: Date.now(), 
      image: null, 
      link: '/' 
    }]);
  };

  const handleImageUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set max dimensions while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedImage = canvas.toDataURL('image/jpeg', 0.85);
        
        setLinkedImages(items =>
          items.map(item => item.id === id ? { ...item, image: compressedImage } : item)
        );
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const updateLink = (id, value) => {
    setLinkedImages(items =>
      items.map(item => item.id === id ? { ...item, link: value } : item)
    );
  };

  const deleteImage = (id) => {
    setLinkedImages(items => items.filter(item => item.id !== id));
  };

  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    const draggedIndex = linkedImages.findIndex(item => item.id === draggedItem.id);
    const targetIndex = linkedImages.findIndex(item => item.id === targetItem.id);
    
    const newItems = [...linkedImages];
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    setLinkedImages(newItems);
    setDraggedItem(null);
  };

  const saveChanges = () => {
    console.log('ذخیره عکس‌های لینک‌دار:', linkedImages);
    alert('عکس‌های لینک‌دار ذخیره شدند! ✅');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          عکس‌های لینک‌دار
        </h2>
        <button
          onClick={addLinkedImage}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          افزودن عکس
        </button>
      </div>

      {linkedImages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">هنوز عکسی اضافه نشده است</p>
          <p className="text-sm mt-2">برای شروع روی دکمه "افزودن عکس" کلیک کنید</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {linkedImages.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item)}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-move"
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing mt-2">
                    <GripVertical size={24} className="text-gray-400" />
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* Image Preview */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt="عکس لینک‌دار" 
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="h-48 flex items-center justify-center bg-gray-50">
                          <span className="text-gray-400">بدون عکس</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors">
                      <Upload size={20} className="text-gray-500" />
                      <span className="text-sm">{item.image ? 'تغییر عکس' : 'آپلود عکس'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(item.id, e)} 
                        className="hidden" 
                      />
                    </label>

                    {/* Link Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">لینک</label>
                      <input
                        type="text"
                        value={item.link}
                        onChange={(e) => updateLink(item.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="/example"
                      />
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteImage(item.id)}
                      className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveChanges}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={20} />
              ذخیره تغییرات
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LinkedImagesSettings;