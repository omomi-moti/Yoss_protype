import { ArrowRight, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrganizationCover from './OrganizationCover';
import { CONTRIBUTION_TYPES } from '../data/organizations';
import { progressOf, type SupportTally } from '../data/supportStore';
import type { Organization } from '../types';

/**
 * 公開一覧（画面F）に並べる団体カード。
 *
 * 画面Cの OrganizationCard とは別物。あちらは学校が支援を探すためのもので、
 * 対応可能な支援とレビューを詰めて出す。こちらは一般の人が「気になるか」を
 * 決めるためのもので、出すのは何を募集していてどれだけ足りていないか。
 *
 * 大きさは全団体で揃える。募集の有無でカードの体裁が変わると、
 * 募集していない団体が作りかけに見えるため。
 *
 * linkable が false のときは遷移しない（プロトタイプで詳細を用意しているのは
 * 画面Aで編集できる団体だけ）。ただしボタンの見た目は同じにする。
 */
export default function PublicOrganizationCard({
  org,
  tally,
  linkable,
}: {
  org: Organization;
  tally: SupportTally;
  linkable: boolean;
}) {
  const items = org.contributions.filter(c => c.enabled).map(c => ({ c, p: progressOf(c, tally) }));
  const money = items.filter(({ c }) => c.type === '寄付金');
  const goal = money.reduce((sum, { p }) => sum + (p.goal ?? 0), 0);
  const raised = money.reduce((sum, { p }) => sum + p.current, 0);
  const percent = goal > 0 ? Math.round((raised / goal) * 100) : null;
  const supporters = items.reduce((sum, { p }) => sum + p.supporters, 0);
  const types = CONTRIBUTION_TYPES.filter(type => items.some(({ c }) => c.type === type));
  const supportCount = org.supports.filter(x => x.enabled).length;

  const body = (
    <div
      className={`h-full bg-white rounded-3xl border border-gray-200 overflow-hidden transition-all ${
        linkable ? 'hover:border-yoss-yellow hover:shadow-2xl hover:-translate-y-1' : ''
      }`}
    >
      <div className="grid sm:grid-cols-5 h-full">
        <OrganizationCover
          org={org}
          className="h-40 sm:h-auto sm:col-span-2 min-h-[230px]"
          iconSize={220}
        >
          <span className="absolute left-5 bottom-5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-yoss-dark">
            {org.type}
          </span>
        </OrganizationCover>

        <div className="sm:col-span-3 p-6 sm:p-7 flex flex-col">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            {items.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-yoss-yellow text-white font-bold">
                募集中
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <MapPin size={11} />
              {org.area.prefecture}
              {org.area.city}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-yoss-dark leading-tight mt-2.5">
            {org.name}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-3">
            {org.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {items.length > 0
              ? types.map(type => (
                  <span
                    key={type}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-yoss-yellow-light text-yoss-yellow-dark font-bold border border-yoss-yellow/40"
                  >
                    {type}を募集
                  </span>
                ))
              : org.categories.map(category => (
                  <span
                    key={category}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200"
                  >
                    {category}
                  </span>
                ))}
          </div>

          <div className="mt-auto pt-6">
            {percent !== null ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-yoss-dark tracking-tight">
                    {raised.toLocaleString('ja-JP')}
                  </span>
                  <span className="text-sm font-bold text-yoss-dark">円</span>
                  <span className="text-lg font-bold text-yoss-yellow-dark ml-1">{percent}%</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                    <Users size={13} />
                    {supporters.toLocaleString('ja-JP')}人が支援
                  </span>
                </div>
                <div className="mt-2 w-full h-2.5 rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${
                      percent >= 100
                        ? 'bg-yoss-green'
                        : 'bg-gradient-to-r from-yoss-yellow to-yoss-yellow-dark'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </>
            ) : items.length > 0 ? (
              <p className="flex items-center gap-1 text-sm text-gray-600">
                <Users size={14} />
                {supporters.toLocaleString('ja-JP')}人が支援しています
              </p>
            ) : (
              /* 募集が無くても、学校と繋がっている団体であることは出す。空白にしない */
              <p className="text-sm text-gray-600">
                学校に対応可能な支援を
                <span className="font-bold text-yoss-dark mx-0.5">{supportCount}件</span>
                登録しています
              </p>
            )}

            {/*
              遷移しないカードにも同じボタンを置く。一覧の中で1枚だけ体裁が違うと、
              そこだけ作りかけに見えるため。押せる要素にはせず span で置く——
              フォーカスが当たって何も起きないより、見た目だけ揃えるほうが混乱が少ない。
            */}
            <span className="mt-5 w-full py-3 rounded-xl bg-yoss-yellow text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-yoss-yellow/20">
              この団体の取り組みを見る
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!linkable) return body;

  return (
    <Link to={`/orgs/${org.id}`} className="block h-full">
      {body}
    </Link>
  );
}
