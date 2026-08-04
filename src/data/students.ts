import type { DomainScores, MeetingSearchCriteria, ProblemTag, Student, SupportCategory } from '../types';
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

/**
 * 8領域と、スクリーニングの問題タグの対応。
 *
 * 支援候補の抽出は領域スコアだけで行う（Student.problems は使わない）。この対応は
 * 「なぜこの領域にスコアが付いているのか」を先生に示す説明のためだけに使う。
 */
const DOMAIN_PROBLEM_TAGS: Record<SupportCategory, ProblemTag[]> = {
  学校適応: ['不登校傾向', '欠席・遅刻', '友人トラブル'],
  学習: ['学習の遅れ', '宿題未提出'],
  家庭状況: ['家庭でのケア負担', '保護者支援が必要', '連絡が取れない'],
  発達: ['発達特性'],
  健康: ['保健室頻回'],
  経済: ['経済的困窮', '諸費滞納'],
  福祉: ['家庭でのケア負担', 'SC/SSW関与', '要対協ケース'],
  地域情報: ['不登校傾向', '経済的困窮', '孤立・居場所なし', '地域からの気になる情報'],
};

/** その領域にスコアが付いた根拠として示せる、この児童の問題タグ */
export function problemTagsForDomain(student: Student, domain: SupportCategory): ProblemTag[] {
  const relatedTags = DOMAIN_PROBLEM_TAGS[domain];
  return student.problems.filter(tag => relatedTags.includes(tag));
}

/** スコアの水準（バッジの色分けに使う） */
export function scoreLevel(total: number): 'high' | 'middle' | 'low' {
  if (total >= 10) return 'high';
  if (total >= 6) return 'middle';
  return 'low';
}

/*
 * デモ用の児童データ（スクリーニング会議で挙がった想定）。
 *
 * 会議の検索条件が機能して見えるよう、学年・クラスを散らしてある。
 * problems は表示専用だが、領域見出しの「スクリーニングでの該当」に使うため、
 * スコアが付いた領域に対応するタグを最低1つ持たせている（DOMAIN_PROBLEM_TAGS 参照）。
 */
