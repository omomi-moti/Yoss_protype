import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * 画面Dの左右のドロワー（児童の一覧・この会議で決めたこと）の外枠。
 *
 * 中央を押し出さず上に重ねる。会議中に開閉しても、検討中の記述の行送りが変わらないため。
 * 閉じている間も DOM に残して translate で外に逃がす（開閉の状態が児童をまたいで残る）。
 */
export default function MeetingDrawer({
  side,
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  side: 'left' | 'right';
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  // Tailwind はクラス名を文字列として拾うため、辺ごとのクラスは組み立てずに書き分ける
  const position =
    side === 'left'
      ? { anchor: 'left-0 border-r', hidden: '-translate-x-full' }
      : { anchor: 'right-0 border-l', hidden: 'translate-x-full' };

  return (
    <div
      // 閉じている間は inert で中身ごと外す（キーボードのタブ順に残さない）
      inert={!isOpen}
      className={`absolute inset-y-0 ${position.anchor} z-20 w-80 bg-white flex flex-col shadow-xl transition-transform duration-200 border-gray-200 ${
        isOpen ? 'translate-x-0' : `${position.hidden} pointer-events-none`
      }`}
    >
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-yoss-dark">{title}</h2>
        {subtitle && <span className="text-xs text-gray-400 truncate">{subtitle}</span>}
        <button
          onClick={onClose}
          aria-label={`${title}を閉じる`}
          className="ml-auto shrink-0 w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>

      {footer && <div className="shrink-0 border-t border-gray-100">{footer}</div>}
    </div>
  );
}
