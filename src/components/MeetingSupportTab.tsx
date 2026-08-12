import { problemTagsForDomain } from '../data/students';
import DomainSelector from './DomainSelector';
import MeetingStudentSummary from './MeetingStudentSummary';
import SuggestionCard from './SuggestionCard';
import type { DomainSuggestionGroup, Student, SupportCategory, SupportSuggestion } from '../types';

/**
 * タブ④「領域と支援候補」。本プロトタイプの中心。
 *
 * 「どの領域が重いか → その領域に対応できる支援 → アクションとして登録」までを
 * この面だけで終える。支援候補は常時表示する（ボタンで開くウィンドウにすると、
 * 既存事業と地域の支援を見比べながら決められなくなる）。
 *
 * 他のタブと同じく、ここも1画面に収めようとしない。領域セレクターを固定して
 * 候補一覧だけを内側でスクロールさせる作りにしていたが、カードは情報量が多く
 * 決まった高さに収めるのが窮屈だった。①②③と揃え、タブ全体を縦スクロールにする。
 */
export default function MeetingSupportTab({
  student,
  groups,
  activeGroup,
  registeredSupportIds,
  onSelectDomain,
  onOpenDetail,
  onRegisterAction,
}: {
  student: Student;
  groups: DomainSuggestionGroup[];
  activeGroup?: DomainSuggestionGroup;
  /** すでにアクションとして登録済みの支援。ボタンの出し分けに使う */
  registeredSupportIds: string[];
  onSelectDomain: (domain: SupportCategory) => void;
  onOpenDetail: (supportId: string) => void;
  onRegisterAction: (suggestion: SupportSuggestion) => void;
}) {
  // その領域にスコアが付いた根拠（先生の実感と繋げるために出す）
  const activeTags = activeGroup ? problemTagsForDomain(student, activeGroup.domain) : [];

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="flex flex-col gap-3">
        <MeetingStudentSummary student={student} />

        {groups.length === 0 ? (
          <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl px-6 py-8 text-center">
            この状態に対応する登録済み支援がありません
          </p>
        ) : (
          <>
            <div>
              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <h3 className="text-sm font-bold text-yoss-dark">どの領域が重いか</h3>
                <p className="text-xs text-gray-500">
                  領域を選ぶと、対応できる支援が下に出ます（先生の追加入力はありません）
                </p>
              </div>
              <DomainSelector
                scores={student.scores}
                groups={groups}
                activeDomain={activeGroup?.domain}
                onSelect={onSelectDomain}
              />
            </div>

            {activeGroup && (
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-yoss-dark">
                    {activeGroup.domain} {activeGroup.score}pt に対応できる支援
                    <span className="ml-1 text-yoss-yellow-dark">
                      {activeGroup.suggestions.length}件
                    </span>
                  </h3>
                  <span className="text-xs text-gray-500">スクリーニングでの該当：</span>
                  {activeTags.length > 0 ? (
                    activeTags.map(tag => (
                      <span key={tag} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">スクリーニング項目から算出</span>
                  )}
                  <span className="text-xs text-gray-500">／ レビュー評価が高い順</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {activeGroup.suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={suggestion.supportId}
                      suggestion={suggestion}
                      rank={index + 1}
                      activeDomain={activeGroup.domain}
                      isRegistered={registeredSupportIds.includes(suggestion.supportId)}
                      onOpenDetail={() => onOpenDetail(suggestion.supportId)}
                      onRegister={() => onRegisterAction(suggestion)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
