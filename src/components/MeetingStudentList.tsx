import { scoreLevel, scoredDomains, totalScore } from '../data/students';
import type { Student } from '../types';

// スコアの水準ごとのバッジ配色
const SCORE_STYLES = {
  high: 'bg-gray-100 text-yoss-dark',
  middle: 'bg-gray-50 text-gray-600',
  low: 'bg-gray-50 text-gray-400',
} as const;

/**
 * 検索結果の児童一覧（左ドロワーの中身）。
 *
 * 上部の児童バーは現在位置を示すだけなので、点数と該当領域を見比べて
 * 「次に誰を検討するか」を決めたいときはここを開く。
 */
export default function MeetingStudentList({
  students,
  activeStudentId,
  onSelect,
}: {
  students: Student[];
  activeStudentId: string;
  onSelect: (studentId: string) => void;
}) {
  return (
    <div>
      {students.map(student => (
        <button
          key={student.id}
          onClick={() => onSelect(student.id)}
          className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
            student.id === activeStudentId
              ? 'bg-gray-50 border-l-2 border-l-gray-500'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-bold text-yoss-dark">
              {student.grade} {student.number}番
            </span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                SCORE_STYLES[scoreLevel(totalScore(student.scores))]
              }`}
            >
              {totalScore(student.scores)}pt
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {scoredDomains(student.scores).slice(0, 3).map(domain => (
              <span
                key={domain}
                className="text-[11px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
              >
                {domain} {student.scores[domain]}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
