import { Phone, Mail, Globe, ChevronRight } from 'lucide-react';
import StarRating from './StarRating';
import SupportConditions from './SupportConditions';
import type { SupportCategory, SupportSuggestion } from '../types';

/**
 * 校内チーム会議（画面D）で表示する支援候補のカード。
 *
 * 視線が左右に往復しないよう、判断に必要な情報（支援名・評価）は左揃えの1本の縦線に置く。
 * 内容は「名前と評価」「何をしてくれるか」「利用条件」「連絡先」の4ブロックに分け、
 * ブロック間の余白をブロック内の行間より大きく取って塊として読めるようにする。
 *
 * 利用実績はレビューと同じデータから出すため「名前と評価」に含める。別々に置くと、
 * 「利用実績なし」なのに星が付く状態が起きる（issue #22）。
 *
 * 連絡先は折りたたまず常に出す。開閉はレイアウトを伸ばしてスクロールを強いる割に、
 * 中身が電話番号とURLだけで量が少なく、操作コストのほうが大きいため。
 */
export default function SuggestionCard({ suggestion, rank, activeDomain, onOpenDetail }: {
  suggestion: SupportSuggestion;
  /** 領域内の表示順（レビュー評価が高い順）。縦スキャンの起点になる */
  rank: number;
  /** いま表示している領域。カードでは、それ以外に効く領域だけを添える */
  activeDomain: SupportCategory;
  onOpenDetail: () => void;
}) {
  const otherDomains = suggestion.matchedDomains.filter(domain => domain !== activeDomain);

  // null＝まだどの学校からもレビューがない。枠線と評価の出し分けは同じ条件で動かす
  const rating = suggestion.review.averageRating;

  return (
    // h-full で行内の他のカードと高さを揃える（グリッドが行の高さを最も高いカードに合わせる）
    <div className={`bg-white rounded-xl border border-gray-200 p-5 h-full transition-colors hover:border-yoss-yellow/60 ${
      // 利用の報告がない支援は破線で表す（一覧を見渡して分かるように）
      rating === null ? 'border-dashed' : ''
    }`}>
      <div className="flex gap-4 h-full">
        {/* 行頭のアンカー：領域内の順位 */}
        <span className="text-sm font-bold text-gray-300 shrink-0 w-4 pt-0.5">{rank}</span>

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* ①何を選ぶか：支援名と評価を縦に隣接させる */}
          <div>
            <h5 className="text-base font-bold text-yoss-dark leading-snug">
              {suggestion.supportName}
            </h5>
            {rating !== null ? (
              <div className="mt-1.5">
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(rating)} size={13} />
                  <span className="text-sm font-bold text-yoss-dark">
                    {rating.toFixed(1)}
                  </span>
                </div>
                {/*
                  レビューを書けるのは使った学校なので、件数がそのまま利用実績になる。
                  御校の分を添えるのは「自校で使ったことがあるか」が会議での判断を変えるため。
                */}
                <p className="text-[11px] text-gray-400 mt-0.5">
                  この支援へのレビュー {suggestion.review.count}件
                  {suggestion.schoolReviewCount > 0 && `（うち御校 ${suggestion.schoolReviewCount}件）`}
                </p>
              </div>
            ) : (
              <div className="mt-1.5">
                <p className="text-[11px] text-gray-400">利用した学校からのレビューはまだありません</p>
                {/* この支援にレビューがなくても、団体自体の評価は判断材料になる */}
                {suggestion.organizationReview.averageRating !== null && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    団体全体では ★{suggestion.organizationReview.averageRating.toFixed(1)}
                    （{suggestion.organizationReview.count}件）
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ②何をしてくれるか */}
          <div>
            <p className="text-[13px] text-gray-700 leading-relaxed">{suggestion.description}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              {suggestion.organizationName}
              <span className="mx-1.5">·</span>
              {suggestion.organizationType}
            </p>
            {/* 一度に複数の困りごとをカバーできる支援は上位に来る。その根拠を示す */}
            {otherDomains.length > 0 && (
              <p className="text-[11px] text-yoss-yellow-dark mt-1">
                この児童の {otherDomains.join('・')} にも対応
              </p>
            )}
          </div>

          {/* ③利用条件 */}
          <SupportConditions support={suggestion} />

          {/* ④連絡先。mt-auto でカード下端に揃え、行内のカードで位置が一致するようにする */}
          <div className="space-y-1.5 mt-auto">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
              {suggestion.contact.tel && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Phone size={11} className="text-gray-400" />{suggestion.contact.tel}
                </span>
              )}
              {suggestion.contact.email && (
                <span className="flex items-center gap-1 min-w-0">
                  <Mail size={11} className="text-gray-400 shrink-0" />
                  <span className="truncate" title={suggestion.contact.email}>{suggestion.contact.email}</span>
                </span>
              )}
              {suggestion.contact.web && (
                <span className="flex items-center gap-1 min-w-0">
                  <Globe size={11} className="text-gray-400 shrink-0" />
                  <span className="truncate" title={suggestion.contact.web}>{suggestion.contact.web}</span>
                </span>
              )}
            </div>

            {/*
              詳細はモーダルで開く。カード全体をクリック可能にすると、常時表示している
              連絡先の選択やリンクを妨げるため、明示的なボタンにする。
            */}
            <button
              onClick={onOpenDetail}
              className="w-full flex items-center justify-center gap-1 mt-1 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:border-yoss-yellow hover:text-yoss-yellow-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yoss-yellow/40"
            >
              {/* 件数はモーダルで実際に表示されるレビュー（団体全体）の数に合わせる */}
              {suggestion.organizationReview.count > 0
                ? `レビューと詳細を見る（${suggestion.organizationReview.count}件）`
                : '詳細を見る'}
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
