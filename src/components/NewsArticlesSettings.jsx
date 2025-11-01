import React, { useState } from 'react';

const NewsArticlesSettings = () => {
  const [newsSettings, setNewsSettings] = useState({
    showNews: true,
    newsCount: 4,
    showArticles: true,
    articlesCount: 4,
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        تنظیمات نمایش اخبار و مقالات
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* News */}
        <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-900">📰 جدیدترین اخبار</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newsSettings.showNews}
                onChange={(e) => setNewsSettings({ ...newsSettings, showNews: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {newsSettings.showNews ? (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">تعداد اخبار نمایشی:</label>
              <div className="flex gap-2">
                {[3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNewsSettings({ ...newsSettings, newsCount: num })}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                      newsSettings.newsCount === num
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                {newsSettings.newsCount} خبر جدید نمایش داده می‌شود
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-4">نمایش اخبار غیرفعال است</p>
          )}
        </div>

        {/* Articles (toggle fixed: translate-x-full) */}
        <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-900">📝 جدیدترین مقالات</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newsSettings.showArticles}
                onChange={(e) => setNewsSettings({ ...newsSettings, showArticles: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {newsSettings.showArticles ? (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">تعداد مقالات نمایشی:</label>
              <div className="flex gap-2">
                {[3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNewsSettings({ ...newsSettings, articlesCount: num })}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                      newsSettings.articlesCount === num
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                {newsSettings.articlesCount} مقاله جدید نمایش داده می‌شود
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-4">نمایش مقالات غیرفعال است</p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-bold mb-2 text-gray-800">📊 خلاصه تنظیمات:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${newsSettings.showNews ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>اخبار: {newsSettings.showNews ? `فعال (${newsSettings.newsCount} عدد)` : 'غیرفعال'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${newsSettings.showArticles ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>مقالات: {newsSettings.showArticles ? `فعال (${newsSettings.articlesCount} عدد)` : 'غیرفعال'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsArticlesSettings;
