import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { currentTerm, currentYear } from '../data/meeting';
import { previousMeetingMemo } from '../data/records';
import { SCREENING_OWNERS } from '../data/screening';
import MeetingStudentSummary from './MeetingStudentSummary';
import ScreeningDirectionPanel from './ScreeningDirectionPanel';
import ScreeningItemPanel from './ScreeningItemPanel';
import ScreeningOverviewPanel from './ScreeningOverviewPanel';
import type { DirectionItem, Organization, ScreeningOwner, Student } from '../types';

/**
 * タブ②のサブタブ。実物のスクリーニング画面の並びに合わせる。
 * 自由記述はタブ①が持っているのでここには置かない（同じものを2箇所に出さない）。
 *
 * 「全項目一覧」だけは入力面ではなく表示の切り替え。実物の一覧画面にあたるもので、
 * 入力面ごとに分かれた37項目を1画面にまとめて見渡すためにある。
 */
const OVERVIEW = '全項目一覧';

type ScreeningView = '支援の現状' | ScreeningOwner | typeof OVERVIEW | '会議記録';

/**
 * 入力面のタブ。並びは実物どおり。
 * 「全項目一覧」はデータの次に挟むので、そこで前後に分ける。
 */
const OWNERS_BEFORE_OVERVIEW: ScreeningOwner[] = ['データ'];
const OWNERS_AFTER_OVERVIEW = SCREENING_OWNERS.filter(
  owner => !OWNERS_BEFORE_OVERVIEW.includes(owner)
);

const TAB_CLASS = 'rounded-lg px-3.5 py-1.5 text-[13px] border transition-colors';

function tabStyle(isActive: boolean): string {
  return isActive
    ? 'bg-gray-700 border-gray-700 text-white font-bold'
    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300';
}

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
  organizations,
  onGoToSupport,
}: {
  student: Student;
  /** 公開中の団体。「支援の現状」B項目の隣の件数を数えるのに使う */
  organizations: Organization[];
  /** タブ④へ送る。B項目を渡すと、その領域を開いたうえで項目の支援だけに絞り込む */
  onGoToSupport: (item?: DirectionItem) => void;
}) {
  const [view, setView] = useState<ScreeningView>('支援の現状');

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="flex flex-col gap-3 mb-4">
        <MeetingStudentSummary student={student} />

        <div className="flex gap-1 flex-wrap items-center">
          <button
            onClick={() => setView('支援の現状')}
            className={`${TAB_CLASS} ${tabStyle(view === '支援の現状')}`}
          >
            支援の現状
          </button>

          {OWNERS_BEFORE_OVERVIEW.map(item => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`${TAB_CLASS} ${tabStyle(item === view)}`}
            >
              {item}
            </button>
          ))}

          {/* 前後を区切る。これだけは入力面ではなく表示の切り替えなので、並びから浮かせる */}
          <span className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={() => setView(OVERVIEW)}
            className={`${TAB_CLASS} flex items-center gap-1.5 ${tabStyle(view === OVERVIEW)}`}
            title="37項目を入力面ごとに並べて1画面で見渡します"
          >
            <LayoutGrid size={13} />
            {OVERVIEW}
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1" />

          {OWNERS_AFTER_OVERVIEW.map(item => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`${TAB_CLASS} ${tabStyle(item === view)}`}
            >
              {item}
            </button>
          ))}

          <button
            onClick={() => setView('会議記録')}
            className={`${TAB_CLASS} ${tabStyle(view === '会議記録')}`}
          >
            会議記録
          </button>

          {/* 地域の支援団体はスクリーニングの入力権限を持たない（実物と同じ） */}
          <span className="rounded-lg px-3.5 py-1.5 text-[13px] border border-dashed border-gray-200 text-gray-400">
            地域資源 ・権限なし
          </span>
        </div>

        {view === '支援の現状' && (
          <ScreeningDirectionPanel
            student={student}
            organizations={organizations}
            onGoToSupport={onGoToSupport}
          />
        )}

        {view === '会議記録' && (
          <div className="grid grid-cols-2 gap-3 items-start">
            <div className="border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-2">前学期 スクリーニング会議 ・ 判定</p>
              <span className="text-[13px] text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded">
                校内チーム会議へ
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-2">過去のチーム会議</p>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[13px] text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded">
                  {currentYear} 1学期
                </span>
                <span className="text-[13px] text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded">
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

        {view === OVERVIEW && <ScreeningOverviewPanel student={student} />}

        {view !== '支援の現状' && view !== '会議記録' && view !== OVERVIEW && (
          <ScreeningItemPanel student={student} owner={view} />
        )}
      </div>
    </div>
  );
}
