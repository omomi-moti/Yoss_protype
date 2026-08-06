import { Star, MapPin, Tag, ChevronDown, ChevronUp, MessageSquare, Crown, Phone, Mail, Globe } from 'lucide-react';
import ReviewList from './ReviewList';
import { summarizeReviews } from '../data/organizations';
import type { Organization, OrganizationType } from '../types';

// 種別ごとのバッジ配色
const TYPE_STYLES: Record<OrganizationType, string> = {
  'NPO': 'bg-green-50 text-green-600',
  '社会福祉協議会': 'bg-blue-50 text-blue-600',
  '自治体事業': 'bg-purple-50 text-purple-600',
  'ボランティア団体': 'bg-orange-50 text-orange-600',
  '民間企業': 'bg-gray-100 text-gray-600',
  'その他': 'bg-gray-100 text-gray-500',
};

/**
 * 学校から見た団体カード。
 * 画面C（ディレクトリ）と画面A（登録内容のプレビュー）で共有する。
 */
export default function OrganizationCard({ org, isExpanded, onToggle }: {
  org: Organization;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const review = summarizeReviews(org.reviews);

  const enabledSupports = org.supports.filter(s => s.enabled);

  return (
    <div className={`bg-white rounded-xl border-2 transition-all ${
      org.isMine
        ? 'border-yoss-yellow shadow-md shadow-yoss-yellow/10'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
              org.isMine
                ? 'bg-yoss-yellow text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {org.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-yoss-dark">{org.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${TYPE_STYLES[org.type]}`}>
                  {org.type}
                </span>
                {org.isMine && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yoss-yellow-light text-yoss-yellow-dark">
                    <Crown size={10} />
                    自分の団体
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                <span className="flex items-center gap-0.5">
                  <MapPin size={10} />
                  {org.area.prefecture}{org.area.city}
                </span>
                <span>{org.operator}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          {review.averageRating !== null && (
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Star size={14} className="fill-yoss-yellow text-yoss-yellow" />
                <span className="text-lg font-bold text-yoss-dark">{review.averageRating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-gray-400">{review.count}件のレビュー</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{org.description}</p>

        {/* Category tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {org.categories.map(category => (
            <span key={category} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
              {category}
            </span>
          ))}
        </div>

        {/* Supports summary */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            対応可能な支援：<strong className="text-yoss-dark">{enabledSupports.length}件</strong>
          </span>
          <button
            onClick={onToggle}
            className="flex items-center gap-1 text-xs text-yoss-yellow-dark hover:text-yoss-yellow font-bold transition-colors"
          >
            {isExpanded ? '閉じる' : '詳細を見る'}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Contact */}
          <div className="px-5 py-3 bg-gray-50/50 flex flex-wrap gap-4 text-[10px] text-gray-500">
            {org.contact.tel && (
              <span className="flex items-center gap-1"><Phone size={11} />{org.contact.tel}</span>
            )}
            {org.contact.email && (
              <span className="flex items-center gap-1"><Mail size={11} />{org.contact.email}</span>
            )}
            {org.contact.web && (
              <span className="flex items-center gap-1"><Globe size={11} />{org.contact.web}</span>
            )}
          </div>

          {/* Support list */}
          <div className="p-5">
            <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
              <Tag size={12} />
              対応可能な支援一覧
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {enabledSupports.map(s => (
                <div key={s.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {s.categories.map(category => (
                      <span
                        key={category}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yoss-yellow-light text-yoss-yellow-dark"
                      >
                        {category}
                      </span>
                    ))}
                    <span className="text-xs font-bold text-yoss-dark">{s.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {s.targetGrades} / {s.cost} / {s.capacity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {org.reviews.length > 0 && (
            <div className="border-t border-gray-100 p-5 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                <MessageSquare size={12} />
                学校からのレビュー
              </h4>
              <ReviewList reviews={org.reviews} supports={org.supports} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
