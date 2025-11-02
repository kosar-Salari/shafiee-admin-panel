// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LayoutShell from './components/LayoutShell';
import MyPages from './pages/Pages';
import MainPage from './pages/MainPage';
import Comments from './pages/Comments';
import News from './pages/News';
import Articles from './pages/Articles';
import PageBuilder from './pageBuilder/PageBuilder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* داشبورد با سایدبار */}
        <Route element={<LayoutShell />}>
          <Route path="/" element={<Navigate to="/pages" replace />} />
          <Route path="/pages" element={<MyPages />} />
          <Route path="/mainPage" element={<MainPage />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/news" element={<News />} />
          <Route path="/articles" element={<Articles />} />
        </Route>

        <Route path="/builder" element={<PageBuilder />} />

        <Route path="*" element={<div className="p-6 text-center font-lahzeh font-bold text-xl">!یافت نشد</div>} />
      </Routes>
    </BrowserRouter>
  );
}