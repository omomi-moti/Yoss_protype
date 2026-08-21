import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Coins, HeartHandshake, MapPin, Package, RotateCcw, Users } from 'lucide-react';
import ContributionProgress from '../components/ContributionProgress';
import Modal from '../components/Modal';
import { CONTRIBUTION_TYPES } from '../data/organizations';
import { addSupport, progressOf, resetSupport } from '../data/supportStore';
import { useOrganizationStore } from '../hooks/useOrganizationStore';
import { useSupportStore } from '../hooks/useSupportStore';
import type { ContributionType, Organization, OrganizationContribution } from '../types';

/**
 * 画面E：支援団体の公開ページ（一般向け・管理サイドバーの外側）。
 *
 * 団体が画面Aで登録した内容だけから組み立てる。団体側に別途ページを作らせない。
 * 児童に由来するデータは一切出さない（issue #42）。
 *
 * 見た目は管理画面と揃えていない。見る人が違うためで、OrganizationCard も再利用しない
 * ——一覧に並べるための密なカードと、一枚で読ませるページでは目的が違う。
 */

const TYPE_META: Record<ContributionType, { icon: typeof Coins; lead: string; cta: string }> = {
  寄付金: { icon: Coins, lead: '運営そのものを支える', cta: '寄付する' },
  物品: { icon: Package, lead: '必要なものを届ける', cta: '物品を送る' },
  ボランティア: { icon: Users, lead: '人手として関わる', cta: '応募する' },
};

/** 寄付金の金額候補。毎回キーボードを出させないための既定値 */
const AMOUNT_PRESETS = [1000, 3000, 5000, 10000];

function PublicHeader() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-yoss-yellow rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-[11px]">Y</span>
        </div>
        <span className="font-bold tracking-wide text-yoss-dark">YOSS</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yoss-yellow-light text-yoss-yellow-dark">
          PROTOTYPE
        </span>
        <Link
          to="/dashboard"
          className="ml-auto flex items-center gap-1 text-[11px] text-gray-500 hover:text-yoss-link"
        >
          <ArrowLeft size={12} />
          管理画面に戻る
        </Link>
      </div>
    </header>
  );
}

export default function OrganizationPublicPage() {
  const { id } = useParams();
  const { published } = useOrganizationStore();
  const tally = useSupportStore();
  const [target, setTarget] = useState<OrganizationContribution | null>(null);
  const [thanksFor, setThanksFor] = useState<string | null>(null);

  const org = published.find(o => o.id === id);

  const items = useMemo(
    () => (org?.contributions ?? []).filter(c => c.enabled).map(c => ({ c, p: progressOf(c, tally) })),
    [org, tally]
  );

  // ページ上部のサマリー。寄付金は金額を合算し、支援者数は3種別すべてを合わせる
  const summary = useMemo(() => {
    const money = items.filter(({ c }) => c.type === '寄付金');
    return {
      raised: money.reduce((sum, { p }) => sum + p.current, 0),
      goal: money.reduce((sum, { p }) => sum + (p.goal ?? 0), 0),
      supporters: items.reduce((sum, { p }) => sum + p.supporters, 0),
      shortages: items.filter(({ p }) => p.goal !== null && p.remaining > 0).length,
    };
  }, [items]);

  if (!org) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <PublicHeader />
        <div className="max-w-5xl mx-auto px-5 py-20 text-center">
          <p className="text-sm text-gray-500">この団体の公開ページは見つかりませんでした。</p>
          <Link to="/dashboard" className="text-xs text-yoss-link mt-2 inline-block">
            支援団体ディレクトリへ
          </Link>
        </div>
      </div>
    );
  }

  const percent = summary.goal > 0 ? Math.round((summary.raised / summary.goal) * 100) : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <PublicHeader />

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
        {/* 本文 */}
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
                              onClick={() => setTarget(c)}
                              className="px-4 py-2 rounded-lg bg-yoss-yellow text-white text-xs font-bold hover:bg-yoss-yellow-dark transition-colors"
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
                {summary.raised.toLocaleString('ja-JP')}
              </span>
              <span className="text-lg font-bold text-yoss-dark">円</span>
            </div>

            {summary.goal > 0 && (
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
                  <span className="ml-1.5">目標金額は {summary.goal.toLocaleString('ja-JP')}円</span>
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
                  {summary.supporters.toLocaleString('ja-JP')}
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
                <span className="text-3xl font-bold text-yoss-dark">{summary.shortages}</span>
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

          {/* プロトタイプなので、デモを繰り返せるように積み上がった分を消せるようにする */}
          <button
            onClick={resetSupport}
            className="mt-3 w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-600"
          >
            <RotateCcw size={11} />
            このページで記録した支援をリセットする
          </button>
        </aside>
      </div>

      {target && (
        <SupportModal
          contribution={target}
          organization={org}
          onClose={() => setTarget(null)}
          onDone={name => {
            setTarget(null);
            setThanksFor(name);
            setTimeout(() => setThanksFor(current => (current === name ? null : current)), 4000);
          }}
        />
      )}

      {thanksFor && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-yoss-dark text-white text-xs px-4 py-3 rounded-xl shadow-xl">
          <Check size={14} className="text-yoss-green" strokeWidth={3} />
          「{thanksFor}」への支援を記録しました
        </div>
      )}
    </div>
  );
}

