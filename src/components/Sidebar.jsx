import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  MessageSquare,
  Newspaper,
  BookMarked,
  LayoutTemplate,
  Users,
  ClipboardList,
  UserCheck,
} from 'lucide-react';
import { getAdminInfo } from '../utils/auth';

const menuItems = [
  { id: 'MainPage', label: 'صفحه اصلی', icon: BookOpen, path: '/mainPage' },
  { id: 'Pages', label: 'مدیریت صفحات', icon: FileText, path: '/pages' },
  { id: 'News', label: 'مدیریت اخبار', icon: Newspaper, path: '/news' },
  { id: 'Articles', label: 'مدیریت مقالات', icon: BookMarked, path: '/articles' },
  { id: 'Comments', label: 'دیدگاه ها', icon: MessageSquare, path: '/comments' },
  { id: 'HeaderFooter', label: 'هدر و فوتر سایت', icon: LayoutTemplate, path: '/header-footer' },
  { id: 'Consultations', label: 'فرم مشاوره', icon: ClipboardList, path: '/consultations' },
  { id: 'RegisteredUsers', label: 'کاربران ثبت نام شده', icon: UserCheck, path: '/registered-users' },

  // ⬅️ این فقط باید برای ادمین اصلی بیاد
  { id: 'Admins', label: 'مدیریت ادمینها', icon: Users, path: '/admins', requiresMain: true },
];

const Sidebar = ({ setActiveTab, onItemClick, className = '', isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminInfo = getAdminInfo();

  // ✅ تشخیص مستقیم ادمین اصلی
  const isMainAdmin =
    adminInfo?.isMain === true ||
    adminInfo?.IsMain === true ||
    adminInfo?.isMain === 'true' ||
    adminInfo?.IsMain === 'true';

  // 🔴 لاگ تشخیصی (خیلی مهم)
  console.log('SIDEBAR adminInfo =>', adminInfo);
  console.log('SIDEBAR isMainAdmin =>', isMainAdmin);

  const handleClick = (item) => {
    setActiveTab?.(item.id);
    navigate(item.path);
    onItemClick?.();
  };

  const isActive = (item) =>
    location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(item.path));

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.requiresMain) return isMainAdmin;
    return true;
  });

  return (
    <aside
      className={`fixed right-0 top-0 h-screen w-64 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white shadow-2xl ${
        isMobile ? 'z-50' : 'z-40'
      } ${className}`}
    >
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">پنل مدیریت</h1>
        <p className="text-sm text-slate-300 mt-1">خوش آمدید</p>
      </div>

      <nav className="p-4">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