export const demoStudents: Student[] = [
  {
    id: 'S-001',
    grade: '5年1組',
    number: 12,
    scores: makeScores({ 経済: 4, 地域情報: 3, 学校適応: 2 }),
    problems: ['経済的困窮', '孤立・居場所なし', '欠席・遅刻'],
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
    problems: ['不登校傾向', '家庭でのケア負担', '孤立・居場所なし', '保健室頻回'],
    notes: '欠席増加・弟の世話で疲れている様子・保健室利用増',
    currentSupport: 'A+B（SC相談開始）',
  },
  {
    id: 'S-004',
    grade: '3年1組',
    number: 5,
    scores: makeScores({ 発達: 3, 学校適応: 2 }),
    problems: ['発達特性', '友人トラブル'],
    notes: '一斉指示が通りにくい・友達とのトラブルが増えている',
    currentSupport: 'A（担任の声かけ）',
  },
  {
    id: 'S-005',
    grade: '4年2組',
    number: 18,
    scores: makeScores({ 健康: 4, 家庭状況: 2 }),
    problems: ['保健室頻回', '連絡が取れない'],
    notes: '週に数回保健室で休む・家庭への連絡がつきにくい',
    currentSupport: 'A（養護教諭の見守り）',
  },
  {
    id: 'S-006',
    grade: '5年2組',
    number: 3,
    scores: makeScores({ 経済: 3, 学習: 2 }),
    problems: ['諸費滞納', '宿題未提出'],
    notes: '諸費の滞納が続く・宿題の提出が不安定',
    currentSupport: 'A（担任の声かけ）',
  },
  {
    id: 'S-007',
    grade: '6年2組',
    number: 14,
    scores: makeScores({ 学習: 5, 学校適応: 3, 福祉: 2, 家庭状況: 2 }),
    problems: ['学習の遅れ', '欠席・遅刻', 'SC/SSW関与', '保護者支援が必要'],
    notes: '遅刻が増加・学年相当の学習に大きな遅れ・SSWが関与中',
    currentSupport: 'A+B（SSW関与）',
  },
  {
    id: 'S-008',
    grade: '4年1組',
    number: 21,
    scores: makeScores({ 家庭状況: 4, 福祉: 3, 経済: 2 }),
    problems: ['家庭でのケア負担', '要対協ケース', '経済的困窮'],
    notes: '祖母の介護を手伝っている様子・要対協で共有済み',
    currentSupport: 'A+B（要対協で共有）',
  },
  {
    id: 'S-009',
    grade: '3年1組',
    number: 30,
    scores: makeScores({ 地域情報: 3, 経済: 2 }),
    problems: ['孤立・居場所なし', '経済的困窮'],
    notes: '放課後に行き場がない・持ち物が揃わないことがある',
    currentSupport: 'A（担任の声かけ）',
  },
  {
    id: 'S-010',
    grade: '4年3組',
    number: 9,
    scores: makeScores({ 発達: 4, 学校適応: 3, 学習: 2 }),
    problems: ['発達特性', '友人トラブル', '宿題未提出'],
    notes: '一斉指示が入りにくい・友達との距離感がつかめない・宿題が出せない',
    currentSupport: 'A（担任の声かけ）',
  },
  {
    id: 'S-011',
    grade: '5年3組',
    number: 25,
    scores: makeScores({ 学校適応: 5, 地域情報: 2 }),
    problems: ['不登校傾向', '孤立・居場所なし'],
    notes: '2学期に入って欠席が増えた・放課後の居場所がない',
    currentSupport: 'A+B（SC相談開始）',
  },
  {
    id: 'S-012',
    grade: '6年3組',
    number: 2,
    scores: makeScores({ 経済: 5, 家庭状況: 4, 福祉: 3, 学習: 2 }),
    problems: ['経済的困窮', '家庭でのケア負担', '要対協ケース', '学習の遅れ'],
    notes: '諸費の滞納が続く・祖父母宅と行き来している・要対協で共有済み',
    currentSupport: 'A+B（要対協で共有）',
  },
  {
    id: 'S-013',
    grade: '3年3組',
    number: 16,
    scores: makeScores({ 健康: 3, 発達: 2 }),
    problems: ['保健室頻回', '発達特性'],
    notes: '体調不良の訴えが多い・集団活動でつまずきやすい',
    currentSupport: 'A（養護教諭の見守り）',
  },
  {
    id: 'S-014',
    grade: '4年1組',
    number: 11,
    scores: makeScores({ 地域情報: 4, 学校適応: 2, 経済: 1 }),
    problems: ['孤立・居場所なし', '欠席・遅刻', '経済的困窮'],
    notes: '放課後に一人で過ごしている・遅刻が増えた',
    currentSupport: 'A（担任の声かけ）',
  },
  {
    id: 'S-015',
    grade: '5年1組',
    number: 27,
    scores: makeScores({ 家庭状況: 5, 福祉: 4 }),
    problems: ['連絡が取れない', 'SC/SSW関与', '家庭でのケア負担'],
    notes: '保護者と連絡がつかない日が続く・SSWが関与中',
    currentSupport: 'A+B（SSW関与）',
  },
  {
    id: 'S-016',
    grade: '6年2組',
    number: 6,
    scores: makeScores({ 学習: 3, 経済: 2 }),
    problems: ['学習の遅れ', '諸費滞納'],
    notes: '学習の遅れが目立つ・諸費の提出が遅れがち',
    currentSupport: 'A（学年主任の面談）',
  },
];

/** 合計スコアが高い順（会議では重い児童から検討する） */
export const studentsByScore: Student[] = [...demoStudents].sort(
  (a, b) => totalScore(b.scores) - totalScore(a.scores)
);

/** 検索条件の選択肢。実物に合わせて、該当児童がいない学年も並べる */
export const GRADE_OPTIONS = ['1年', '2年', '3年', '4年', '5年', '6年'];
export const CLASS_OPTIONS = ['1組', '2組', '3組'];

/** 「5年1組」を学年とクラスに分ける */
export function parseGrade(grade: string): { grade: string; className: string } {
  const matched = grade.match(/^(\d+年)(\d+組)$/);
  return matched
    ? { grade: matched[1], className: matched[2] }
    : { grade: '', className: '' };
}

/**
 * 会議の検索条件で児童を絞り込む。
 * 未選択・未入力の条件は使わない（初期状態では全件が返る）。
 */
export function filterStudents(
  students: Student[],
  criteria: MeetingSearchCriteria
): Student[] {
  const min = Number(criteria.minScore);
  const max = Number(criteria.maxScore);
  const hasMin = criteria.minScore !== '' && Number.isFinite(min);
  const hasMax = criteria.maxScore !== '' && Number.isFinite(max);

  return students.filter(student => {
    const { grade, className } = parseGrade(student.grade);
    if (criteria.grades.length > 0 && !criteria.grades.includes(grade)) return false;
    if (criteria.classes.length > 0 && !criteria.classes.includes(className)) return false;

    const total = totalScore(student.scores);
    if (hasMin && total < min) return false;
    if (hasMax && total > max) return false;

    return true;
  });
}
