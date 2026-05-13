import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Sparkles, LogOut, Calculator, PieChart, Settings, UserCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const { appUser, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
    { to: '/students', icon: Users, label: 'Học sinh' },
    { to: '/meal-tracking', icon: ClipboardList, label: 'Điểm danh' },
    { to: '/nutrition', icon: Calculator, label: 'Dinh dưỡng' },
    { to: '/ai-insights', icon: Sparkles, label: 'AI Phân tích' },
    { to: '/reports', icon: PieChart, label: 'Báo cáo' },
    { to: '/food-preparation', icon: ShoppingCart, label: 'Chuẩn bị TP' },
    { to: '/profile', icon: UserCircle, label: 'Hồ sơ' },
  ];

  if (appUser?.role === 'admin') {
    navItems.push({ to: '/admin', icon: Settings, label: 'Quản trị' });
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
           <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
           </div>
           <span className="font-bold text-lg text-slate-900">SMHM Edu</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-3">
          {appUser && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-900 truncate">{appUser.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{appUser.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                appUser.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {appUser.role === 'admin' ? '👑 Ban Giám Hiệu' : '📚 Giáo viên'}
              </span>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar for mobile */}
        <header className="md:hidden h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center">
             <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center mr-2">
                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
             </div>
             <span className="font-bold text-slate-900">SMHM Edu</span>
          </div>
          <button onClick={signOut} className="p-2 text-slate-500 hover:text-slate-900">
              <LogOut className="w-5 h-5" />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto min-h-full">
            <AnimatePresence mode="wait">
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="h-full"
               >
                 <Outlet />
               </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-40 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-green-600' : 'text-slate-500'
              }`
            }
          >
            <item.icon className={`w-5 h-5 ${location.pathname === item.to ? 'fill-green-100' : ''}`} />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
