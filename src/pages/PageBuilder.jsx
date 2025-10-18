import React, { useState } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Save, Undo, Redo, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

import { TextBlock } from '../components/blocks/TextBlock';
import { ImageBlock } from '../components/blocks/ImageBlock';
import { IFrameBlock } from '../components/blocks/IFrameBlock';
import { FileBlock } from '../components/blocks/FileBlock';
import { Container } from '../components/blocks/Container';
import { SettingsPanel } from '../components/panels/SettingsPanel';
import { Toolbox } from '../components/panels/Toolbox';

const PageBuilder = () => {
  const { slug: routeSlug } = useParams();
  const navigate = useNavigate();

  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState(routeSlug || '');

  const goBack = () => navigate('/pages');

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">بیلدر صفحه ({pageSlug || '—'})</h1>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                placeholder="آدرس صفحه"
                className="px-3 py-2 rounded bg-white/20 backdrop-blur text-white placeholder-white/60 outline-none border border-white/30 w-40"
                dir="ltr"
              />
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="عنوان صفحه"
                className="px-3 py-2 rounded bg-white/20 backdrop-blur text-white placeholder-white/60 outline-none border border-white/30 w-48"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goBack}
              className="p-2 hover:bg-white/20 rounded transition-colors"
              title="بازگشت به صفحات"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors" title="بازگشت">
              <Undo className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors" title="جلو">
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={() => alert('صفحه ذخیره شد!')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              ذخیره
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Editor resolver={{ TextBlock, ImageBlock, IFrameBlock, FileBlock, Container }}>
          <Toolbox />
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-8">
              <Frame>
                <Element is={Container} canvas>
                  <div className="text-center py-32 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 opacity-30 rounded-full border-2 border-gray-300" />
                    <p className="text-xl font-medium mb-2">المان‌ها را از سمت راست بکشید</p>
                    <p className="text-sm">Drag & Drop کنید و آزادانه جا به جا کنید 👆</p>
                  </div>
                </Element>
              </Frame>
            </div>
          </div>
          <SettingsPanel />
        </Editor>
      </div>
    </div>
  );
};

export default PageBuilder;
