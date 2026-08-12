import { problemTagsForDomain } from '../data/students';
import DomainSelector from './DomainSelector';
import MeetingStudentSummary from './MeetingStudentSummary';
import SuggestionCard from './SuggestionCard';
import type { DomainSuggestionGroup, Student, SupportCategory, SupportSuggestion } from '../types';

/**
 * タブ②「領域と支援候補」。本プロトタイプの中心。
 *
 * 「どの領域が重いか → その領域に対応できる支援 → アクションとして登録」までを
 * この面だけで終える。支援候補は常時表示する（ボタンで開くウィンドウにすると、
 * 既存事業と地域の支援を見比べながら決められなくなる）。
 *
 * タブ①④と違い、ここは1画面に収める作りを残す。領域を選んでから候補を見比べる
 * という操作の途中で、選んだ領域（8領域タイル）が見えなくなると迷子になるため。
 * スクロールするのは支援候補の一覧だけで、それ以外は常に見えたままにする。
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
    <div className="h-full flex flex-col gap-3 px-6 py-4 min-h-0">
      <MeetingStudentSummary student={student} />

      {groups.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl px-6 py-8">
            この状態に対応する登録済み支援がありません
          </p>
        </div>
      ) : (
        <>
          <div className="shrink-0">
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

          {/*
            見出し・カード・件数によって高さが決まるので、この一続きだけを
            スクロール領域にする（見出しをカードと切り離して固定しない）。
            列は常に2列。カードは評価・説明・利用条件・連絡先・操作まで持つので、
            3列にすると1枚が狭くなって読みにくい。件数が多い分はここだけが縦スクロールする。
          */}
          {activeGroup && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <div className="flex items-baseline gap-2 flex-wrap mb-2">
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

              <div className="grid grid-cols-2 gap-3 content-start">
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
  );
}
