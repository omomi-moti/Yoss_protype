import type {
  MeetingAction,
  MeetingDecision,
  MeetingTab,
  SupportDirection,
  SupportSuggestion,
} from '../types';

/**
 * 会議まわりの定数。
 *
 * プロトタイプは単一年度・単一学期しか持たないため、検索条件の年度・学期は
 * ここに固定値を置いて表示だけする（schools.ts の currentSchool と同じ作法）。
 */
export const currentYear = '2026年度';
export const currentTerm = '2学期';

/** 支援の方向性 A / B / C。会議の検索条件と決定パネルで共用する */
export const DIRECTIONS: { key: SupportDirection; label: string }[] = [
  { key: 'A', label: 'A 教職員関与' },
  { key: 'B', label: 'B 地域資源の活用' },
  { key: 'C', label: 'C 専門機関の活用' },
];

/** 画面Dのタブ。実物の校内チーム会議の並びに合わせる */
export const MEETING_TABS: { key: MeetingTab; label: string }[] = [
  { key: 'situation', label: '① 状況（気になる情報）' },
  { key: 'support', label: '② 領域と支援候補' },
  { key: 'record', label: '③ 対応記録・アクション記録' },
  { key: 'screening', label: '④ スクリーニング／会議記録' },
];

export const emptyDecision: MeetingDecision = {
  directions: [],
  actions: [],
  memo: '',
  savedAt: null,
};

/**
 * AI推奨として出す支援の方向性。
 *
 * A は校内で必ず何かしら動くため常に推奨。B はこの児童に出せる支援候補があるときだけ
 * 推奨する（＝地域の団体が YOSS に登録されていて初めて推奨できる）。
 * C は専門機関に繋ぐ判断が要る領域（発達・健康・福祉）が重いときに推奨する。
 *
 * B の推奨条件が本プロトタイプの主張そのもの。団体データが無ければ B は推奨されない。
 */
export function recommendedDirections(
  hasSuggestions: boolean,
  specialistScore: number
): SupportDirection[] {
  const recommended: SupportDirection[] = ['A'];
  if (hasSuggestions) recommended.push('B');
  if (specialistScore >= 4) recommended.push('C');
  return recommended;
}

/** 「14:32」形式の現在時刻（保存表示用） */
export function nowLabel(): string {
  return new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

/**
 * 支援候補からアクションを作る。
 *
 * 先生に文面を書かせない。支援名から文面を組み立て、方向性は B（地域資源の活用）で固定する
 * ——支援候補はすべて地域の支援団体が登録したものなので、選んだ時点で B が決まる。
 */
export function actionFromSuggestion(suggestion: SupportSuggestion): MeetingAction {
  return {
    id: `${suggestion.supportId}-${Date.now()}`,
    supportId: suggestion.supportId,
    supportName: suggestion.supportName,
    organizationName: suggestion.organizationName,
    title: `${suggestion.supportName}の利用を検討する`,
    direction: 'B',
    registeredAt: nowLabel(),
  };
}
