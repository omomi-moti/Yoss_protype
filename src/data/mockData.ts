import type { DomainScores, DomainSuggestionGroup, Organization, SupportRecord, SupportSuggestion } from '../types';
import { getAllSupports, summarizeReviews, summarizeReviewsForSupport } from './organizations';
import { SCHOOLS } from './schools';
import { scoredDomains } from './students';

const supportIndex = new Map(getAllSupports().map(s => [s.id, s]));

// 支援メニューの情報（団体名・領域）は organizations.ts から引くため、実績側では持たない
type RecordFields = Omit<
  SupportRecord,
  'id' | 'supportId' | 'supportName' | 'organizationId' | 'organizationName' | 'categories'
>;

function buildRecords(
  supportId: string,
  idPrefix: string,
  count: number,
  fields: (i: number) => RecordFields
): SupportRecord[] {
  const support = supportIndex.get(supportId);
  if (!support) throw new Error(`未知の支援IDです: ${supportId}`);

  return Array.from({ length: count }, (_, i) => ({
    id: `${idPrefix}-${i}`,
    supportId: support.id,
    supportName: support.name,
    organizationId: support.organizationId,
    organizationName: support.organizationName,
    categories: support.categories,
    ...fields(i),
  }));
}

// 軸②：支援実績のダミーデータ（自動集計される想定）
export const mockRecords: SupportRecord[] = [
  // 子ども食堂
  ...buildRecords('r4', 'rec-food', 78, i => ({
    problemTags: i % 3 === 0
      ? ['経済的困窮', '孤立・居場所なし']
      : i % 3 === 1
      ? ['孤立・居場所なし']
      : ['経済的困窮'],
    schoolName: SCHOOLS[i % 5],
    date: `2026-${String(4 + Math.floor(i / 20)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 10 < 7 ? '継続中' : i % 10 < 9 ? '終了' : '中断',
    improved: i % 10 < 6,
  })),
  // 就学援助
  ...buildRecords('r1', 'rec-aid', 34, i => ({
    problemTags: ['経済的困窮'],
    schoolName: SCHOOLS[i % 5],
    date: `2026-${String(4 + Math.floor(i / 10)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: '継続中',
    improved: i % 5 < 3,
  })),
  // 学習支援教室
  ...buildRecords('r7', 'rec-study', 25, i => ({
    problemTags: i % 2 === 0
      ? ['学習の遅れ', '経済的困窮']
      : ['学習の遅れ'],
    schoolName: SCHOOLS[i % 5],
    date: `2026-${String(5 + Math.floor(i / 8)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 8 < 5 ? '継続中' : '終了',
    improved: i % 8 < 4,
  })),
  // 保護者相談窓口
  ...buildRecords('r9', 'rec-parent', 18, i => ({
    problemTags: i % 3 === 0
      ? ['保護者支援が必要', '家庭でのケア負担']
      : ['保護者支援が必要'],
    schoolName: SCHOOLS[i % 3],
    date: `2026-${String(4 + Math.floor(i / 6)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 6 < 4 ? '継続中' : '終了',
    improved: i % 6 < 3,
  })),
  // 放課後子ども教室
  ...buildRecords('r5', 'rec-after', 20, i => ({
    problemTags: ['孤立・居場所なし'],
    schoolName: [SCHOOLS[0], SCHOOLS[1], SCHOOLS[3]][i % 3],
    date: `2026-${String(4 + Math.floor(i / 7)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 5 < 4 ? '継続中' : '終了',
    improved: i % 5 < 3,
  })),
  // 発達相談
  ...buildRecords('r12', 'rec-dev', 12, i => ({
    problemTags: ['発達特性'],
    schoolName: [SCHOOLS[0], SCHOOLS[2], SCHOOLS[4]][i % 3],
    date: `2026-${String(5 + Math.floor(i / 4)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 4 < 3 ? '継続中' : '終了',
    improved: i % 4 < 2,
  })),
  // 家庭訪問支援
  ...buildRecords('r10', 'rec-visit', 8, i => ({
    problemTags: ['家庭でのケア負担', '不登校傾向'],
    schoolName: [SCHOOLS[0], SCHOOLS[2]][i % 2],
    date: `2026-${String(5 + Math.floor(i / 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 4 < 3 ? '継続中' : '中断',
    improved: i % 4 < 2,
  })),
];

/**
 * 支援候補の表示順。
 * ①児童の必要度が高い支援を優先（合致した領域のスコア合計の降順）
 * ②同じスコアなら、その支援へのレビュー評価が高い順。レビューがない支援は末尾
 *
 * 複数領域に効く支援は合計が大きくなるため、どの領域の一覧でも上位に来る。
 * 「この子の困りごとを一度に複数カバーできる」ことを優先する、という順序付け。
 */
function compareSuggestions(a: SupportSuggestion, b: SupportSuggestion): number {
  if (a.matchedScore !== b.matchedScore) return b.matchedScore - a.matchedScore;

  // レビューなしを末尾に回すため、評価なしは 1〜5 より小さい値として扱う
  const ratingA = a.review.averageRating ?? -1;
  const ratingB = b.review.averageRating ?? -1;
  if (ratingA !== ratingB) return ratingB - ratingA;

  return b.review.count - a.review.count;
}

/**
 * 支援候補を領域ごとにまとめる。
 * 領域の順序は児童のスコアが高い順、領域内の順序は getSuggestions() の並びを引き継ぐ。
 * 複数領域に効く支援は、合致した領域それぞれの一覧に出る。
 */
export function groupSuggestionsByDomain(
  suggestions: SupportSuggestion[],
  scores: DomainScores
): DomainSuggestionGroup[] {
  return scoredDomains(scores)
    .map(domain => ({
      domain,
      score: scores[domain],
      suggestions: suggestions.filter(suggestion => suggestion.matchedDomains.includes(domain)),
    }))
    .filter(group => group.suggestions.length > 0);
}

/**
 * 画面D用：児童の8領域スコアから支援候補を生成する。
 *
 * 児童のスコアが1以上の領域を「支援が必要な領域」とし、その領域の支援を
 * 「対応可能」（enabled）として登録している団体だけを候補にする。
 * 支援が複数領域に対応している場合、ひとつでも合致すれば候補になる。
 */
export function getSuggestions(
  scores: DomainScores,
  orgs: Organization[],
  records: SupportRecord[],
  schoolName: string
): SupportSuggestion[] {
  const neededDomains = new Set(scoredDomains(scores));

  return orgs
    .flatMap(org => {
      const organizationReview = summarizeReviews(org.reviews);

      return org.supports
        .filter(support => support.enabled)
        .map(support => ({
          support,
          // スコアの高い領域から並べる（カードに出す順序でもある）
          matchedDomains: support.categories
            .filter(category => neededDomains.has(category))
            .sort((a, b) => scores[b] - scores[a]),
        }))
        .filter(({ matchedDomains }) => matchedDomains.length > 0)
        .map(({ support, matchedDomains }) => {
          const review = summarizeReviewsForSupport(org.reviews, support.id);
          const relatedRecords = records.filter(rec => rec.supportId === support.id);
          const schoolRecords = relatedRecords.filter(rec => rec.schoolName === schoolName);
          const continuing = relatedRecords.filter(rec => rec.continuationStatus === '継続中');

          return {
            supportId: support.id,
            supportName: support.name,
            description: support.description,
            targetGrades: support.targetGrades,
            cost: support.cost,
            capacity: support.capacity,
            frequency: support.frequency,
            howToUse: support.howToUse,
            categories: support.categories,
            matchedDomains,
            matchedScore: matchedDomains.reduce((sum, domain) => sum + scores[domain], 0),
            organizationId: org.id,
            organizationName: org.name,
            organizationType: org.type,
            contact: org.contact,
            review,
            organizationReview,
            cityWideCount: relatedRecords.length,
            schoolCount: schoolRecords.length,
            continuationRate: relatedRecords.length > 0
              ? Math.round((continuing.length / relatedRecords.length) * 100)
              : null,
            isNew: relatedRecords.length === 0,
          };
        });
    })
    .sort(compareSuggestions);
}
