import type { OrganizationContribution } from '../types';

/**
 * 画面E（公開ページ）で一般の人が出した支援を記録するストア。
 *
 * 団体データ（organizationStore）とは分ける。あちらは団体が自分で登録・公開する内容で、
 * こちらは団体以外の人が外から積み上げるもの。混ぜると「団体が入力した実績」と
 * 「一般の人が出した支援」の区別が付かなくなり、画面Aの入力欄を上書きしてしまう。
 *
 * 画面Aで入れた現在額・集まった数が出発点で、ここに積み増した合計を画面Eに出す。
 * 決済も申込の送信もしないので、記録されるのは数だけ。
 */

const KEY = 'yoss.support.contributions';

/** 募集ID → 一般の人から積み上がった分 */
export type SupportTally = Record<string, { amount: number; supporters: number }>;

let state: SupportTally = read();
const listeners = new Set<() => void>();

function read(): SupportTally {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SupportTally) : {};
  } catch {
    // localStorage が使えない環境でも画面は動かす
    return {};
  }
}

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 保存に失敗しても画面は動かし続ける
  }
}

function emit() {
  listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getSnapshot(): SupportTally {
  return state;
}

/**
 * 支援を1件記録する。
 * amount は寄付金なら金額（円）、物品なら数量、ボランティアなら人数。
 */
export function addSupport(contributionId: string, amount: number) {
  const current = state[contributionId] ?? { amount: 0, supporters: 0 };
  state = {
    ...state,
    [contributionId]: { amount: current.amount + amount, supporters: current.supporters + 1 },
  };
  write();
  emit();
}

/** デモをやり直すときに使う。画面Eの「支援の記録をリセット」から呼ぶ */
export function resetSupport() {
  state = {};
  try {
    localStorage.removeItem(KEY);
  } catch {
    // noop
  }
  emit();
}

/** 達成状況。分子・分母・達成率を、3種別で同じ形にして返す */
export interface ContributionProgress {
  /** 集まった数（団体が入力した実績＋画面Eで積み上がった分） */
  current: number;
  /** 目標。未入力なら null */
  goal: number | null;
  /** 0〜100 に丸めた達成率。目標が無ければ null */
  percent: number | null;
  /** 残り。目標が無い、または達成済みなら 0 */
  remaining: number;
  supporters: number;
  /** 表示に付ける単位（円／kg／名 など） */
  unit: string;
}

export function progressOf(
  contribution: OrganizationContribution,
  tally: SupportTally
): ContributionProgress {
  const added = tally[contribution.id] ?? { amount: 0, supporters: 0 };
  const isMoney = contribution.type === '寄付金';

  const base = isMoney ? contribution.currentAmount : contribution.receivedCount;
  const current = (base ?? 0) + added.amount;
  const goal = (isMoney ? contribution.goalAmount : contribution.neededCount) ?? null;

  return {
    current,
    goal,
    percent: goal ? Math.round((current / goal) * 100) : null,
    remaining: goal ? Math.max(goal - current, 0) : 0,
    supporters: (contribution.supporterCount ?? 0) + added.supporters,
    unit: isMoney ? '円' : contribution.type === 'ボランティア' ? '名' : contribution.unit || '',
  };
}
