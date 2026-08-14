import { SUPPORT_CATEGORIES } from '../data/organizations';
import { MAX_DOMAIN_SCORE } from '../data/screening';
import type { DomainScores, SupportCategory } from '../types';

/**
 * 児童の8領域スコアの表示と、支援候補の絞り込みを兼ねる。
 *
 * スコアと支援候補の件数を1つの面にまとめることで、「この領域が重い → だからこの支援」
 * という対応を同じ場所で読めるようにする。
 *
 * 8領域すべてを押せる状態で出す。スコアが0でも、地域にその支援があること自体は
 * 事実で、会議で「この子には要らない」と確かめるにも中身が見えたほうがいい。
 * そのぶん「この児童に必要な領域」は色で立てて、押せることと必要なことを混同させない
 * （スコアが付いた領域だけ枠と数字に色が付く）。
 * 支援が1件も登録されていない領域だけは、開いても何も出ないので押せなくする。
 */
export default function DomainSelector({ scores, supportCounts, activeDomain, onSelect }: {
  scores: DomainScores;
  /** 領域ごとに登録されている支援の件数。児童のスコアとは無関係に数える */
  supportCounts: Record<SupportCategory, number>;
  activeDomain?: SupportCategory;
  onSelect: (domain: SupportCategory) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {SUPPORT_CATEGORIES.map(category => {
        const score = scores[category];
        const count = supportCounts[category];
        // この児童に手を打つ必要がある領域。色を付けるのはここだけ
        const isNeeded = score > 0;
        const isActive = category === activeDomain;
        const hasSupport = count > 0;

        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            disabled={!hasSupport}
            className={`rounded-lg border px-3 py-1.5 text-left transition-colors ${
              isActive
                ? 'bg-gray-100 border-gray-500'
                : isNeeded
                ? 'bg-white border-yoss-yellow/40 hover:border-yoss-yellow'
                : hasSupport
                ? 'bg-white border-gray-200 hover:border-gray-300'
                : 'bg-gray-50/60 border-dashed border-gray-200 cursor-default'
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className={`text-xs font-bold truncate ${
                isNeeded || isActive ? 'text-yoss-dark' : 'text-gray-400'
              }`}>
                {category}
              </span>
              <span className="text-[10px] text-gray-400 shrink-0">
                {hasSupport ? `支援${count}件` : '登録なし'}
              </span>
              <span className={`text-sm font-bold shrink-0 ml-auto ${
                isNeeded ? 'text-yoss-yellow-dark' : 'text-gray-300'
              }`}>
                {score}
              </span>
            </div>
            {/* バーはスコアが付いた領域だけ。0点の領域に空のバーを出しても読み取るものが無い */}
            <div className="mt-1 h-1 rounded-full bg-gray-100 overflow-hidden">
              {isNeeded && (
                <div
                  className="h-full rounded-full bg-yoss-yellow"
                  style={{ width: `${(score / MAX_DOMAIN_SCORE) * 100}%` }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
