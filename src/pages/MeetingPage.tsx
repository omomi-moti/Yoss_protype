import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, SlidersHorizontal } from 'lucide-react';
import { getSuggestions, groupSuggestionsByDomain } from '../data/mockData';
import { useOrganizationStore } from '../hooks/useOrganizationStore';
import { countSupportsPerDomain } from '../data/organizations';
import { currentSchool } from '../data/schools';
import {
  DIRECTIONS,
  MEETING_TABS,
  actionFromSuggestion,
  currentTerm,
  currentYear,
  emptyDecision,
  nowLabel,
  recommendedDirections,
} from '../data/meeting';
import MeetingDecisionPanel from '../components/MeetingDecisionPanel';
import MeetingDecisionTab from '../components/MeetingDecisionTab';
import MeetingDrawer from '../components/MeetingDrawer';
import MeetingRecordTab from '../components/MeetingRecordTab';
import MeetingScreeningTab from '../components/MeetingScreeningTab';
import MeetingSearchStep from '../components/MeetingSearchStep';
import MeetingSituationTab from '../components/MeetingSituationTab';
import MeetingStudentBar from '../components/MeetingStudentBar';
import MeetingStudentList from '../components/MeetingStudentList';
import MeetingSupportTab from '../components/MeetingSupportTab';
import SupportDetailModal from '../components/SupportDetailModal';
import { filterStudents, specialistScore, studentsByScore } from '../data/students';
import type {
  DirectionItem,
  MeetingDecision,
  MeetingSearchCriteria,
  MeetingTab,
  SupportCategory,
  SupportDirection,
  SupportSuggestion,
} from '../types';

const EMPTY_CRITERIA: MeetingSearchCriteria = {
  grades: [],
  classes: [],
  minScore: '',
  maxScore: '',
  directions: [],
  studentName: '',
};

/** 絞り込みバーに出す、適用中の条件 */
function describeCriteria(criteria: MeetingSearchCriteria): string {
  const parts = [
    criteria.grades.length > 0 ? criteria.grades.map(grade => `${grade}生`).join('・') : '全学年',
    criteria.classes.length > 0 ? criteria.classes.join('・') : '全組',
    criteria.minScore !== '' || criteria.maxScore !== ''
      ? `${criteria.minScore || '下限なし'}〜${criteria.maxScore || '上限なし'}pt`
      : null,
  ].filter(Boolean);

  return parts.join(' ／ ');
}

/**
 * 校内チーム会議（画面D）。
 *
 * 実物と同じ4つのタブを持ち、ページ全体はビューポート高に収める（投影して使うため）。
 * 児童の切り替えは上部のバー、全件の一覧は左ドロワー、会議の決定は右ドロワーに置く。
 * どちらのドロワーも中央を押し出さず重ねるので、開閉しても検討中の記述の行送りが変わらない。
 */
