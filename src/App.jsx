// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LayoutShell from './components/LayoutShell';
import MyPages from './pages/Pages';
import Articles from './pages/Articles';
import Comments from './pages/Comments';
import PageBuilder from './pages/PageBuilder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* داشبورد با سایدبار */}
        <Route element={<LayoutShell />}>
          <Route path="/" element={<Navigate to="/pages" replace />} />
          <Route path="/pages" element={<MyPages />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/comments" element={<Comments />} />
        </Route>

        {/* بیلدر بدون سایدبار */}
        <Route path="/builder/:slug" element={<PageBuilder />} />

        {/* 404 */}
        <Route path="*" element={<div className="p-6">یافت نشد</div>} />
      </Routes>
    </BrowserRouter>
  );
}
