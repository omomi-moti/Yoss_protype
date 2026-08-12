import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { totalScore } from '../data/students';
import type { Student } from '../types';

/**
 * 検討する児童を切り替える上部バー。
 *
 * 会議の進行表を兼ねる。左の一覧を畳んで横1本にしたぶん、記述カードに横幅を回せる。
 * 全件の点数・タグは「一覧」ドロワーに送り、ここには現在位置と残り人数だけを出す。
 */
export default function MeetingStudentBar({
  students,
  activeStudent,
  onSelect,
  onOpenList,
}: {
  students: Student[];
  activeStudent: Student;
  onSelect: (studentId: string) => void;
  onOpenList: () => void;
}) {
  const index = students.findIndex(student => student.id === activeStudent.id);

  const move = (step: number) => {
    const next = students[index + step];
    if (next) onSelect(next.id);
  };

  return (
    <div className="shrink-0 flex items-center gap-2 px-6 py-2 border-b border-gray-100 bg-white">
      <button
        onClick={() => move(-1)}
        disabled={index <= 0}
        aria-label="前の児童"
        className="shrink-0 w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-yoss-yellow-dark hover:border-yoss-yellow disabled:text-gray-300 disabled:hover:border-gray-200 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* 児童のチップ。人数が多いとここだけが横スクロールする */}
      <div className="flex-1 min-w-0 flex gap-1.5 overflow-x-auto py-0.5">
        {students.map(student => {
          const isActive = student.id === activeStudent.id;

          return (
            <button
              key={student.id}
              onClick={() => onSelect(student.id)}
              className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                isActive
                  ? 'bg-yoss-yellow-light border-yoss-yellow font-bold text-yoss-dark'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {student.grade} {student.number}番
              <span className={`ml-1.5 ${isActive ? 'text-yoss-yellow-dark' : 'text-gray-400'}`}>
                {totalScore(student.scores)}pt
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => move(1)}
        disabled={index >= students.length - 1}
        aria-label="次の児童"
        className="shrink-0 w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-yoss-yellow-dark hover:border-yoss-yellow disabled:text-gray-300 disabled:hover:border-gray-200 transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      <button
        onClick={onOpenList}
        className="shrink-0 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-bold text-yoss-yellow-dark hover:border-yoss-yellow transition-colors"
      >
        <List size={14} />
        一覧 {students.length}名
      </button>

      <span className="shrink-0 whitespace-nowrap text-xs text-gray-400">
        {index + 1} / {students.length}人目
      </span>
    </div>
  );
}
