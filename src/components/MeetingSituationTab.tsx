import { currentTerm } from '../data/meeting';
import { entriesByRole, supportRecords } from '../data/records';
import MeetingStudentSummary from './MeetingStudentSummary';
import type { Student } from '../types';

/**
 * タブ①「状況（気になる情報）」。
 *
 * 各担当がスクリーニングで入力した自由記述をそのまま並べる。会議で読み上げ直さずに
 * 済ませるための面なので、この画面からは編集させない（入力は既存の画面から）。
 * 入力の無い担当も1行残す。空欄が「抜け漏れ」に見えないようにするため。
 */
export default function MeetingSituationTab({
  student,
  onGoToRecords,
}: {
  student: Student;
  onGoToRecords: () => void;
}) {
  const roles = entriesByRole(student);
  const records = supportRecords(student);

  return (
    <div className="h-full flex flex-col gap-3 px-6 py-4 min-h-0">
      <MeetingStudentSummary student={student} />

      <div className="shrink-0 flex items-baseline gap-3 flex-wrap">
        <h3 className="text-sm font-bold text-yoss-dark">各担当が入力した気になる情報</h3>
        <p className="text-xs text-gray-500">
          スクリーニングの入力がそのまま反映されています。会議での読み上げは不要です
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
        {roles.map(({ role, entries }) =>
          entries.length > 0 ? (
            <div key={role} className="border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-yoss-yellow-dark bg-yoss-yellow-light px-2 py-1 rounded">
                  {role}
                </span>
                <span className="text-[11px] text-gray-400">{currentTerm} 入力</span>
              </div>
              {entries.map(entry => (
                <p key={entry.item} className="text-[13px] leading-relaxed text-gray-700 mt-2">
                  {entry.note}
                </p>
              ))}
            </div>
          ) : (
            <div
              key={role}
              className="border border-dashed border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 flex items-center gap-2"
            >
              <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-1 rounded">{role}</span>
              <span className="text-[13px] text-gray-400">
                この学期の記述はまだ登録されていません（入力なし）
              </span>
            </div>
          )
        )}
      </div>

      <div className="shrink-0 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/60">
        <div className="flex items-baseline gap-3 mb-1.5">
          <h3 className="text-[13px] font-bold text-yoss-dark">直近の対応記録</h3>
          <button
            onClick={onGoToRecords}
            className="text-xs text-yoss-yellow-dark hover:underline"
          >
            タブ③で全件（{records.length}件）を見る
          </button>
        </div>
        {records.slice(0, 2).map(record => (
          <div key={record.date} className="flex gap-3 text-[13px] leading-relaxed text-gray-700">
            <span className="shrink-0 w-12 text-gray-400">{record.date}</span>
            <span className="shrink-0 w-20 text-yoss-yellow-dark">{record.role}</span>
            <span className="min-w-0">{record.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
