import { Search, Info, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from './Modal';
import { currentTerm, currentYear } from '../data/meeting';
import { CLASS_OPTIONS, GRADE_OPTIONS } from '../data/students';
import { useState } from 'react';
import type { MeetingSearchCriteria } from '../types';

/*
 * 実物の3つのモード。デモとして押した感触を出すため、どれを押しても選択は移る。
 * ただし本プロトタイプが中身を持つのは校内チーム会議だけで、
 * 下の検索条件と「検索する」の遷移先は常に校内チーム会議のもの。
 */
const TEAM_MEETING = '校内チーム会議を実施する';

const MODES = [
  'スクリーニング会議を準備する',
  'スクリーニング会議を実施する',
  TEAM_MEETING,
];

const DIRECTIONS = [
  { key: 'A', label: 'A 教職員関与' },
  { key: 'B', label: 'B 地域資源の活用' },
  { key: 'C', label: 'C 専門機関の活用' },
];

/** 選択肢のトグル */
function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter(v => v !== value) : [...values, value];
}

/** 条件のピル（学年・クラス・支援の方向性で共用） */
function Pill({ label, isActive, onClick }: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        isActive
          ? 'bg-yoss-yellow text-white border-yoss-yellow font-bold'
          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

/** 条件の1行（左にラベル、右に操作） */
function Row({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-32 shrink-0 pt-1.5">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/**
 * 校内チーム会議の開始ステップ（実物の「会議の準備・実施」に相当）。
 *
 * 実際に絞り込むのは学年・クラス・スクリーニング点数だけ。
 * 年度・学期・支援の方向性・生徒名は実物に項目があるため置くが、絞り込みには使わない。
 */
export default function MeetingSearchStep({
  criteria,
  onChange,
  onSearch,
  hasNoResult,
  onDismissNoResult,
}: {
  criteria: MeetingSearchCriteria;
  onChange: (criteria: MeetingSearchCriteria) => void;
  onSearch: () => void;
  /** 直前の検索で0件だった。該当がないときは画面を進めずここで知らせる */
  hasNoResult: boolean;
  onDismissNoResult: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState(TEAM_MEETING);

  const update = (patch: Partial<MeetingSearchCriteria>) => onChange({ ...criteria, ...patch });
  const allClassesSelected = criteria.classes.length === CLASS_OPTIONS.length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-600">学校向け</span>
        </div>
        <h1 className="text-xl font-bold text-yoss-dark">会議の準備・実施</h1>
      </div>

      {/* モードの選択 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <p className="text-[11px] text-gray-400 mb-3">選択してください</p>
        <div className="grid grid-cols-3 gap-3">
          {MODES.map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`rounded-lg py-4 text-sm font-bold border-2 transition-colors active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yoss-yellow/40 ${
                mode === selectedMode
                  ? 'bg-yoss-yellow text-white border-yoss-yellow-dark'
                  : 'bg-yoss-yellow-light text-yoss-yellow-dark border-transparent hover:border-yoss-yellow/40'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 検索条件 */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-yoss-yellow" />
            <h2 className="text-sm font-bold text-yoss-dark">検索条件を選択してください</h2>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600"
            aria-label={isOpen ? '検索条件を閉じる' : '検索条件を開く'}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {isOpen && (
          <div className="px-5 pb-5 space-y-4">
            <div className="flex items-center gap-8">
              <Row label="年度">
                <span className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 inline-block">
                  {currentYear}
                </span>
              </Row>
              <Row label="学期">
                <span className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 inline-block">
                  {currentTerm}
                </span>
              </Row>
            </div>

            <Row label="支援の方向性" hint="表示のみ">
              <div className="flex flex-wrap gap-2">
                {DIRECTIONS.map(direction => (
                  <Pill
                    key={direction.key}
                    label={direction.label}
                    isActive={criteria.directions.includes(direction.key)}
                    onClick={() => update({ directions: toggle(criteria.directions, direction.key) })}
                  />
                ))}
              </div>
            </Row>

            <Row label="スクリーニング点数">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={criteria.minScore}
                  onChange={e => update({ minScore: e.target.value })}
                  placeholder="下限"
                  className="w-24 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                />
                <span className="text-xs text-gray-400">〜</span>
                <input
                  type="number"
                  value={criteria.maxScore}
                  onChange={e => update({ maxScore: e.target.value })}
                  placeholder="上限"
                  className="w-24 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                />
              </div>
            </Row>

            <Row label="学年検索">
              <div className="flex flex-wrap gap-2">
                {GRADE_OPTIONS.map(grade => (
                  <Pill
                    key={grade}
                    label={`${grade}生`}
                    isActive={criteria.grades.includes(grade)}
                    onClick={() => update({ grades: toggle(criteria.grades, grade) })}
                  />
                ))}
              </div>
            </Row>

            <Row label="クラス検索">
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
                  <input
                    type="checkbox"
                    checked={allClassesSelected}
                    onChange={e => update({ classes: e.target.checked ? [...CLASS_OPTIONS] : [] })}
                    className="accent-yoss-yellow"
                  />
                  全選択
                </label>
                {CLASS_OPTIONS.map(className => (
                  <Pill
                    key={className}
                    label={className}
                    isActive={criteria.classes.includes(className)}
                    onClick={() => update({ classes: toggle(criteria.classes, className) })}
                  />
                ))}
              </div>
            </Row>

            <Row label="生徒名検索" hint="表示のみ">
              <input
                type="text"
                value={criteria.studentName}
                onChange={e => update({ studentName: e.target.value })}
                placeholder="生徒名を入力してください"
                className="w-full max-w-sm px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
              />
            </Row>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={onSearch}
          className="px-8 py-2.5 rounded-lg bg-yoss-yellow text-white text-sm font-bold hover:bg-yoss-yellow-dark transition-colors"
        >
          検索する
        </button>
      </div>

      <div className="bg-yoss-yellow-light/60 border border-yoss-yellow/30 rounded-lg px-4 py-3 flex items-center justify-center gap-2">
        <Info size={14} className="text-yoss-yellow-dark shrink-0" />
        <p className="text-xs text-gray-600">
          上記の「検索する」ボタンを押すと、生徒の情報が表示されます。
        </p>
      </div>

      {/* 該当が0名のときは画面を進めず、確認ダイアログで知らせる */}
      {hasNoResult && (
        <Modal onClose={onDismissNoResult} labelledBy="no-result-title" size="sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-yoss-yellow-dark shrink-0" />
              <h2 id="no-result-title" className="text-base font-bold text-yoss-dark">確認</h2>
            </div>
            <p className="text-sm text-gray-600">該当する生徒が見つかりません。</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={onDismissNoResult}
                className="px-8 py-2 rounded-lg bg-yoss-yellow text-white text-sm font-bold hover:bg-yoss-yellow-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yoss-yellow/40"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
