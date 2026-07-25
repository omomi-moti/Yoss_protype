import { NavLink, Outlet } from 'react-router-dom';
import { Building2, BarChart3, Users, Home } from 'lucide-react';
import { organizations } from '../data/organizations';

// ログイン中の団体という想定
const myOrganization = organizations.find(o => o.isMine) ?? organizations[0];

const navItems = [
  { to: '/', label: 'トップ', icon: Home },
  { to: '/register', label: '支援登録', icon: Building2, badge: '支援団体' },
  { to: '/dashboard', label: 'サポート一覧', icon: BarChart3, badge: '共通' },
  { to: '/meeting', label: '校内チーム会議', icon: Users, badge: '学校' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* YOSS Logo area */}
          <div className="w-9 h-9 bg-yoss-yellow rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-wide text-yoss-dark">YOSS</span>
            <span className="text-[10px] text-gray-400 ml-1 align-super">®</span>
            <span className="text-xs text-gray-500 ml-2">クラウドサービス</span>
          </div>
          <span className="ml-3 px-2 py-0.5 bg-yoss-yellow-light text-yoss-yellow-dark text-[10px] font-bold rounded">
            PROTOTYPE
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {myOrganization.name} — 2026年度
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-52 bg-white border-r border-gray-200 py-4 shrink-0">
          <div className="px-4 mb-4">
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Menu</p>
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-yoss-yellow-light text-yoss-yellow-dark font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${
                  item.badge === '支援団体' ? 'bg-blue-50 text-blue-500' : item.badge === '共通' ? 'bg-purple-50 text-purple-500' : 'bg-green-50 text-green-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
