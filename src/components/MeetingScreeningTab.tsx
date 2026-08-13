import { useState } from 'react';
import { currentTerm, currentYear } from '../data/meeting';
import { previousMeetingMemo } from '../data/records';
import { SCREENING_OWNERS } from '../data/screening';
import MeetingStudentSummary from './MeetingStudentSummary';
import ScreeningDirectionPanel from './ScreeningDirectionPanel';
import ScreeningItemPanel from './ScreeningItemPanel';
import type { ScreeningOwner, Student } from '../types';

/**
 * タブ②のサブタブ。実物のスクリーニング画面の並びに合わせる。
 * 自由記述はタブ①が持っているのでここには置かない（同じものを2箇所に出さない）。
 */
type ScreeningView = '支援の現状' | ScreeningOwner | '会議記録';

const VIEWS: ScreeningView[] = ['支援の現状', ...SCREENING_OWNERS, '会議記録'];

/**
 * タブ②「スクリーニング／会議記録」。
 *
 * 実物と同じサブタブ構成。37項目は1画面に積まず、実物どおり入力する担当ごとに分かれる
 *   支援の現状 … 方向性 A/B/C ごとに、実際に何をしているかを 新／続／拒 で記録する面
 *   データ　　 … ①転入 ②欠席日数 ③不登校期間あり ④7日以上の欠席
 *   学級／特別支援／養護／事務／管理職・生指／地域・調査 … その担当が入力する項目
 *   会議記録　 … 前学期の判定・会議メモ・個人メモ・過去のチーム会議
 *
 * 今回の会議で決めたことは右ドロワーとタブ⑤に一本化しているので、ここには置かない。
 */
export default function MeetingScreeningTab({
  student,
  onGoToSupport,
}: {
  student: Student;
  onGoToSupport: () => void;
}) {
  const [view, setView] = useState<ScreeningView>('支援の現状');

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="flex flex-col gap-3 mb-4">
        <MeetingStudentSummary student={student} />

        <div className="flex gap-1 flex-wrap">
          {VIEWS.map(item => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] border transition-colors ${
                item === view
                  ? 'bg-yoss-yellow border-yoss-yellow text-white font-bold'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
          {/* 地域の支援団体はスクリーニングの入力権限を持たない（実物と同じ） */}
          <span className="rounded-lg px-3.5 py-1.5 text-[13px] border border-dashed border-gray-200 text-gray-400">
            地域資源 ・権限なし
          </span>
        </div>

        {view === '支援の現状' && (
          <ScreeningDirectionPanel student={student} onGoToSupport={onGoToSupport} />
        )}

        {view === '会議記録' && (
          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-2">前学期 スクリーニング会議 ・ 判定</p>
              <span className="text-[13px] text-yoss-yellow-dark bg-yoss-yellow-light px-2.5 py-1.5 rounded">
                校内チーム会議へ
              </span>
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
          </div>
        )}

        {view !== '支援の現状' && view !== '会議記録' && (
          <ScreeningItemPanel student={student} owner={view} />
        )}
      </div>
    </div>
  );
}
