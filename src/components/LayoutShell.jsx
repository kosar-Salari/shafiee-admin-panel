// src/components/LayoutShell.jsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Layout from './Layout';

export default function LayoutShell() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Pages');

  // سنک کردن تب فعال با مسیر فعلی
  useEffect(() => {
    if (location.pathname.startsWith('/mainPage')) setActiveTab('MainPage');
    else if (location.pathname.startsWith('/comments')) setActiveTab('Comments');
    else if (location.pathname.startsWith('/news')) setActiveTab('News');
    else if (location.pathname.startsWith('/articles')) setActiveTab('Articles');
    else if (location.pathname.startsWith('/header-footer')) setActiveTab('HeaderFooter');
    else if (location.pathname.startsWith('/admins')) setActiveTab('Admins');
    else setActiveTab('Pages');
  }, [location.pathname]);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Outlet />
    </Layout>
  );
}
