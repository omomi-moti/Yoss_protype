import { useMemo, useState } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { getSuggestions, groupSuggestionsByDomain, mockRecords } from '../data/mockData';
import { useOrganizationStore } from '../hooks/useOrganizationStore';
import { currentSchool } from '../data/schools';
import DomainSelector from '../components/DomainSelector';
import MeetingSearchStep from '../components/MeetingSearchStep';
import SuggestionCard from '../components/SuggestionCard';
import SupportDetailModal from '../components/SupportDetailModal';
import {
  filterStudents,
  problemTagsForDomain,
  scoreLevel,
  scoredDomains,
  studentsByScore,
  totalScore,
} from '../data/students';
import type { MeetingSearchCriteria, SupportCategory } from '../types';

// スコアの水準ごとのバッジ配色
const SCORE_STYLES = {
  high: 'bg-red-50 text-red-500',
  middle: 'bg-yellow-50 text-yellow-600',
  low: 'bg-gray-50 text-gray-500',
} as const;

const EMPTY_CRITERIA: MeetingSearchCriteria = {
  grades: [],
  classes: [],
  minScore: '',
  maxScore: '',
  directions: [],
  studentName: '',
};

/** 左の一覧の見出しに出す、適用中の条件 */
function describeCriteria(criteria: MeetingSearchCriteria): string {
  const parts = [
    criteria.grades.length > 0 ? criteria.grades.map(grade => `${grade}生`).join('・') : null,
    criteria.classes.length > 0 ? criteria.classes.join('・') : null,
    criteria.minScore !== '' || criteria.maxScore !== ''
      ? `${criteria.minScore || '下限なし'}〜${criteria.maxScore || '上限なし'}pt`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' / ') : '条件なし（全件）';
}

