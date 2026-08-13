import type {
  DirectionItem,
  DirectionState,
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

/**
 * 実物の「支援の現状」に並ぶ項目。方向性ごとに、実際に何をしているかを 新／続／拒 で記録する。
 *
 * ここが本プロトタイプの出発点。B の項目はどれも「◯◯の活用」というカテゴリ名でしかなく、
 * チェックを入れられても、実際にどの団体に繋ぐのかはシステムのどこにも無い。
 * A と C は繋ぎ先が校内・公的機関に決まっているので、カテゴリ名だけで用が足りる。
 */
export const DIRECTION_ITEMS: DirectionItem[] = [
  { direction: 'A', index: 1, label: '担任のアプローチ' },
  { direction: 'A', index: 2, label: '生徒指導や児童生徒支援のアプローチ' },
  { direction: 'A', index: 3, label: '養護教諭のアプローチ' },
  { direction: 'A', index: 4, label: '特別支援担当のアプローチ' },
  { direction: 'A', index: 5, label: '学年団のアプローチ' },
  { direction: 'A', index: 6, label: 'SSWを活用したアプローチ' },
  { direction: 'A', index: 7, label: 'SCを活用したアプローチ' },
  { direction: 'A', index: 8, label: 'その他' },

  { direction: 'B', index: 1, label: '家庭教育支援の活用' },
  { direction: 'B', index: 2, label: '学習支援の活用' },
  { direction: 'B', index: 3, label: '居場所、こども食堂の活用' },
  { direction: 'B', index: 4, label: '地域の見守りの活用' },
  { direction: 'B', index: 5, label: '地域人材の活用' },
  { direction: 'B', index: 6, label: '学童保育の活用' },
  { direction: 'B', index: 7, label: '地域の福祉サービスの活用(放課後デイ等)' },
  { direction: 'B', index: 8, label: 'その他' },

  { direction: 'C', index: 1, label: '家庭児童相談室・児童相談所の活用' },
  { direction: 'C', index: 2, label: '少年サポートセンターの活用' },
  { direction: 'C', index: 3, label: '教育センターの活用' },
  { direction: 'C', index: 4, label: '福祉制度(生活保護,母子相談等)の活用' },
  { direction: 'C', index: 5, label: '医療機関の活用' },
  { direction: 'C', index: 6, label: 'その他' },
];

/** 支援の現状で使う状態。実物と同じ3つ */
export const DIRECTION_STATES: DirectionState[] = ['新', '続', '拒'];

/**
 * 画面Dのタブ。①〜④は実物の校内チーム会議の並びに合わせる。
 * ⑤ 今回の対応記録 はプロトタイプ独自。右ドロワー（この会議で決めたこと）と
 * 同じ内容を、他のタブを見ながらでも確認できるように複製表示する。
 */
export const MEETING_TABS: { key: MeetingTab; label: string }[] = [
  { key: 'situation', label: '① 状況（気になる情報）' },
  { key: 'screening', label: '② スクリーニング／会議記録' },
  { key: 'record', label: '③ 対応記録・アクション記録' },
  { key: 'support', label: '④ 領域と支援候補' },
  { key: 'decision', label: '⑤ 今回の対応記録' },
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
