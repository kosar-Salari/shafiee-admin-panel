// src/pageBuilder/components/MediaModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Link as LinkIcon,
  FileVideo,
  FileAudio,
  FileText,
  Image as ImageIcon,
  Monitor,
} from 'lucide-react';
import { uploadFileToS3 } from '../../services/filesService';

const TYPE_LABELS = {
  image: { icon: ImageIcon, label: 'تصویر' },
  video: { icon: FileVideo, label: 'ویدیو' },
  audio: { icon: FileAudio, label: 'صوت' },
  file:  { icon: FileText,  label: 'فایل' },
  iframe: { icon: Monitor, label: 'آیفریم / Embed' }, // 🆕
};

export default function MediaModal({ open, onClose, onSave, initialData = {} }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [type, setType] = useState(initialData.type || 'video');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      const initialType = initialData.type || 'video';
      setType(initialType);
      // 🆕 آیفریم فقط از طریق URL
      setMode(initialType === 'iframe' ? 'url' : 'upload');
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
          setError(
            'زمان آپلود به پایان رسید. لطفاً دوباره تلاش کنید یا فایل را کوچک‌تر کنید.'
          );
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

  const typeConfig = TYPE_LABELS[type] || TYPE_LABELS.image;
  const TypeIcon = typeConfig.icon;

  const urlPlaceholder =
    type === 'video'
      ? 'https://example.com/video.mp4'
      : type === 'audio'
      ? 'https://example.com/audio.mp3'
      : type === 'image'
      ? 'https://example.com/image.jpg'
      : type === 'file'
      ? 'https://example.com/file.pdf'
      : type === 'iframe'
      ? 'https://www.youtube.com/embed/VIDEO_ID'
      : 'https://example.com';

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
        <div className="sticky top-0 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <TypeIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">افزودن {typeConfig.label}</h2>
              <p className="text-sm text-white/80">
                {type === 'iframe'
                  ? 'آدرس آیفریم (Embed) را وارد کنید'
                  : 'فایل را آپلود کنید یا آدرس آماده وارد کنید'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* بدنه */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* انتخاب روش */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => type !== 'iframe' && setMode('upload')}
              className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'upload'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              } ${type === 'iframe' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={uploading || type === 'iframe'}
            >
              <UploadCloud size={18} />
              آپلود فایل
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'url'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={uploading}
            >
              <LinkIcon size={18} />
              استفاده از آدرس آماده
            </button>
          </div>

          {/* پیام خطا */}
          {error && (
            <div className="px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* تب آپلود */}
          {mode === 'upload' && type !== 'iframe' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                فایل {typeConfig.label} را انتخاب کنید
              </label>

              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-2xl px-6 py-10 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all">
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
                />
              </label>

              {file && (
                <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="truncate max-w-[70%]">{file.name}</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>
          )}

          {/* تب URL */}
          {mode === 'url' && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                آدرس مستقیم {typeConfig.label}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={urlPlaceholder}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">
                اگر فایل را در جای دیگری آپلود کرده‌اید، می‌توانید URL مستقیم آن
                را اینجا وارد کنید.
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
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              {uploading ? 'در حال آپلود...' : '✅ درج در صفحه'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
