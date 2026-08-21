import { Coins, HeartHandshake, Mail, MapPin, Phone, Globe, Users } from 'lucide-react';
import ContributionProgress from './ContributionProgress';
import OrganizationCover from './OrganizationCover';
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
 * 見出しは一覧（画面F）のカードと同じ表紙を使う。カードから入った先が
 * 同じ団体だと分かるようにするため。
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

  const contacts = [
    { icon: Phone, value: org.contact.tel },
    { icon: Mail, value: org.contact.email },
    { icon: Globe, value: org.contact.web },
  ].filter(c => c.value);

  return (
    <>
      {/* 表紙。団体名を写真の上に置く見せ方に寄せる */}
      <OrganizationCover org={org} className="h-72 sm:h-96" iconSize={340}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-5xl mx-auto px-5 pb-12">
            <div className="flex items-center gap-2 text-[11px] text-white/90 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-white/95 text-yoss-dark font-bold">
                {org.type}
              </span>
              <span className="flex items-center gap-1 drop-shadow">
                <MapPin size={12} />
                {org.area.prefecture}
                {org.area.city}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
              {org.name}
            </h1>
            <p className="text-sm text-white/90 mt-2 drop-shadow">{org.operator}</p>
          </div>
        </div>
      </OrganizationCover>

      {/* 本文は表紙に少し重ねる。境目をまたぐことで1枚のページとして続いて見える */}
      <div className="max-w-5xl mx-auto px-5 py-10 grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 sm:p-8">
            <p className="text-base text-gray-700 leading-relaxed">{org.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-5 pt-5 border-t border-gray-100">
              {org.categories.map(category => (
                <span
                  key={category}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-yoss-yellow-light border border-yoss-yellow/40 text-yoss-yellow-dark font-bold"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {(org.story || org.description) && (
            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7 sm:p-9">
              <h2 className="text-xl font-bold text-yoss-dark">この取り組みについて</h2>
              <div className="w-10 h-1 rounded-full bg-yoss-yellow mt-3 mb-6" />
              <div className="text-[15px] text-gray-700 leading-loose whitespace-pre-line">
                {org.story || org.description}
              </div>
            </section>
          )}

          <section id="contributions" className="scroll-mt-20">
            <div className="px-1 mb-4">
              <h2 className="text-xl font-bold text-yoss-dark">いま必要としているもの</h2>
              <p className="text-xs text-gray-500 mt-1.5">
                団体がYOSSに登録した内容から、そのまま表示しています。
              </p>
            </div>

            <div className="space-y-6">
              {CONTRIBUTION_TYPES.map(type => {
                const ofType = items.filter(({ c }) => c.type === type);
                if (ofType.length === 0) return null;

                const meta = TYPE_META[type];
                const Icon = meta.icon;

                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="w-7 h-7 rounded-lg bg-yoss-yellow-light flex items-center justify-center">
                        <Icon size={15} className="text-yoss-yellow-dark" />
                      </span>
                      <h3 className="font-bold text-sm text-yoss-dark">{type}</h3>
                      <span className="text-[11px] text-gray-400">{meta.lead}</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {ofType.map(({ c, p }) => (
                        <div
                          key={c.id}
                          className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col shadow-sm hover:shadow-lg hover:border-yoss-yellow/60 transition-all"
                        >
                          <h4 className="font-bold text-yoss-dark leading-snug">{c.name}</h4>
                          <p className="text-xs text-gray-500 mt-2 leading-relaxed flex-1">
                            {c.description}
                          </p>

                          <div className="mt-5">
                            <ContributionProgress progress={p} />
                          </div>

                          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <Users size={11} />
                              {p.supporters.toLocaleString('ja-JP')}人が支援
                            </span>
                            <button
                              onClick={() => onSupport?.(c)}
                              disabled={!onSupport}
                              className="px-5 py-2.5 rounded-xl bg-yoss-yellow text-white text-xs font-bold hover:bg-yoss-yellow-dark transition-colors shadow-md shadow-yoss-yellow/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
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
                <p className="text-sm text-gray-400 bg-white border border-gray-200 rounded-2xl p-10 text-center">
                  いまは募集していません。
                </p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-7">
            <h2 className="font-bold text-yoss-dark">お問い合わせ</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              {contacts.map(({ icon: Icon, value }) => (
                <span key={value} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Icon size={13} className="text-gray-400" />
                  {value}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* 支援状況。追従はさせない——本文が長く、右カラムが空いたまま付いてくると落ち着かない */}
        <aside>
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-lg">
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
                <p className="mt-2 text-[11px] text-gray-500">
                  <span className="font-bold text-yoss-yellow-dark text-sm">{percent}%</span>
                  <span className="ml-1.5">目標金額は {goal.toLocaleString('ja-JP')}円</span>
                </p>
              </>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Users size={11} />
                  支援者数
                </div>
                <p className="mt-0.5">
                  <span className="text-2xl font-bold text-yoss-dark">
                    {supporters.toLocaleString('ja-JP')}
                  </span>
                  <span className="text-sm font-bold text-yoss-dark ml-0.5">人</span>
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <HeartHandshake size={11} />
                  足りていない募集
                </div>
                <p className="mt-0.5">
                  <span className="text-2xl font-bold text-yoss-dark">{shortages}</span>
                  <span className="text-sm font-bold text-yoss-dark ml-0.5">件</span>
                </p>
              </div>
            </div>

            <a
              href="#contributions"
              className="mt-6 w-full py-3.5 rounded-xl bg-yoss-yellow text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-yoss-yellow-dark transition-colors shadow-lg shadow-yoss-yellow/25"
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
