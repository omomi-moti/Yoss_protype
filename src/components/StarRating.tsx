import { Star } from 'lucide-react';

/**
 * 星5つの評価表示。
 * 画面C（団体カードのレビュー）と画面D（支援候補カード）で共有する。
 */
export default function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'fill-yoss-yellow text-yoss-yellow' : 'text-gray-200'}
        />
      ))}
    </div>
  );
}
