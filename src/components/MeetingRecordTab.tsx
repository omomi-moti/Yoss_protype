import { supportRecords } from '../data/records';
import { parseCurrentSupport } from '../data/students';
import MeetingStudentSummary from './MeetingStudentSummary';
import type { MeetingAction, Student } from '../types';

/**
 * タブ③「対応記録・アクション記録」。
 *
 * 左は会議で決めたことの結果＝アクション記録。支援候補から登録されたものは
 * どの支援・どの団体に紐づくかが残る（レビューを書くときの手掛かりになる）。
 * 右は日常の対応記録で参照専用。ここから新しく入力させない。
 */
export default function MeetingRecordTab({
  student,
  actions,
  onGoToSupport,
}: {
  student: Student;
  actions: MeetingAction[];
  onGoToSupport: () => void;
}) {
  const records = supportRecords(student);
  const { directions, detail } = parseCurrentSupport(student);

  return (
    <div className="h-full flex flex-col gap-3 px-6 py-4 min-h-0">
      <MeetingStudentSummary student={student} />

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="shrink-0 flex items-baseline gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-yoss-dark">アクション記録</h3>
            <p className="text-xs text-gray-500">この会議で割り振ったアクション</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
            {actions.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-xl px-4 py-4">
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  この会議ではまだアクションを決めていません。
                </p>
                <button
                  onClick={onGoToSupport}
                  className="mt-2 text-[13px] font-bold text-yoss-yellow-dark hover:underline"
                >
                  タブ④の支援候補から登録する
                </button>
              </div>
            ) : (
              actions.map(action => (
                <div key={action.id} className="border border-yoss-yellow/40 bg-yoss-yellow-light/40 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-yoss-yellow-dark bg-yoss-yellow-light border border-yoss-yellow/40 px-2 py-1 rounded">
                      未完了
                    </span>
                    <span className="text-[11px] text-yoss-yellow-dark border border-yoss-yellow/40 px-2 py-1 rounded">
                      支援候補から登録
                    </span>
                    <span className="ml-auto text-[11px] text-gray-400">{action.registeredAt} 登録</span>
                  </div>
                  <p className="text-[13px] text-yoss-dark leading-relaxed mt-2">{action.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    方向性 {action.direction}
                    <span className="mx-1.5">·</span>
                    対象の支援：{action.supportName}（{action.organizationName}）
                  </p>
                </div>
              ))
            )}

            {/* 前学期までに決まっている対応。今日の会議で継続か完了かを決める材料 */}
            <div className="border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  前学期から継続
                </span>
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed mt-2">{detail}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                方向性 {directions.length > 0 ? directions.join('＋') : '未設定'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="shrink-0 flex items-baseline gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-yoss-dark">対応記録 {records.length}件</h3>
            <p className="text-xs text-gray-500">日常の事象記録 ／ 新しい順・参照専用</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto border border-gray-200 rounded-xl">
            {records.map(record => (
              <div
                key={record.date}
                className="flex gap-3 px-4 py-2.5 border-b border-gray-50 text-[13px] leading-relaxed"
              >
                <span className="shrink-0 w-12 text-gray-400">{record.date}</span>
                <span className="shrink-0 w-20 text-yoss-yellow-dark">{record.role}</span>
                <span className="min-w-0 text-gray-700">{record.text}</span>
              </div>
            ))}
          </div>

          <p className="shrink-0 border border-dashed border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-400 leading-relaxed bg-gray-50/50">
            対応記録の新規入力はこの画面では行いません（表示のみ）。入力は日常の対応記録画面から。
          </p>
        </div>
      </div>
    </div>
  );
}
