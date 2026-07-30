import StarRating from './StarRating';
import type { ProblemTag, SchoolReview } from '../types';

/**
 * 学校からのレビュー一覧。
 * 画面C（団体カードの詳細）と画面D（支援の詳細モーダル）で共有する。
 */
export default function ReviewList({ reviews, highlightTags = [] }: {
  reviews: SchoolReview[];
  /** 検討中の児童の課題タグ。一致したタグを強調する（画面D用） */
  highlightTags?: ProblemTag[];
}) {
  return (
    <div className="space-y-3">
      {reviews.map((review, index) => (
        <div key={`${review.schoolName}-${review.date}-${index}`} className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} />
              <span className="text-[11px] font-bold text-yoss-dark">{review.supportUsed}</span>
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">{review.date}</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-2">{review.comment}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-400">{review.schoolName}</span>
            {review.problemTags.map(tag => {
              const isMatched = highlightTags.includes(tag);
              return (
                <span
                  key={tag}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${
                    isMatched
                      ? 'bg-yoss-yellow-light text-yoss-yellow-dark border-yoss-yellow/40 font-bold'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
