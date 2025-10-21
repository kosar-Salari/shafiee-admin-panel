import React, { useEffect, useState } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Save, Undo, Redo, Eye, EyeOff, Settings, Plus } from 'lucide-react';

import { TextBlock } from '../components/blocks/TextBlock';
import { ImageBlock } from '../components/blocks/ImageBlock';
import { IFrameBlock } from '../components/blocks/IFrameBlock';
import { FileBlock } from '../components/blocks/FileBlock';
import { Container } from '../components/blocks/Container';
import { SettingsPanel } from '../components/panels/SettingsPanel';
import { Toolbox } from '../components/panels/Toolbox';

const PageBuilder = () => {
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('new-page');
  const [showToolbox, setShowToolbox] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const isPreview = !showToolbox && !showSettings;
  
  const togglePreview = () => {
    if (isPreview) {
      setShowToolbox(true);
      setShowSettings(true);
    } else {
      setShowToolbox(false);
      setShowSettings(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'p') togglePreview();
      if (k === 't') setShowToolbox((v) => !v);
      if (k === 's') setShowSettings((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPreview]);

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      <Editor resolver={{ TextBlock, ImageBlock, IFrameBlock, FileBlock, Container }}>
        {/* Header */}
        <HeaderBar 
          pageTitle={pageTitle}
          setPageTitle={setPageTitle}
          pageSlug={pageSlug}
          setPageSlug={setPageSlug}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          isPreview={isPreview}
          togglePreview={togglePreview}
        />

        {/* Editor zone */}
        <div className="flex-1 flex overflow-hidden">
          {showToolbox && <Toolbox />}

          <div className="flex-1 bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 overflow-y-auto relative">
            {/* فریم اصلی با عرض ثابت برای جلوگیری از تغییر لِی‌اوت */}
            <div className={`mx-auto transition-all ${isPreview ? 'w-full h-full' : 'max-w-7xl p-8'}`}>
              <div className={`bg-white ${isPreview ? 'min-h-screen' : 'min-h-[800px] shadow-2xl rounded-lg'}`}>
                <Frame>
                  <Element is={Container} canvas />
                </Frame>
              </div>
            </div>

            {/* دکمه افزودن شناور */}
            {!isPreview && (
              <div className="fixed bottom-8 right-8 z-50">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
                  title="افزودن المان"
                >
                  <Plus className={`w-7 h-7 transition-transform ${showAddMenu ? 'rotate-45' : ''}`} />
                </button>

                {showAddMenu && <AddElementMenu onClose={() => setShowAddMenu(false)} />}
              </div>
            )}
          </div>

          {showSettings && <SettingsPanel />}
        </div>
      </Editor>
    </div>
  );
};

// کامپوننت هدر
const HeaderBar = ({ pageTitle, setPageTitle, pageSlug, setPageSlug, showSettings, setShowSettings, isPreview, togglePreview }) => {
  return (
    <div className="bg-gradient-to-l from-slate-800 via-slate-700 to-white text-white p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">بیلدر صفحه</h1>
          <div className="hidden md:flex items-center gap-2">
            <input
              type="text"
              value={pageSlug}
              onChange={(e) => setPageSlug(e.target.value)}
              placeholder="آدرس صفحه"
              className="px-3 py-2 rounded-lg bg-white/90 backdrop-blur text-slate-800 placeholder-slate-500 outline-none border border-slate-300 w-40 focus:ring-2 focus:ring-slate-400 transition-all"
              dir="ltr"
            />
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="عنوان صفحه"
              className="px-3 py-2 rounded-lg bg-white/90 backdrop-blur text-slate-800 placeholder-slate-500 outline-none border border-slate-300 w-48 focus:ring-2 focus:ring-slate-400 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-slate-700 shadow-inner' : 'bg-slate-600/50'} hover:bg-slate-600`}
            title="تنظیمات (S)"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={togglePreview}
            className={`p-2 rounded-lg transition-all ${isPreview ? 'bg-slate-700 shadow-inner' : 'bg-slate-600/50'} hover:bg-slate-600`}
            title="پیش‌نمایش (P)"
          >
            {isPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          <div className="w-px h-6 bg-white/30 mx-1" />

          <EditorButtons />

          <button
            onClick={() => alert('صفحه با موفقیت ذخیره شد! 🎉')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 hover:shadow-lg transition-all font-bold"
          >
            <Save className="w-5 h-5" />
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

// کامپوننت دکمه‌های Undo/Redo
const EditorButtons = () => {
  const { actions, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  return (
    <>
      <button
        onClick={() => actions.history.undo()}
        disabled={!canUndo}
        className={`p-2 rounded-lg transition-all ${canUndo ? 'hover:bg-slate-600 text-white' : 'opacity-40 cursor-not-allowed text-slate-400'}`}
        title="بازگشت (Ctrl+Z)"
      >
        <Undo className="w-5 h-5" />
      </button>
      <button
        onClick={() => actions.history.redo()}
        disabled={!canRedo}
        className={`p-2 rounded-lg transition-all ${canRedo ? 'hover:bg-slate-600 text-white' : 'opacity-40 cursor-not-allowed text-slate-400'}`}
        title="جلو (Ctrl+Y)"
      >
        <Redo className="w-5 h-5" />
      </button>
    </>
  );
};

// منوی افزودن المان
const AddElementMenu = ({ onClose }) => {
  const { connectors } = useEditor();

  const elements = [
    { type: TextBlock, label: 'متن', icon: '📝', desc: 'افزودن متن' },
    { type: ImageBlock, label: 'تصویر', icon: '🖼️', desc: 'افزودن تصویر' },
    { type: IFrameBlock, label: 'Iframe', icon: '🌐', desc: 'کد HTML خارجی' },
    { type: FileBlock, label: 'فایل', icon: '📎', desc: 'لینک دانلود فایل' },
  ];

  return (
    <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-3 w-64 border border-gray-200">
      <div className="space-y-2">
        {elements.map(({ type, label, icon, desc }) => (
          <button
            key={label}
            ref={(ref) => {
              if (ref) {
                connectors.create(ref, React.createElement(type));
              }
            }}
            onClick={onClose}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all text-right group border border-transparent hover:border-blue-200"
          >
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800 group-hover:text-blue-600">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PageBuilder;