export default function MeetingPage() {
  const { published } = useOrganizationStore();
  const [criteria, setCriteria] = useState<MeetingSearchCriteria>(EMPTY_CRITERIA);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasNoResult, setHasNoResult] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<SupportCategory | null>(null);
  const [detailSupportId, setDetailSupportId] = useState<string | null>(null);

  // 検索結果がそのまま左の児童一覧になる
  const results = useMemo(() => filterStudents(studentsByScore, criteria), [criteria]);

  // 未選択のとき、および結果が変わって選択中の児童が消えたときは先頭に戻す
  const selectedStudent =
    results.find(student => student.id === selectedStudentId) ?? results[0];

  // 支援候補は児童の8領域スコアと、団体が公開している支援から導出する
  const domainGroups = useMemo(() => {
    if (!selectedStudent) return [];
    const suggestions = getSuggestions(selectedStudent.scores, published, mockRecords, currentSchool);
    return groupSuggestionsByDomain(suggestions, selectedStudent.scores);
  }, [selectedStudent, published]);

  // 未選択のとき、および児童を切り替えて選択中の領域が無くなったときは最重要領域に戻す
  const activeGroup =
    domainGroups.find(group => group.domain === selectedDomain) ?? domainGroups[0];

  // その領域にスコアが付いた根拠（先生の実感と繋げるために出す）
  const activeTags =
    selectedStudent && activeGroup ? problemTagsForDomain(selectedStudent, activeGroup.domain) : [];

  // 詳細モーダルの対象。支援と、それを提供する団体の両方が要る
  const detail = useMemo(() => {
    const suggestion = activeGroup?.suggestions.find(s => s.supportId === detailSupportId);
    const organization = published.find(org => org.id === suggestion?.organizationId);
    return suggestion && organization ? { suggestion, organization } : null;
  }, [detailSupportId, activeGroup, published]);

  // 検索するまでは条件の画面を出す。該当が0名のときは進めず、その場で知らせる
  if (!hasSearched) {
    return (
      <MeetingSearchStep
        criteria={criteria}
        hasNoResult={hasNoResult}
        onDismissNoResult={() => setHasNoResult(false)}
        onChange={setCriteria}
        onSearch={() => {
          if (results.length === 0) {
            setHasNoResult(true);
            return;
          }
          setHasNoResult(false);
          setHasSearched(true);
          setSelectedStudentId(null);
          setSelectedDomain(null);
        }}
      />
    );
  }

  const backToSearch = (
    <button
      onClick={() => setHasSearched(false)}
      className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-yoss-yellow hover:text-yoss-yellow-dark transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yoss-yellow/40"
    >
      <ChevronLeft size={14} />
      検索条件に戻る
    </button>
  );

  // 0名では検索ステップに留まるため、ここに来る時点で必ず1名以上いる
  if (!selectedStudent) return null;

  return (
    /*
      画面の高さに収める。候補が多くて入りきらない場合でもページ全体は動かさず、
      支援候補の一覧だけがスクロールする（児童・領域の選択は常に見えたままになる）。
      h-[calc(100vh-3rem)] の 3rem は main の padding。
    */
    <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] flex flex-col">
      {/* Page header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-600">学校向け</span>
          {/* 「御校 N件」の基準がどの学校なのかを画面上で示す */}
          <span className="text-[10px] text-gray-400">{currentSchool}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-yoss-dark">校内チーム会議 — 支援候補表示</h1>
          {backToSearch}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          スクリーニング結果と支援団体の登録データから、この児童に合った支援候補を自動表示します。
          <strong className="text-yoss-dark">先生の追加入力は一切ありません。</strong>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5 flex-1 min-h-0">
        {/* Left: Student list */}
        <div className="col-span-1 overflow-y-auto">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-xs font-bold text-gray-500">検索結果</h3>
                <span className="text-[10px] text-gray-400">{results.length}名</span>
              </div>
              <p className="text-[10px] text-gray-400 truncate" title={describeCriteria(criteria)}>
                {describeCriteria(criteria)}
              </p>
            </div>
            {results.map(student => (
              <button
                key={student.id}
                onClick={() => {
                  setSelectedStudentId(student.id);
                  // 児童を切り替えたら、その子の最重要領域から見せる
                  setSelectedDomain(null);
                }}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                  selectedStudent.id === student.id
                    ? 'bg-yoss-yellow-light border-l-2 border-l-yoss-yellow'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-yoss-dark">{student.grade} {student.number}番</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${SCORE_STYLES[scoreLevel(totalScore(student.scores))]}`}>
                    {totalScore(student.scores)}pt
                  </span>
                </div>
                {/* スコアが高い領域 */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {scoredDomains(student.scores).slice(0, 2).map(domain => (
                    <span key={domain} className="text-[9px] font-bold bg-yoss-yellow-light text-yoss-yellow-dark px-1.5 py-0.5 rounded">
                      {domain} {student.scores[domain]}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {student.problems.map(p => (
                    <span key={p} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Support suggestions */}
        <div className="col-span-3 flex flex-col gap-4 min-h-0">
          {/* Student summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shrink-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-yoss-dark">
                  {selectedStudent.grade} {selectedStudent.number}番
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedStudent.notes}</p>
              </div>
              <div className={`text-lg font-bold px-3 py-1 rounded-lg shrink-0 ${SCORE_STYLES[scoreLevel(totalScore(selectedStudent.scores))]}`}>
                合計 {totalScore(selectedStudent.scores)}pt
              </div>
            </div>
            {/*
              スクリーニングのタグは左の児童一覧と領域見出しの「該当」で出しているため、
              ここでは繰り返さない
            */}
            <p className="text-[11px] text-gray-400">
              現在の支援方針：{selectedStudent.currentSupport}
            </p>
          </div>

          {/* Support suggestions header */}
          <div className="flex items-baseline gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-yoss-yellow shrink-0" />
              <h3 className="text-sm font-bold text-yoss-dark">
                この児童の状態に対して、○○市で利用可能な支援
              </h3>
            </div>
            <p className="text-[11px] text-gray-400">
              領域を選ぶと、その領域に対応できる団体がレビュー評価の高い順に出ます
            </p>
          </div>

          {domainGroups.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-400">この状態に対応する登録済み支援がありません</p>
            </div>
          ) : (
            <>
              {/* 8領域のスコア表示と領域の選択を1つにまとめたもの */}
              <div className="shrink-0">
                <DomainSelector
                  scores={selectedStudent.scores}
                  groups={domainGroups}
                  activeDomain={activeGroup?.domain}
                  onSelect={setSelectedDomain}
                />
              </div>

              {activeGroup && (
                <div className="flex-1 min-h-0 flex flex-col">
                  {/* 選択中の領域：なぜこの領域の支援を出しているのかを示す */}
                  <div className="flex items-center gap-2 flex-wrap mb-3 shrink-0">
                    <h4 className="text-sm font-bold text-yoss-dark">
                      {activeGroup.domain} {activeGroup.score}pt に対応できる支援
                    </h4>
                    <span className="text-[11px] text-gray-400">スクリーニングでの該当：</span>
                    {activeTags.length > 0 ? (
                      activeTags.map(tag => (
                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-400">スクリーニング項目から算出</span>
                    )}
                  </div>

                  {/*
                    横幅を使って並べる。1枚あたりの幅を絞ることでカード内の視線が縦1本で済み、
                    候補が3件までは1行に収まる。4件以上でここだけがスクロールする。
                  */}
                  <div
                    className={`grid gap-4 flex-1 min-h-0 overflow-y-auto content-start pr-1 ${
                      activeGroup.suggestions.length > 2 ? 'grid-cols-3' : 'grid-cols-2'
                    }`}
                  >
                    {activeGroup.suggestions.map((suggestion, index) => (
                      <SuggestionCard
                        key={suggestion.supportId}
                        suggestion={suggestion}
                        rank={index + 1}
                        onOpenDetail={() => setDetailSupportId(suggestion.supportId)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {detail && (
        <SupportDetailModal
          suggestion={detail.suggestion}
          organization={detail.organization}
          studentTags={selectedStudent.problems}
          onClose={() => setDetailSupportId(null)}
        />
      )}
    </div>
  );
}