/**
 * 支援の申し込み。決済も送信もせず、数だけを記録する。
 * 名前・連絡先は取らない（プロトタイプで扱う必要がなく、個人情報を持たずに済むため）。
 */
function SupportModal({
  contribution,
  organization,
  onClose,
  onDone,
}: {
  contribution: OrganizationContribution;
  organization: Organization;
  onClose: () => void;
  onDone: (name: string) => void;
}) {
  const isMoney = contribution.type === '寄付金';
  const isVolunteer = contribution.type === 'ボランティア';
  const unit = isMoney ? '円' : isVolunteer ? '名' : contribution.unit || '';

  const [amount, setAmount] = useState<number>(isMoney ? AMOUNT_PRESETS[1] : 1);

  const submit = () => {
    if (amount <= 0) return;
    addSupport(contribution.id, amount);
    onDone(contribution.name);
  };

  return (
    <Modal onClose={onClose} labelledBy="support-title" size="sm">
      <div className="p-6">
        <p className="text-[11px] text-gray-400">{organization.name}</p>
        <h2 id="support-title" className="text-lg font-bold text-yoss-dark mt-0.5">
          {contribution.name}
        </h2>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{contribution.description}</p>

        <div className="mt-5">
          {isVolunteer ? (
            <p className="text-xs text-gray-500">1名として応募します。</p>
          ) : (
            <>
              <label className="text-[10px] text-gray-400 font-bold">
                {isMoney ? '金額' : '数量'}（{unit}）
              </label>
              {isMoney && (
                <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                  {AMOUNT_PRESETS.map(preset => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        amount === preset
                          ? 'bg-yoss-yellow-light border-yoss-yellow text-yoss-yellow-dark font-bold'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {preset.toLocaleString('ja-JP')}円
                    </button>
                  ))}
                </div>
              )}
              <input
                type="number"
                min={1}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
              />
            </>
          )}
        </div>

        <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
          プロトタイプのため決済と申し込みの送信は行いません。押すと達成状況にだけ反映されます。
        </p>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50"
          >
            やめる
          </button>
          <button
            onClick={submit}
            disabled={amount <= 0}
            className="flex-1 py-2.5 rounded-xl bg-yoss-yellow text-white font-bold text-sm hover:bg-yoss-yellow-dark disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            {TYPE_META[contribution.type].cta}
          </button>
        </div>
      </div>
    </Modal>
  );
}
