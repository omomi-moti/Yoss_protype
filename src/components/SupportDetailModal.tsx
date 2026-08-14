import { useMemo } from 'react';
import { X, Phone, Mail, Globe, MessageSquare } from 'lucide-react';
import Modal from './Modal';
import ReviewList from './ReviewList';
import StarRating from './StarRating';
import SupportConditions from './SupportConditions';
import { sortByDomainOrder, sortReviewsByRelevance } from '../data/organizations';
import type { Organization, ProblemTag, SupportSuggestion } from '../types';

/**
 * 画面Dの支援候補カードから開く詳細。
 *
 * カードに出ている情報（支援名・団体名・評価・対象/費用/定員）は繰り返さず、
 * 「カードだけでは判断しきれない部分」＝実施頻度・利用方法・連絡先・レビューを担う。
 * レビューは検討中の児童と同じ課題の事例を先に出し、会議で「この子に効くのか」を判断できるようにする。
 */
export default function SupportDetailModal({ suggestion, organization, studentTags, onClose }: {
  suggestion: SupportSuggestion;
  organization: Organization;
  /** 検討中の児童の課題タグ */
  studentTags: ProblemTag[];
  onClose: () => void;
}) {
  const { related, others } = useMemo(() => {
    const sorted = sortReviewsByRelevance(organization.reviews, studentTags);
    return {
      related: sorted.filter(item => item.matchedTags.length > 0),
      others: sorted.filter(item => item.matchedTags.length === 0),
    };
  }, [organization.reviews, studentTags]);

  return (
    <Modal onClose={onClose} labelledBy="support-detail-title">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-4 bg-white rounded-t-2xl border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 id="support-detail-title" className="text-base font-bold text-yoss-dark">
              {suggestion.supportName}
            </h2>
            {/* この児童のどの領域に効く支援なのか。合致しなかった領域は会議の判断に要らない */}
            {sortByDomainOrder(suggestion.matchedDomains).map(domain => (
              <span
                key={domain}
                className="text-[10px] font-bold bg-yoss-yellow-light text-yoss-yellow-dark px-2 py-0.5 rounded"
              >
                {domain}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {organization.name}
            <span className="mx-1.5">·</span>
            {organization.type}
          </p>
          {suggestion.review.averageRating !== null && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StarRating rating={Math.round(suggestion.review.averageRating)} size={12} />
              <span className="text-xs font-bold text-yoss-dark">
                {suggestion.review.averageRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">
                この支援へのレビュー {suggestion.review.count}件
              </span>
              {suggestion.organizationReview.count > suggestion.review.count && (
                <span className="text-[10px] text-gray-400">
                  / 団体全体 ★{suggestion.organizationReview.averageRating?.toFixed(1)}
                  （{suggestion.organizationReview.count}件）
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
          aria-label="詳細を閉じる"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* 支援の詳細 */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-2">支援の詳細</h3>
          <p className="text-[13px] text-gray-700 leading-relaxed mb-2">{suggestion.description}</p>
          <SupportConditions support={suggestion} full />
        </section>

        {/* 連絡先 */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-2">連絡先</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {suggestion.contact.tel && (
              <span className="flex items-center gap-1"><Phone size={12} className="text-gray-400" />{suggestion.contact.tel}</span>
            )}
            {suggestion.contact.email && (
              <span className="flex items-center gap-1"><Mail size={12} className="text-gray-400" />{suggestion.contact.email}</span>
            )}
            {suggestion.contact.web && (
              <span className="flex items-center gap-1"><Globe size={12} className="text-gray-400" />{suggestion.contact.web}</span>
            )}
          </div>
        </section>

        {/* レビュー */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
            <MessageSquare size={12} />
            学校からのレビュー
            <span className="font-normal text-gray-400">（この団体の全支援）</span>
          </h3>

          {organization.reviews.length === 0 ? (
            <p className="text-xs text-gray-400 bg-white border border-gray-100 rounded-lg p-4">
              この団体へのレビューはまだありません。利用した学校がレビューを書くと、次に検討する学校の判断材料になります。
            </p>
          ) : (
            <div className="space-y-4">
              {related.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-yoss-yellow-dark mb-1.5">
                    この児童と同じ課題の事例（{related.length}件）
                  </p>
                  <ReviewList
                    reviews={related.map(item => item.review)}
                    supports={organization.supports}
                    highlightTags={studentTags}
                  />
                </div>
              )}

              {others.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 mb-1.5">
                    {related.length > 0 ? 'そのほかのレビュー' : 'レビュー'}（{others.length}件）
                  </p>
                  <ReviewList reviews={others.map(item => item.review)} supports={organization.supports} />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
