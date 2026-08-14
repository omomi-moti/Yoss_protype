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
 *
 * 他のタブ（②の支援候補・③の記録一覧）と違い、ここは1画面に収めようとしない。
 * 担当ごとの自由記述は長さがまちまちで、高さを固定した領域に押し込めると
 * カードが詰まって読みにくくなるため、タブ全体を縦スクロールさせる。
 *
 * 気になる情報（各担当の自由記述）と直近の対応記録は性質が違う情報なので、
 * タブ③と同じように左右のカラムに分ける。縦に並べると2つが同じ流れの情報に
 * 見えてしまい、幅も余らせてしまうため。
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
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="flex flex-col gap-3">
        <MeetingStudentSummary student={student} />

        <div className="grid grid-cols-[1.7fr_1fr] gap-5 items-start">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h3 className="text-sm font-bold text-yoss-dark">各担当が入力した気になる情報</h3>
              <p className="text-xs text-gray-500">
                スクリーニングの入力がそのまま反映されています。会議での読み上げは不要です
              </p>
            </div>

            {roles.map(({ role, entries }) =>
              entries.length > 0 ? (
                <div key={role} className="border border-gray-200 rounded-xl px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
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

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-yoss-dark">直近の対応記録</h3>
              <button onClick={onGoToRecords} className="text-xs text-yoss-link hover:underline">
                タブ③で全件（{records.length}件）
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl bg-gray-50/60 divide-y divide-gray-200/70">
              {records.slice(0, 4).map(record => (
                <div key={record.date} className="px-4 py-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] text-gray-400">{record.date}</span>
                    <span className="text-[11px] text-gray-500">{record.role}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-gray-700 mt-0.5">{record.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
