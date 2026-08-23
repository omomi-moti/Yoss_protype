import { X } from 'lucide-react';
import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

/** 幅の下限。これより狭いとアクションの1行が折り返して読めなくなる */
const MIN_WIDTH = 280;
/** 中央に最低限これだけ残す。ドロワーで検討中の内容を覆い尽くさないため */
const MIN_CENTER = 320;
/** 矢印キー1回あたりの変化量 */
const KEY_STEP = 16;

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
  dismissOnOutsideClick = false,
  resizable = false,
  children,
  footer,
}: {
  side: 'left' | 'right';
  isOpen: boolean;
  /**
   * 内側の辺をドラッグして幅を変えられるようにする。
   * 会議中ずっと開けておくドロワー向け。開いて選んで閉じるだけのものには要らない。
   */
  resizable?: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /**
   * 外側を押しても閉じる。選ぶかやめるかだけの一時的なドロワー向け。
   * 会議中ずっと開けておくもの（決定パネル）に付けると、中央の操作で消えてしまう。
   */
  dismissOnOutsideClick?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  // Tailwind はクラス名を文字列として拾うため、辺ごとのクラスは組み立てずに書き分ける
  const position =
    side === 'left'
      ? { anchor: 'left-0 border-r', hidden: '-translate-x-full', handle: 'right-0' }
      : { anchor: 'right-0 border-l', hidden: 'translate-x-full', handle: 'left-0' };

  const drawerRef = useRef<HTMLDivElement>(null);
  // 既定は w-80（320px）。触られるまでは数値を持たず、クラスのままにしておく
  const [width, setWidth] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /** 上限は器の幅から中央の取り分を引いて決める。窓の広さで変わるので都度測る */
  const clampWidth = (next: number) => {
    const container = drawerRef.current?.offsetParent as HTMLElement | null;
    const max = Math.max(MIN_WIDTH, (container?.clientWidth ?? next + MIN_CENTER) - MIN_CENTER);
    return Math.min(Math.max(next, MIN_WIDTH), max);
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const startX = event.clientX;
    const startWidth = drawer.getBoundingClientRect().width;
    // 右のドロワーは左へ引くと広がる。左のドロワーはその逆
    const direction = side === 'right' ? -1 : 1;

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);

    const onMove = (moveEvent: PointerEvent) => {
      setWidth(clampWidth(startWidth + (moveEvent.clientX - startX) * direction));
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  /** キーボードでも動かせるようにする。ドラッグだけだと操作できない人が出る */
  const nudge = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const grow = side === 'right' ? 'ArrowLeft' : 'ArrowRight';
    const shrink = side === 'right' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key !== grow && event.key !== shrink) return;

    event.preventDefault();
    const current = width ?? drawerRef.current?.getBoundingClientRect().width ?? MIN_WIDTH;
    setWidth(clampWidth(current + (event.key === grow ? KEY_STEP : -KEY_STEP)));
  };

  return (
    <>
      {/*
        外側の受け皿。うっすら暗くするのは「ここを押せば閉じる」と分かるようにするためで、
        下の内容は読めたままにする（会議中に何を見ていたか見失わせない）。
      */}
      {dismissOnOutsideClick && isOpen && (
        // キーボードからは ✕ と Esc で閉じられるので、ここはタブ順に足さない
        <div aria-hidden onClick={onClose} className="absolute inset-0 z-10 bg-yoss-dark/10" />
      )}

      <div
        ref={drawerRef}
        // 閉じている間は inert で中身ごと外す（キーボードのタブ順に残さない）
        inert={!isOpen}
        style={width === null ? undefined : { width }}
        className={`absolute inset-y-0 ${position.anchor} z-20 ${
          width === null ? 'w-80' : ''
        } bg-white flex flex-col shadow-xl transition-transform duration-200 border-gray-200 ${
          isOpen ? 'translate-x-0' : `${position.hidden} pointer-events-none`
        }`}
      >
        {resizable && (
          /*
            幅を変えるつまみ。見た目の線は 1px だが、当たり判定は掴めるだけ広げる。
            ドラッグ中は掴んだ位置とカーソルがずれないよう、器の外に出ても追い続ける。
          */
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={`${title}の幅を変える`}
            tabIndex={0}
            onPointerDown={startDrag}
            onKeyDown={nudge}
            className={`absolute inset-y-0 ${position.handle} z-30 w-2 -mx-1 cursor-col-resize group focus:outline-none`}
          >
            <span
              className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors ${
                isDragging ? 'bg-yoss-yellow' : 'bg-transparent group-hover:bg-yoss-yellow/60'
              } group-focus-visible:bg-yoss-yellow`}
            />
          </div>
        )}
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
    </>
  );
}
