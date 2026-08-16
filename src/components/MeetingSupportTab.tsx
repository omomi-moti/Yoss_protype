import { problemTagsForDomain } from '../data/students';
import DomainSelector from './DomainSelector';
import MeetingStudentSummary from './MeetingStudentSummary';
import SuggestionCard from './SuggestionCard';
import type {
  DirectionItem,
  DomainSuggestionGroup,
  Student,
  SupportCategory,
  SupportSuggestion,
} from '../types';

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
  supportCounts,
  directionFilter,
  unfilteredCount,
  onClearDirectionFilter,
  registeredSupportIds,
  onSelectDomain,
  onOpenDetail,
  onRegisterAction,
}: {
  student: Student;
  groups: DomainSuggestionGroup[];
  activeGroup?: DomainSuggestionGroup;
  /** 領域ごとの支援の登録件数。8領域すべてのタイルを出すのに使う */
  supportCounts: Record<SupportCategory, number>;
  /** 「支援の現状」のB項目から来ているときの絞り込み */
  directionFilter: DirectionItem | null;
  /** 絞り込みを解除したときに見える件数 */
  unfilteredCount: number;
  onClearDirectionFilter: () => void;
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
                  色が付いているのがこの児童に必要な領域です。
                  どの領域も選べます（先生の追加入力はありません）
                </p>
              </div>
              <DomainSelector
                scores={student.scores}
                supportCounts={supportCounts}
                activeDomain={activeGroup?.domain}
                onSelect={onSelectDomain}
              />
            </div>

            {activeGroup && (
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-yoss-dark">
                    {activeGroup.domain} {activeGroup.score}pt に対応できる支援
                    <span className="ml-1 text-gray-600">
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

                {/*
                  「支援の現状」のB項目から名指しで開いた領域は、スコア0でもここに出す。
                  地域にその支援があること自体は児童のスコアと関係ない事実なので、
                  出したうえで「今学期の優先度は高くない」と添える。
                */}
                {activeGroup.score === 0 && (
                  <p className="text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg px-3 py-2">
                    この児童の「{activeGroup.domain}」は今学期0点で、優先して手を打つ領域ではありません。
                    地域にこの領域の支援が登録されているため、参考として出しています。
                  </p>
                )}

                {/*
                  B項目から来ているときの絞り込み。B項目は8領域より細かいので、
                  項目に出ていた件数と領域全体の件数が食い違う。どちらの数字も
                  ここで説明して、解除すれば領域全体に戻れるようにする。
                */}
                {directionFilter && (
                  <div className="flex items-center gap-3 flex-wrap border border-yoss-yellow/40 bg-yoss-yellow-light/50 rounded-lg px-3 py-2">
                    <span className="text-xs text-yoss-dark">
                      「支援の現状」B{directionFilter.index} {directionFilter.label} に対応する支援だけを表示中
                    </span>
                    <button
                      onClick={onClearDirectionFilter}
                      className="text-xs font-bold text-yoss-link hover:underline"
                    >
                      解除して{activeGroup.domain}の全{unfilteredCount}件を見る
                    </button>
                  </div>
                )}

                {activeGroup.suggestions.length === 0 && (
                  <p className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl px-6 py-8 text-center leading-relaxed">
                    この項目に対応する支援は、地域からまだ登録されていません。
                    <br />
                    チェックを入れても、繋ぎ先の団体はシステムのどこにもない状態です。
                  </p>
                )}

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
