import { SUPPORT_CATEGORIES } from '../data/organizations';
import { MAX_DOMAIN_SCORE } from '../data/students';
import type { DomainScores, DomainSuggestionGroup, SupportCategory } from '../types';

/**
 * 児童の8領域スコアの表示と、支援候補の絞り込みを兼ねる。
 *
 * スコアと支援候補の件数を1つの面にまとめることで、「この領域が重い → だからこの支援」
 * という対応を同じ場所で読めるようにする。スコアが0の領域は選択できないが、
 * 「対応が要らない領域」の情報として薄く残す。
 */
export default function DomainSelector({ scores, groups, activeDomain, onSelect }: {
  scores: DomainScores;
  groups: DomainSuggestionGroup[];
  activeDomain?: SupportCategory;
  onSelect: (domain: SupportCategory) => void;
}) {
  const countByDomain = new Map(groups.map(group => [group.domain, group.suggestions.length]));

  return (
    <div className="grid grid-cols-4 gap-2">
      {SUPPORT_CATEGORIES.map(category => {
        const score = scores[category];
        const count = countByDomain.get(category);
        const isScored = score > 0;
        const isActive = category === activeDomain;

        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            disabled={count === undefined}
            className={`rounded-lg border px-3 py-1.5 text-left transition-colors ${
              isActive
                ? 'bg-yoss-yellow-light border-yoss-yellow'
                : isScored
                ? 'bg-white border-gray-200 hover:border-gray-300'
                : 'bg-white border-dashed border-gray-200 cursor-default'
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className={`text-xs font-bold truncate ${isScored ? 'text-yoss-dark' : 'text-gray-300'}`}>
                {category}
              </span>
              {count !== undefined && (
                <span className="text-[10px] text-gray-400 shrink-0">支援{count}件</span>
              )}
              <span className={`text-sm font-bold shrink-0 ml-auto ${
                isActive ? 'text-yoss-yellow-dark' : isScored ? 'text-gray-500' : 'text-gray-300'
              }`}>
                {score}
              </span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${isScored ? 'bg-yoss-yellow' : ''}`}
                style={{ width: `${(score / MAX_DOMAIN_SCORE) * 100}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
