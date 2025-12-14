import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LayoutShell from './components/LayoutShell';
import MyPages from './pages/Pages';
import MainPage from './pages/MainPage';
import Comments from './pages/Comments';
import News from './pages/News';
import Articles from './pages/Articles';
import PageBuilder from './pageBuilder/PageBuilder';
import HeaderFooterPage from "./pages/HeaderFooter";
import AdminManagement from './pages/AdminManagement';

import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ورود */}
        <Route path="/login" element={<Login />} />

        {/* روت‌های محافظت‌شده با شِل داشبورد */}
        <Route
          element={
            <PrivateRoute>
              <LayoutShell />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Navigate to="/pages" replace />} />
          <Route path="/pages" element={<MyPages />} />
          <Route path="/mainPage" element={<MainPage />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/news" element={<News />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/header-footer" element={<HeaderFooterPage />} />
          <Route path="/admins" element={<AdminManagement />} />

        </Route>

        {/* بیلدر هم محافظت شود */}
        <Route
          path="/builder"
          element={
            <PrivateRoute>
              <PageBuilder />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="p-6 text-center font-lahzeh font-bold text-xl">!یافت نشد</div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
