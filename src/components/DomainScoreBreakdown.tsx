import { SUPPORT_CATEGORIES } from '../data/organizations';
import { MAX_DOMAIN_SCORE } from '../data/students';
import type { DomainScores } from '../types';

/**
 * YOSS 8領域それぞれのスコアを内訳として表示する。
 * スコアが付いている領域をハイライトし、0の領域は薄く残す。
 */
export default function DomainScoreBreakdown({ scores }: { scores: DomainScores }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {SUPPORT_CATEGORIES.map(category => {
        const score = scores[category];
        const isScored = score > 0;

        return (
          <div
            key={category}
            className={`rounded-lg border px-2 py-1.5 ${
              isScored
                ? 'bg-yoss-yellow-light/50 border-yoss-yellow/40'
                : 'bg-white border-dashed border-gray-200'
            }`}
          >
            <div className="flex items-baseline justify-between gap-1">
              <span className={`text-[10px] font-bold truncate ${isScored ? 'text-yoss-dark' : 'text-gray-300'}`}>
                {category}
              </span>
              <span className={`text-xs font-bold shrink-0 ${isScored ? 'text-yoss-yellow-dark' : 'text-gray-300'}`}>
                {score}
              </span>
            </div>
            {/* スコアバー */}
            <div className="mt-1 h-1 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${isScored ? 'bg-yoss-yellow' : ''}`}
                style={{ width: `${(score / MAX_DOMAIN_SCORE) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
