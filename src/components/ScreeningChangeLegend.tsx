import { CHANGE_LEGEND, CHANGE_STYLES } from './screeningChange';

/** 変化の凡例。入力面ごとの表示と全項目一覧で共有する */
export default function ScreeningChangeLegend() {
  return (
    <div className="flex gap-2 shrink-0">
      {CHANGE_LEGEND.map(change => (
        <span key={change} className="flex items-center gap-1 text-[11px] text-gray-500">
          <span className={`w-3.5 h-3.5 rounded-sm border ${CHANGE_STYLES[change]}`} />
          {change}
        </span>
      ))}
    </div>
  );
}
