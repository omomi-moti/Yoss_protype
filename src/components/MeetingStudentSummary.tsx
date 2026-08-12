import { parseCurrentSupport, totalScore } from '../data/students';
import type { Student } from '../types';

/**
 * 検討中の児童のサマリー。タブを切り替えても同じ位置に出る。
 *
 * 上部の児童バーは進行位置を示すためのものなので、名前・状況・合計スコアはここで読む。
 * ここに出す「現在の方針」は前学期までに決まっているもので、
 * この会議で決める方向性（右ドロワー）とは別のもの。
 */
export default function MeetingStudentSummary({ student }: { student: Student }) {
  const { directions, detail } = parseCurrentSupport(student);

  return (
    <div className="shrink-0 flex items-center gap-5 rounded-xl border border-yoss-yellow/30 bg-yoss-yellow-light/40 px-5 py-2.5">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-yoss-dark leading-tight">
          {student.grade} {student.number}番
        </h2>
        <p className="text-[13px] text-gray-600 mt-0.5">
          {student.notes}
          <span className="mx-2 text-gray-300">／</span>
          現在の方針
          <span className="ml-1 font-bold text-yoss-yellow-dark">
            {directions.length > 0 ? directions.join('＋') : '未設定'}
          </span>
          <span className="ml-1 text-gray-500">（{detail}）</span>
        </p>
      </div>

      <div className="shrink-0 ml-auto text-right">
        <div className="text-xl font-bold text-yoss-yellow-dark leading-none">
          {totalScore(student.scores)}pt
        </div>
        <div className="text-[11px] text-gray-500 mt-1 whitespace-nowrap">合計スコア</div>
      </div>
    </div>
  );
}
