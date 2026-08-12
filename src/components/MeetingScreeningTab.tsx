import { useState } from 'react';
import { currentTerm, currentYear } from '../data/meeting';
import { STAFF_ROLES, previousMeetingMemo, screeningRows } from '../data/records';
import MeetingStudentSummary from './MeetingStudentSummary';
import type { StaffRole, Student } from '../types';

/**
 * タブ②「スクリーニング／会議記録」。
 *
 * 実物の担当別タブの構造をそのまま残し、1行＝1項目で「入力 → AI判定」を横に並べる。
 * 会議での決定は右ドロワー（この会議で決めたこと）に一本化しているので、
 * ここには決定のチェック欄を置かない。同じ決定を2箇所で持つと食い違うため。
 *
 * タブ①と同じ理由で、ここも1画面に収めようとしない。項目数は担当によって変わり、
 * 右の会議記録も件数が増えていくものなので、高さを固定した2ペインに押し込めるより
 * タブ全体を縦スクロールさせたほうが、どちらの列も窮屈にならない。
 */
export default function MeetingScreeningTab({ student }: { student: Student }) {
  const [role, setRole] = useState<StaffRole>('担任');
  const rows = screeningRows(student, role);

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="flex flex-col gap-3">
        <MeetingStudentSummary student={student} />

        <div className="grid grid-cols-[1.9fr_1fr] gap-5 items-start">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5 flex-wrap">
              {STAFF_ROLES.map(staffRole => (
                <button
                  key={staffRole}
                  onClick={() => setRole(staffRole)}
                  className={`rounded-lg px-3 py-1.5 text-[13px] border transition-colors ${
                    staffRole === role
                      ? 'bg-yoss-yellow border-yoss-yellow text-white font-bold'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {staffRole}
                </button>
              ))}
              {/* 地域の支援団体はスクリーニングの入力権限を持たない（実物と同じ） */}
              <span className="rounded-lg px-3 py-1.5 text-[13px] border border-dashed border-gray-200 text-gray-400">
                地域 ・権限なし
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_5rem_6rem] bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                <div className="px-4 py-2.5">項目（{role}入力）</div>
                <div className="px-2 py-2.5">入力</div>
                <div className="px-2 py-2.5">AI判定</div>
              </div>

              {rows.map(row => (
                <div
                  key={row.item}
                  className="grid grid-cols-[1fr_5rem_6rem] items-center border-b border-gray-50 text-[13px]"
                >
                  <div className="px-4 py-2.5 text-gray-700">{row.item}</div>
                  <div className={`px-2 py-2.5 ${row.hasInput ? 'text-gray-600' : 'text-gray-300'}`}>
                    {row.hasInput ? 'あり' : 'なし'}
                  </div>
                  <div className="px-2 py-2.5">
                    {row.judgement ? (
                      <span
                        className={`text-[11px] font-bold px-2 py-1 rounded ${
                          row.judgement === '要注意'
                            ? 'bg-yoss-yellow-light text-yoss-yellow-dark'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {row.judgement}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </div>
                </div>
              ))}

              {/* 権限で見せられない行も残す。空欄が「抜け漏れ」に見えないようにするため */}
              {role !== '事務' && (
                <div className="grid grid-cols-[1fr_5rem_6rem] items-center bg-gray-50/60 text-[13px]">
                  <div className="px-4 py-2.5 text-gray-400">経済状況に関する項目</div>
                  <div className="px-2 py-2.5 text-xs text-gray-300">権限外</div>
                  <div className="px-2 py-2.5 text-xs text-gray-300">非表示</div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              灰色の行は権限により非表示です（事務・管理職のみ閲覧可）。
              会議で決めたことは右の「この会議で決めたこと」に記録します。
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <h3 className="text-sm font-bold text-yoss-dark">スクリーニング会議での記録</h3>

            <div className="border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-2">前学期 スクリーニング会議 ・ 判定</p>
              <span className="text-[13px] text-yoss-yellow-dark bg-yoss-yellow-light px-2.5 py-1.5 rounded">
                校内チーム会議へ
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1.5">会議メモ（前学期）</p>
              <p className="text-[13px] text-gray-700 leading-relaxed">{previousMeetingMemo(student)}</p>
            </div>

            <div className="border border-dashed border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50">
              <p className="text-xs text-gray-400 mb-1.5">個人メモ ・ 表示のみ</p>
              <p className="text-[13px] text-gray-400 leading-relaxed">
                入力者本人以外には表示されません。
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-2">過去のチーム会議</p>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[13px] text-yoss-yellow-dark border border-gray-200 px-2.5 py-1.5 rounded">
                  {currentYear} 1学期
                </span>
                <span className="text-[13px] text-yoss-yellow-dark border border-gray-200 px-2.5 py-1.5 rounded">
                  前年度 3学期
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                いま検討しているのは {currentYear} {currentTerm} の会議です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
