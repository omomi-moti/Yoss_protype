import type { DomainScores, DomainSuggestionGroup, Organization, SupportSuggestion } from '../types';
import {
  countSchoolReviewsForSupport,
  summarizeReviews,
  summarizeReviewsForSupport,
} from './organizations';
import { scoredDomains } from './students';

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
 *
 * 利用実績はレビューから引く。別系統の実績データを持つと「利用実績なし」なのに
 * 星が付く状態が起きるため、issue #22 で一本化した。
 */
export function getSuggestions(
  scores: DomainScores,
  orgs: Organization[],
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
            schoolReviewCount: countSchoolReviewsForSupport(org.reviews, support.id, schoolName),
          };
        });
    })
    .sort(compareSuggestions);
}
