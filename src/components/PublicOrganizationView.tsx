import { Coins, HeartHandshake, MapPin, Users } from 'lucide-react';
import ContributionProgress from './ContributionProgress';
import { TYPE_META } from './contributionTypeMeta';
import { CONTRIBUTION_TYPES } from '../data/organizations';
import { progressOf, type SupportTally } from '../data/supportStore';
import type { Organization, OrganizationContribution } from '../types';

/**
 * 画面E（公開ページ）の中身。
 *
 * 画面Eそのものと、画面Aの「一般の方からの見え方」プレビューで共有する。
 * プレビューが本物と違う見た目だと、確認したことにならないため。
 *
 * onSupport を渡さないときはプレビュー扱いで、支援ボタンを押せなくする。
 */

export default function PublicOrganizationView({
  org,
  tally,
  onSupport,
}: {
  org: Organization;
  tally: SupportTally;
  /** 省略するとプレビュー（支援ボタンは押せない） */
  onSupport?: (contribution: OrganizationContribution) => void;
}) {
  const items = org.contributions.filter(c => c.enabled).map(c => ({ c, p: progressOf(c, tally) }));

  // 寄付金は金額を合算し、支援者数は3種別すべてを合わせる
  const money = items.filter(({ c }) => c.type === '寄付金');
  const raised = money.reduce((sum, { p }) => sum + p.current, 0);
  const goal = money.reduce((sum, { p }) => sum + (p.goal ?? 0), 0);
  const supporters = items.reduce((sum, { p }) => sum + p.supporters, 0);
  const shortages = items.filter(({ p }) => p.goal !== null && p.remaining > 0).length;
  const percent = goal > 0 ? Math.round((raised / goal) * 100) : null;

  return (
    <>
      {/* ヒーロー。写真を持たないので、地の色と余白で「読み物」の入口を作る */}
      <div className="bg-gradient-to-br from-yoss-yellow-light via-white to-[#FAFAFA] border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 pt-12 pb-10">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-3">
            <span className="px-2 py-0.5 rounded-full bg-white border border-gray-200 font-bold">
              {org.type}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {org.area.prefecture}
              {org.area.city}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-yoss-dark leading-tight">{org.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{org.operator}</p>
          <p className="text-base text-gray-600 mt-5 max-w-2xl leading-relaxed">{org.description}</p>

          <div className="flex flex-wrap gap-1.5 mt-6">
            {org.categories.map(category => (
              <span
                key={category}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-yoss-yellow/40 text-yoss-yellow-dark font-bold"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10 grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-10">
          {(org.story || org.description) && (
            <section>
              <h2 className="text-lg font-bold text-yoss-dark mb-4">この取り組みについて</h2>
              <div className="text-[15px] text-gray-700 leading-loose whitespace-pre-line">
                {org.story || org.description}
              </div>
            </section>
          )}

          <section id="contributions">
            <h2 className="text-lg font-bold text-yoss-dark">いま必要としているもの</h2>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              団体がYOSSに登録した内容から、そのまま表示しています。
            </p>

            <div className="space-y-8">
              {CONTRIBUTION_TYPES.map(type => {
                const ofType = items.filter(({ c }) => c.type === type);
                if (ofType.length === 0) return null;

                const meta = TYPE_META[type];
                const Icon = meta.icon;

                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={16} className="text-yoss-yellow-dark" />
                      <h3 className="font-bold text-sm text-yoss-dark">{type}</h3>
                      <span className="text-[11px] text-gray-400">{meta.lead}</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {ofType.map(({ c, p }) => (
                        <div
                          key={c.id}
                          className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col hover:border-yoss-yellow/60 transition-colors"
                        >
                          <h4 className="font-bold text-yoss-dark leading-snug">{c.name}</h4>
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed flex-1">
                            {c.description}
                          </p>

                          <div className="mt-4">
                            <ContributionProgress progress={p} />
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <span className="text-[11px] text-gray-400">
                              {p.supporters.toLocaleString('ja-JP')}人が支援
                            </span>
                            <button
                              onClick={() => onSupport?.(c)}
                              disabled={!onSupport}
                              className="px-4 py-2 rounded-lg bg-yoss-yellow text-white text-xs font-bold hover:bg-yoss-yellow-dark transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                            >
                              {meta.cta}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {items.length === 0 && (
                <p className="text-sm text-gray-400 bg-white border border-gray-200 rounded-2xl p-8 text-center">
                  いまは募集していません。
                </p>
              )}
            </div>
          </section>

          <section className="text-xs text-gray-500 bg-white border border-gray-200 rounded-2xl p-5 leading-relaxed">
            <p className="font-bold text-yoss-dark mb-1">お問い合わせ</p>
            {org.contact.tel && <p>電話：{org.contact.tel}</p>}
            {org.contact.email && <p>メール：{org.contact.email}</p>}
            {org.contact.web && <p>Web：{org.contact.web}</p>}
          </section>
        </div>

        {/* 支援状況。スクロールしても達成状況が見えたままになるよう追従させる */}
        <aside className="lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Coins size={13} />
              現在の支援総額
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-bold text-yoss-dark tracking-tight">
                {raised.toLocaleString('ja-JP')}
              </span>
              <span className="text-lg font-bold text-yoss-dark">円</span>
            </div>

            {goal > 0 && (
              <>
                <div className="mt-3 w-full h-3 rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      (percent ?? 0) >= 100
                        ? 'bg-yoss-green'
                        : 'bg-gradient-to-r from-yoss-yellow to-yoss-yellow-dark'
                    }`}
                    style={{ width: `${Math.min(percent ?? 0, 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500">
                  <span className="font-bold text-yoss-yellow-dark">{percent}%</span>
                  <span className="ml-1.5">目標金額は {goal.toLocaleString('ja-JP')}円</span>
                </p>
              </>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <Users size={13} />
                支援者数
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-yoss-dark">
                  {supporters.toLocaleString('ja-JP')}
                </span>
                <span className="text-base font-bold text-yoss-dark">人</span>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <HeartHandshake size={13} />
                まだ足りていない募集
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-yoss-dark">{shortages}</span>
                <span className="text-base font-bold text-yoss-dark">件</span>
              </div>
            </div>

            <a
              href="#contributions"
              className="mt-6 w-full py-3 rounded-xl bg-yoss-yellow text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-yoss-yellow-dark transition-colors shadow-lg shadow-yoss-yellow/20"
            >
              <HeartHandshake size={17} />
              この団体を支援する
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
