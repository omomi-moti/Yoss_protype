import { Phone, Mail, Globe } from 'lucide-react';
import StarRating from './StarRating';
import type { SupportSuggestion } from '../types';

/**
 * 校内チーム会議（画面D）で表示する支援候補のカード。
 *
 * 視線が左右に往復しないよう、判断に必要な情報（支援名・評価）は左揃えの1本の縦線に置く。
 * 内容は「名前と評価」「何をしてくれるか」「利用条件」「実績と連絡先」の4ブロックに分け、
 * ブロック間の余白をブロック内の行間より大きく取って塊として読めるようにする。
 *
 * 連絡先は折りたたまず常に出す。開閉はレイアウトを伸ばしてスクロールを強いる割に、
 * 中身が電話番号とURLだけで量が少なく、操作コストのほうが大きいため。
 */
export default function SuggestionCard({ suggestion, rank }: {
  suggestion: SupportSuggestion;
  /** 領域内の表示順（レビュー評価が高い順）。縦スキャンの起点になる */
  rank: number;
}) {
  // 実績の有無は枠線の実線／破線で表す
  return (
    // h-full で行内の他のカードと高さを揃える（グリッドが行の高さを最も高いカードに合わせる）
    <div className={`bg-white rounded-xl border border-gray-200 p-5 h-full transition-colors hover:border-yoss-yellow/60 ${
      suggestion.isNew ? 'border-dashed' : ''
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
            {suggestion.review.averageRating !== null ? (
              <div className="mt-1.5">
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(suggestion.review.averageRating)} size={13} />
                  <span className="text-sm font-bold text-yoss-dark">
                    {suggestion.review.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  団体へのレビュー {suggestion.review.count}件
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 mt-1.5">
                学校からのレビューはまだありません
              </p>
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
          </div>

          {/*
            ③利用条件：ラベルの位置を固定した定義リストにする。
            どのカードでも同じ行に同じ項目が来るので、カードをまたいだ比較が視線移動なしでできる。
          */}
          <dl className="bg-gray-50 rounded-lg px-3 py-2 space-y-0.5">
            {[
              { label: '対象', value: suggestion.targetGrades },
              { label: '費用', value: suggestion.cost },
              { label: '定員', value: suggestion.capacity },
            ].map(item => (
              <div key={item.label} className="flex gap-3 text-xs">
                <dt className="text-gray-400 w-7 shrink-0">{item.label}</dt>
                {/* 登録画面で空のまま公開できる項目なので、未記入は「—」で埋める */}
                <dd className={item.value ? 'font-bold text-yoss-dark' : 'text-gray-300'}>
                  {item.value || '—'}
                </dd>
              </div>
            ))}
          </dl>

          {/* ④実績と連絡先。mt-auto でカード下端に揃え、行内のカードで位置が一致するようにする */}
          <div className="space-y-1.5 mt-auto">
            {suggestion.isNew ? (
              <p className="text-[11px] text-gray-400">市内の利用実績なし</p>
            ) : (
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span className="whitespace-nowrap">市内 <strong className="text-yoss-dark">{suggestion.cityWideCount}</strong>件</span>
                <span className="whitespace-nowrap">御校 <strong className="text-yoss-dark">{suggestion.schoolCount}</strong>件</span>
                <span className="whitespace-nowrap">継続率 <strong className="text-yoss-green">{suggestion.continuationRate}%</strong></span>
              </div>
            )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
