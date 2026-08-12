import { supportRecords } from '../data/records';
import { parseCurrentSupport } from '../data/students';
import MeetingStudentSummary from './MeetingStudentSummary';
import type { Student } from '../types';

/**
 * タブ③「対応記録・アクション記録」。前回までの記録を読む面。
 *
 * 今回の会議で決めたアクションはタブ⑤に置いている。今回決めたことと前回までの記録を
 * 同じ面に並べると、どちらが今日の話か分からなくなるため分けた。
 * ここは参照専用で、新しい入力はさせない。
 */
export default function MeetingRecordTab({ student }: { student: Student }) {
  const records = supportRecords(student);
  const { directions, detail } = parseCurrentSupport(student);

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="flex flex-col gap-3">
        <MeetingStudentSummary student={student} />

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

        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="text-sm font-bold text-yoss-dark">対応記録 {records.length}件</h3>
          <p className="text-xs text-gray-500">日常の事象記録 ／ 新しい順・参照専用</p>
        </div>

        <div className="border border-gray-200 rounded-xl">
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

        <p className="border border-dashed border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-400 leading-relaxed bg-gray-50/50 mb-4">
          対応記録の新規入力はこの画面では行いません（表示のみ）。入力は日常の対応記録画面から。
        </p>
      </div>
    </div>
  );
}
