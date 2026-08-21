import type { ContributionProgress as Progress } from '../data/supportStore';

/**
 * 達成状況のバー。寄付金・物品・ボランティアで同じ形にする。
 *
 * 3種別を並べたときに、どれがどれだけ足りていないかを一目で比べられるようにするため、
 * 単位が違っても同じ見た目にそろえる。100%を超えたバーは満杯で止める（数字には出る）。
 */
export default function ContributionProgress({
  progress,
  size = 'md',
}: {
  progress: Progress;
  size?: 'md' | 'lg';
}) {
  const { current, goal, percent, unit } = progress;
  const filled = percent === null ? 0 : Math.min(percent, 100);
  const isComplete = percent !== null && percent >= 100;

  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-bold text-yoss-dark ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
          {current.toLocaleString('ja-JP')}
        </span>
        <span className={`text-yoss-dark ${size === 'lg' ? 'text-base' : 'text-xs'}`}>{unit}</span>
        {goal !== null && (
          <span className="ml-auto text-[11px] text-gray-400">
            目標 {goal.toLocaleString('ja-JP')}
            {unit}
          </span>
        )}
      </div>

      <div className={`mt-1.5 w-full rounded-full bg-gray-100 ${size === 'lg' ? 'h-3' : 'h-2'}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            isComplete
              ? 'bg-yoss-green'
              : 'bg-gradient-to-r from-yoss-yellow to-yoss-yellow-dark'
          }`}
          style={{ width: `${filled}%` }}
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px]">
        <span className={`font-bold ${isComplete ? 'text-yoss-green' : 'text-yoss-yellow-dark'}`}>
          {percent === null ? '目標が未設定' : `${percent}%`}
        </span>
        {goal !== null && (
          <span className="text-gray-400">
            {isComplete
              ? '目標を達成しました'
              : `あと ${progress.remaining.toLocaleString('ja-JP')}${unit}`}
          </span>
        )}
      </div>
    </div>
  );
}