export default function MeetingPage() {
  const { published } = useOrganizationStore();
  const [criteria, setCriteria] = useState<MeetingSearchCriteria>(EMPTY_CRITERIA);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasNoResult, setHasNoResult] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<SupportCategory | null>(null);
  const [detailSupportId, setDetailSupportId] = useState<string | null>(null);
  const [tab, setTab] = useState<MeetingTab>('situation');
  const [isListOpen, setIsListOpen] = useState(false);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  /*
    「支援の現状」のB項目から来たときの絞り込み。
    B項目は8領域より細かいので、領域だけで開くと項目に出した件数と中身が食い違う
    （B①家庭教育支援は2件だが、家庭状況の領域には3件ある）。押した項目の支援だけに
    絞り、解除すれば領域全体に戻せるようにする。
  */
  const [directionFilter, setDirectionFilter] = useState<DirectionItem | null>(null);
  // 会議の決定は児童ごとに持つ。児童を移動しても、戻れば決めたことが残っている
  const [decisions, setDecisions] = useState<Record<string, MeetingDecision>>({});

  // 検索結果がそのまま検討する児童の並びになる
  const results = useMemo(() => filterStudents(studentsByScore, criteria), [criteria]);

  // 未選択のとき、および結果が変わって選択中の児童が消えたときは先頭に戻す
  const selectedStudent =
    results.find(student => student.id === selectedStudentId) ?? results[0];

  /*
    支援候補は児童の8領域スコアと、団体が公開している支援から導出する。
    selectedDomain を渡すのは、「支援の現状」のB項目から領域を名指しで開いたとき、
    その領域のスコアが0でも候補を出すため（mockData.ts の targetDomains 参照）。
    タブ④のタイルから選んだ場合はスコアが付いた領域しか押せないので、渡しても何も変わらない。
  */
  const domainGroups = useMemo(() => {
    if (!selectedStudent) return [];
    const open = selectedDomain ?? undefined;
    const suggestions = getSuggestions(selectedStudent.scores, published, currentSchool, open);
    return groupSuggestionsByDomain(suggestions, selectedStudent.scores, open);
  }, [selectedStudent, published, selectedDomain]);

  // 未選択のとき、および児童を切り替えて選択中の領域が無くなったときは最重要領域に戻す
  const domainGroup =
    domainGroups.find(group => group.domain === selectedDomain) ?? domainGroups[0];

  // B項目から来ているときは、その項目の支援だけに絞る
  const activeGroup = useMemo(() => {
    if (!domainGroup || !directionFilter?.supportIds) return domainGroup;
    const ids = new Set(directionFilter.supportIds);
    return {
      ...domainGroup,
      suggestions: domainGroup.suggestions.filter(s => ids.has(s.supportId)),
    };
  }, [domainGroup, directionFilter]);

  // 8領域すべてのタイルを出すための件数。児童のスコアとは無関係に数える
  const supportCounts = useMemo(() => countSupportsPerDomain(published), [published]);

  // 詳細モーダルの対象。支援と、それを提供する団体の両方が要る
  const detail = useMemo(() => {
    const suggestion = activeGroup?.suggestions.find(s => s.supportId === detailSupportId);
    const organization = published.find(org => org.id === suggestion?.organizationId);
    return suggestion && organization ? { suggestion, organization } : null;
  }, [detailSupportId, activeGroup, published]);

  // Esc でドロワーを閉じる（詳細モーダルが開いているときは、そちらが先に閉じる）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || detailSupportId) return;
      setIsListOpen(false);
      setIsDecisionOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [detailSupportId]);

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
          setTab('situation');
        }}
      />
    );
  }

  // 0名では検索ステップに留まるため、ここに来る時点で必ず1名以上いる
  if (!selectedStudent) return null;

  const decision = decisions[selectedStudent.id] ?? emptyDecision;
  const registeredSupportIds = decision.actions.map(action => action.supportId);

  /** 決定の更新は必ずここを通す（保存時刻を一緒に動かすため） */
  const updateDecision = (patch: Partial<MeetingDecision>) => {
    setDecisions(previous => ({
      ...previous,
      [selectedStudent.id]: {
        ...(previous[selectedStudent.id] ?? emptyDecision),
        ...patch,
        savedAt: nowLabel(),
      },
    }));
  };

  const toggleDirection = (direction: SupportDirection) => {
    updateDecision({
      directions: decision.directions.includes(direction)
        ? decision.directions.filter(value => value !== direction)
        : [...decision.directions, direction],
    });
  };

  /**
   * 支援候補をアクションに送る。方向性 B（地域資源の活用）も同時に立てる。
   * 地域の団体の支援を選んだ時点で B は決まっているので、先生に選び直させない。
   */
  const registerAction = (suggestion: SupportSuggestion) => {
    updateDecision({
      actions: [...decision.actions, actionFromSuggestion(suggestion)],
      directions: decision.directions.includes('B')
        ? decision.directions
        : [...decision.directions, 'B'],
    });
    setIsDecisionOpen(true);
  };

  /**
   * タブの移動は必ずここを通す。
   * 領域の選択は基本持ち越さない。タブを行き来したあとも、その児童のいちばん重い領域
   * から見直せるようにする（前に見ていた領域のまま戻ると、選び直したのか元のままなのか
   * 分からなくなる）。
   *
   * 例外は domain を渡したとき（「支援の現状」のB項目から遷移するとき）。
   * どの項目から来たかが分かっているので、その領域を開いた状態でタブ④へ送る。
   * 児童がその領域にスコアを持たない場合は activeGroup の選出でいちばん重い領域に
   * 自然に戻る（MeetingPage の activeGroup 参照）。
   */
  const selectTab = (next: MeetingTab, domain?: SupportCategory) => {
    setTab(next);
    setSelectedDomain(domain ?? null);
    setDirectionFilter(null);
  };

  /**
   * 「支援の現状」のB項目からタブ④へ送る。
   * 項目に対応する領域を開いたうえで、その項目の支援だけに絞る。項目を渡さないときは
   * 絞り込みなしで、いちばん重い領域から開く。
   */
  const openSupportFor = (item?: DirectionItem) => {
    setTab('support');
    setSelectedDomain(item?.domains?.[0] ?? null);
    setDirectionFilter(item ?? null);
  };

  const selectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    // 児童を切り替えたら、その子の最重要領域から見せる
    setSelectedDomain(null);
    setDirectionFilter(null);
    // タブは①に戻す。前の児童のタブ位置のままだと、状況を確認しないまま
    // 支援候補や対応記録に進んでしまう
    setTab('situation');
  };

  const recommended = recommendedDirections(
    domainGroups.length > 0,
    specialistScore(selectedStudent.scores)
  );

  // 記録をつける面。タブ⑤は同じ decision を読むだけで、入力はここに集約する
  const decisionPanel = (
    <MeetingDecisionPanel
      decision={decision}
      recommended={recommended}
      onToggleDirection={toggleDirection}
      onRemoveAction={actionId =>
        updateDecision({
          actions: decision.actions.filter(action => action.id !== actionId),
        })
      }
      onChangeMemo={memo => updateDecision({ memo })}
      onAddFromSupport={() => {
        selectTab('support');
        setIsDecisionOpen(false);
      }}
      // 変更のたびに保存されているので、保存時刻を今にして記録を閉じるだけ
      onSave={() => {
        updateDecision({});
        setIsDecisionOpen(false);
      }}
    />
  );

  return (
    /*
      h-[calc(100vh-3rem)] の 3rem は main の padding。ページ全体はスクロールさせない。
      overflow-clip は overflow-hidden と違ってスクロールコンテナを作らない。hidden だと
      閉じているドロワー（枠の外に逃がしてある）がスクロール範囲を作り、フォーカス移動で
      中身ごと横にずれる。
    */
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-white rounded-xl border border-gray-200 overflow-clip relative">
      {/* 会議のモード。実物と同じ3つを出すが、中身を持つのは校内チーム会議だけ */}
      <div className="shrink-0 flex items-center gap-4 px-6 py-3 border-b border-gray-100">
        <h1 className="text-lg font-bold text-yoss-dark">校内チーム会議 ・ 実施</h1>
        <span className="text-xs text-gray-400">
          {currentSchool} ／ {currentYear} {currentTerm}
        </span>
        <div className="ml-auto flex gap-2">
          <span className="rounded-lg border border-gray-100 px-3 py-1.5 text-[13px] text-gray-300">
            スクリーニング会議を準備
          </span>
          <span className="rounded-lg border border-gray-100 px-3 py-1.5 text-[13px] text-gray-300">
            スクリーニング会議を実施
          </span>
          <span className="rounded-lg bg-yoss-yellow px-3 py-1.5 text-[13px] font-bold text-white">
            校内チーム会議
          </span>
        </div>
      </div>

      {/* 絞り込み条件。会議中も、いま誰を対象にしているのかが見えたままになる */}
      <div className="shrink-0 flex items-center gap-4 px-6 py-2.5 bg-yoss-yellow-light/50 border-b border-yoss-yellow/20">
        <span className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-yoss-yellow-dark">
          <SlidersHorizontal size={13} />
          絞り込み
        </span>
        <span className="text-[13px] text-gray-600 truncate">
          {currentYear} ／ {currentTerm} ／ {describeCriteria(criteria)} ／ 該当 {results.length}名
        </span>
        <button
          onClick={() => setHasSearched(false)}
          className="ml-auto shrink-0 rounded-lg border border-yoss-yellow/40 bg-white px-3 py-1.5 text-xs font-bold text-yoss-yellow-dark hover:border-yoss-yellow transition-colors"
        >
          条件を変更
        </button>
      </div>

      <MeetingStudentBar
        students={results}
        activeStudent={selectedStudent}
        onSelect={selectStudent}
        onOpenList={() => setIsListOpen(true)}
      />

      <div className="shrink-0 flex items-end gap-1 px-6 border-b border-gray-100">
        {MEETING_TABS.map(meetingTab => (
          <button
            key={meetingTab.key}
            onClick={() => selectTab(meetingTab.key)}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2.5 text-[13px] border-b-[3px] transition-colors ${
              meetingTab.key === tab
                ? 'border-yoss-yellow font-bold text-yoss-yellow-dark'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {meetingTab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {tab === 'situation' && (
          <MeetingSituationTab student={selectedStudent} onGoToRecords={() => selectTab('record')} />
        )}
        {tab === 'support' && (
          <MeetingSupportTab
            student={selectedStudent}
            groups={domainGroups}
            activeGroup={activeGroup}
            supportCounts={supportCounts}
            directionFilter={directionFilter}
            unfilteredCount={domainGroup?.suggestions.length ?? 0}
            onClearDirectionFilter={() => setDirectionFilter(null)}
            registeredSupportIds={registeredSupportIds}
            // 領域を選び直したら、B項目の絞り込みは外す
            onSelectDomain={domain => {
              setSelectedDomain(domain);
              setDirectionFilter(null);
            }}
            onOpenDetail={setDetailSupportId}
            onRegisterAction={registerAction}
          />
        )}
        {tab === 'record' && <MeetingRecordTab student={selectedStudent} />}
        {tab === 'screening' && (
          <MeetingScreeningTab
            student={selectedStudent}
            organizations={published}
            onGoToSupport={openSupportFor}
          />
        )}
        {tab === 'decision' && (
          <MeetingDecisionTab
            student={selectedStudent}
            decision={decision}
            onOpenRecorder={() => setIsDecisionOpen(true)}
          />
        )}
      </div>

      {/*
        決定のサマリー。ドロワーを閉じていても「まだ何も決めていない」ことが見える。
        タブの外に置いているので、タブを切り替えても消えない。
      */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3 border-t border-gray-100 bg-gray-50/70">
        <span className="shrink-0 text-xs text-gray-500">この会議で決めたこと</span>
        <div className="shrink-0 flex gap-1">
          {DIRECTIONS.map(direction => {
            const isChecked = decision.directions.includes(direction.key);

            return (
              <span
                key={direction.key}
                className={`text-xs font-bold px-2 py-1 rounded ${
                  isChecked ? 'bg-yoss-yellow text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {direction.key}
              </span>
            );
          })}
        </div>
        <span className="shrink-0 text-[13px] text-gray-600">
          アクション {decision.actions.length}件
        </span>
        <span className="shrink-0 text-xs text-gray-400">
          {decision.savedAt ? `保存しました ${decision.savedAt}` : 'まだ決定はありません'}
        </span>
        {/* 記録するのはドロワー側。決めた結果を読むのはタブ⑤ */}
        <button
          onClick={() => setIsDecisionOpen(!isDecisionOpen)}
          className="ml-auto shrink-0 flex items-center gap-1.5 rounded-lg bg-yoss-yellow px-4 py-2 text-[13px] font-bold text-white hover:bg-yoss-yellow-dark transition-colors"
        >
          <ClipboardList size={14} />
          {isDecisionOpen ? '記録を閉じる' : 'この会議の記録をつける'}
        </button>
      </div>

      <MeetingDrawer
        side="left"
        isOpen={isListOpen}
        title={`検索結果 ${results.length}名`}
        subtitle="合計pt降順"
        onClose={() => setIsListOpen(false)}
        dismissOnOutsideClick
      >
        <MeetingStudentList
          students={results}
          activeStudentId={selectedStudent.id}
          onSelect={selectStudent}
        />
      </MeetingDrawer>

      <MeetingDrawer
        side="right"
        isOpen={isDecisionOpen}
        title="この会議で決めたこと"
        subtitle={`${selectedStudent.grade} ${selectedStudent.number}番`}
        onClose={() => setIsDecisionOpen(false)}
      >
        {decisionPanel}
      </MeetingDrawer>

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
