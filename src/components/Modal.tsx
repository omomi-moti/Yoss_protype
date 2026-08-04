import { useEffect, type ReactNode } from 'react';

/**
 * モーダルの外枠。
 *
 * 背景クリックと Escape キーで閉じられる。画面Dの詳細表示と画面Aのプレビューで共有する。
 * 本文のレイアウトを動かさずに情報を足せるので、1画面に収める画面Dと相性がよい。
 */
export default function Modal({ onClose, labelledBy, size = 'lg', children }: {
  onClose: () => void;
  /** 見出し要素の id。読み上げ時にモーダルの名前として使われる */
  labelledBy: string;
  /** sm は確認ダイアログ用。中身が短いので画面中央に置く */
  size?: 'sm' | 'lg';
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center overflow-y-auto bg-yoss-dark/40 p-4 sm:p-8 ${
        size === 'sm' ? 'items-center' : 'items-start'
      }`}
      // 背景そのものを押したときだけ閉じる（中身のクリックでは閉じない）
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full rounded-2xl shadow-xl ${
          size === 'sm' ? 'max-w-md bg-white' : 'max-w-3xl bg-[#FAFAFA]'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
