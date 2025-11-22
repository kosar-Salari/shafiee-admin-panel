// src/pageBuilder/components/MediaModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Link as LinkIcon,
  FileVideo,
  FileAudio,
  FileText,
} from 'lucide-react';
import { uploadFileToS3 } from '../../services/filesService';

const TYPE_LABELS = {
  video: { icon: FileVideo, label: 'ویدیو' },
  audio: { icon: FileAudio, label: 'صوت' },
  file: { icon: FileText, label: 'فایل' },
};

export default function MediaModal({ open, onClose, onSave, initialData = {} }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [type, setType] = useState(initialData.type || 'video');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // ✅ درصد آپلود
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMode('upload');
      setType(initialData.type || 'video');
      setFile(null);
      setUrl('');
      setUploading(false);
      setUploadProgress(0);
      setError('');
    }
  }, [open, initialData.type]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🟣 حالت آپلود فایل
    if (mode === 'upload') {
      if (!file) {
        setError('لطفاً یک فایل انتخاب کنید');
        return;
      }

      try {
        setUploading(true);
        setUploadProgress(0);

        const uploadedUrl = await uploadFileToS3(file, (percent) => {
          // این کال‌بک از onUploadProgress تو filesService می‌آد
          setUploadProgress(percent);
        });

        onSave({
          type,
          url: uploadedUrl,
          fileName: file.name,
          fileSize: file.size,
          source: 'upload',
        });
      } catch (err) {
        console.error('❌ خطا در آپلود مدیا:', err);
        if (err.code === 'ECONNABORTED') {
          setError('زمان آپلود به پایان رسید. لطفاً دوباره تلاش کنید یا فایل را کوچک‌تر کنید.');
        } else {
          setError('خطا در آپلود فایل. لطفاً دوباره تلاش کنید.');
        }
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
      return;
    }

    // 🔵 حالت URL آماده
    if (mode === 'url') {
      if (!url.trim()) {
        setError('لطفاً آدرس فایل را وارد کنید');
        return;
      }

      onSave({
        type,
        url: url.trim(),
        source: 'url',
      });
    }
  };

  const typeConfig = TYPE_LABELS[type] || TYPE_LABELS.video;
  const TypeIcon = typeConfig.icon;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      dir="rtl"
      onClick={uploading ? undefined : onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div className="sticky top-0 bg-gradient-to-l from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <TypeIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">افزودن {typeConfig.label}</h2>
              <p className="text-sm text-white/80">
                فایل را آپلود کنید یا آدرس آماده وارد کنید
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg سفید/20 transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* انتخاب روش */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'upload'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={uploading}
            >
              <UploadCloud size={18} />
              آپلود فایل
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'url'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={uploading}
            >
              <LinkIcon size={18} />
              آدرس آماده (URL)
            </button>
          </div>

          {/* محتوای تب‌ها */}
          {mode === 'upload' ? (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">
                فایل {typeConfig.label} را انتخاب کنید
              </label>

              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-2xl py-8 px-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UploadCloud className="text-indigo-600" size={24} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-gray-800">
                    کلیک کنید و فایل را انتخاب کنید
                  </p>
                  <p className="text-xs text-gray-500">
                    فرمت‌های رایج پشتیبانی می‌شوند
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                  accept={
                    type === 'video'
                      ? 'video/*'
                      : type === 'audio'
                      ? 'audio/*'
                      : '*/*'
                  }
                />
              </label>

              {file && (
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold truncate max-w-[260px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={uploading}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                آدرس (URL) {typeConfig.label}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                dir="ltr"
                placeholder="https://example.com/media.mp4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-left text-sm"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">
                اگر فایل را در جای دیگری آپلود کرده‌اید، می‌توانید URL مستقیم آن را اینجا وارد کنید.
              </p>
            </div>
          )}

          {/* 📊 وضعیت آپلود */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>در حال آپلود فایل...</span>
                <span>%{uploadProgress}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* خطا */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-l from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              {uploading ? 'در حال آپلود...' : '✅ درج در صفحه'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
