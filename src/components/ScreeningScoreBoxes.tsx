import { changeOf } from '../data/screening';
import { CHANGE_STYLES } from './screeningChange';

/**
 * 1項目の点数（2 / 1 の枠）。付いている点だけが、前学期との変化の色で塗られる。
 * 入力面ごとの表示と全項目一覧で共有する。
 */
export default function ScreeningScoreBoxes({
  value,
  previous,
}: {
  value?: 1 | 2;
  previous?: 1 | 2;
}) {
  const change = changeOf(value, previous);

  return (
    <span className="shrink-0 flex gap-1">
      {([2, 1] as const).map(point => (
        <span
          key={point}
          className={`w-6 h-5 flex items-center justify-center rounded border text-[11px] font-bold ${
            value === point ? CHANGE_STYLES[change] : 'bg-white text-gray-300 border-gray-200'
          }`}
        >
          {point}
        </span>
      ))}
    </span>
  );
}
