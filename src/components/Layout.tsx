import { NavLink, Outlet } from 'react-router-dom';
import { Building2, BarChart3, Users, Home, HeartHandshake } from 'lucide-react';
import { useOrganizationStore } from '../hooks/useOrganizationStore';

/**
 * 画面Eは本来サイドバーの外側にある一般向けのページだが、モックとして流れを追えるように
 * ここにも導線を置く。開いた先にサイドバーは出ない（Layout の外にルートがある）ので、
 * 戻るときは画面E上部の「管理画面に戻る」を使う。
 */
function navItemsFor(myOrganizationId: string) {
  return [
    { to: '/', label: 'トップ', icon: Home },
    { to: '/register', label: '支援登録', icon: Building2, badge: '支援団体' },
    { to: '/dashboard', label: 'サポート一覧', icon: BarChart3, badge: '共通' },
    { to: '/meeting', label: '校内チーム会議', icon: Users, badge: '学校' },
    { to: `/orgs/${myOrganizationId}`, label: '公開ページ', icon: HeartHandshake, badge: '一般' },
  ];
}

/** バッジの色は「誰向けの画面か」を表す。役割ごとに固定して、画面をまたいでも同じ色にする */
const BADGE_STYLES: Record<string, string> = {
  支援団体: 'bg-blue-50 text-blue-500',
  共通: 'bg-purple-50 text-purple-500',
  学校: 'bg-green-50 text-green-600',
  一般: 'bg-rose-50 text-rose-500',
};

export default function Layout() {
  // ログイン中の団体という想定
  const { draft: myOrganization } = useOrganizationStore();

  const navItems = navItemsFor(myOrganization.id);

  return (
    // 横長ヘッダーは置かない。ブランドとログイン情報はサイドバーの余白に収め、
    // 本文の縦スペースを画面の中身に使う。
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <nav className="w-52 bg-white border-r border-gray-200 shrink-0 flex flex-col">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yoss-yellow rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">Y</span>
            </div>
            <div>
              <div className="leading-none">
                <span className="text-lg font-bold tracking-wide text-yoss-dark">YOSS</span>
                <span className="text-[9px] text-gray-400 ml-0.5 align-super">®</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">クラウドサービス</p>
            </div>
          </div>
          <span className="inline-block mt-2.5 px-2 py-0.5 bg-yoss-yellow-light text-yoss-yellow-dark text-[10px] font-bold rounded">
            PROTOTYPE
          </span>
        </div>

        {/* Menu */}
        <div className="py-4">
          <p className="px-4 mb-3 text-[10px] text-gray-400 font-bold tracking-widest uppercase">
            Menu
          </p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-yoss-dark font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${BADGE_STYLES[item.badge]}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* ログイン中の団体。mt-auto でサイドバーの下端に置く */}
        <div className="mt-auto px-4 py-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 leading-relaxed">{myOrganization.name}</p>
          <p className="text-[10px] text-gray-400">2026年度</p>
        </div>
      </nav>

      {/* min-w-0 が無いと、中身の横幅（画面Dの児童バーなど）でページ全体が横に伸びる */}
      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  );
}
