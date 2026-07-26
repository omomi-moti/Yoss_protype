import type { DomainScores, Student, SupportCategory } from '../types';
import { SUPPORT_CATEGORIES } from './organizations';

/** 1領域あたりのスコア上限（バーの分母に使う） */
export const MAX_DOMAIN_SCORE = 5;

/** 指定のない領域を0で埋める */
function makeScores(partial: Partial<DomainScores>): DomainScores {
  return SUPPORT_CATEGORIES.reduce((acc, category) => {
    acc[category] = partial[category] ?? 0;
    return acc;
  }, {} as DomainScores);
}

/** 合計スコアは領域別スコアから導出する */
export function totalScore(scores: DomainScores): number {
  return SUPPORT_CATEGORIES.reduce((sum, category) => sum + scores[category], 0);
}

/** スコアが付いている領域を、高い順に返す */
export function scoredDomains(scores: DomainScores): SupportCategory[] {
  return SUPPORT_CATEGORIES
    .filter(category => scores[category] > 0)
    .sort((a, b) => scores[b] - scores[a]);
}

/** スコアの水準（バッジの色分けに使う） */
export function scoreLevel(total: number): 'high' | 'middle' | 'low' {
  if (total >= 10) return 'high';
  if (total >= 6) return 'middle';
  return 'low';
}

// デモ用の児童データ（スクリーニング会議で挙がった想定）
export const demoStudents: Student[] = [
  {
    id: 'S-001',
    grade: '5年1組',
    number: 12,
    scores: makeScores({ 経済: 4, 地域情報: 3, 学校適応: 2 }),
    problems: ['経済的困窮', '孤立・居場所なし'],
    notes: '遅刻多い・身だしなみが気になる・給食をたくさん食べる',
    currentSupport: 'A（担任の声かけ）',
  },
  {
    id: 'S-002',
    grade: '3年2組',
    number: 8,
    scores: makeScores({ 学習: 4, 家庭状況: 3 }),
    problems: ['学習の遅れ', '保護者支援が必要'],
    notes: '宿題未提出が続く・保護者と連絡が取りにくい',
    currentSupport: 'A（学年主任の面談）',
  },
  {
    id: 'S-003',
    grade: '6年1組',
    number: 23,
    scores: makeScores({ 学校適応: 4, 家庭状況: 3, 福祉: 2, 地域情報: 1, 健康: 1 }),
    problems: ['不登校傾向', '家庭でのケア負担', '孤立・居場所なし'],
    notes: '欠席増加・弟の世話で疲れている様子・保健室利用増',
    currentSupport: 'A+B（SC相談開始）',
  },
];

/** 合計スコアが高い順（会議では重い児童から検討する） */
export const studentsByScore: Student[] = [...demoStudents].sort(
  (a, b) => totalScore(b.scores) - totalScore(a.scores)
);
