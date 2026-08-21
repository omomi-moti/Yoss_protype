import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 公開側（画面F・画面E）の共通ヘッダー。管理用サイドバーは出さない。
 *
 * 「管理画面に戻る」はプロトタイプのための導線。本来この2画面は
 * ログインしていない人が見るもので、管理画面への入口は無い。
 */
export default function PublicHeader({ backTo }: { backTo?: { to: string; label: string } }) {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-3">
        <Link to="/orgs" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-yoss-yellow rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-[11px]">Y</span>
          </div>
          <span className="font-bold tracking-wide text-yoss-dark">YOSS</span>
        </Link>
        <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded bg-yoss-yellow-light text-yoss-yellow-dark">
          PROTOTYPE
        </span>

        {backTo && (
          <Link
            to={backTo.to}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-yoss-link shrink-0 whitespace-nowrap"
          >
            <ArrowLeft size={12} />
            {backTo.label}
          </Link>
        )}

        <Link
          to="/register"
          className="ml-auto text-[11px] text-gray-400 hover:text-yoss-link shrink-0"
        >
          管理画面に戻る
        </Link>
      </div>
    </header>
  );
}
