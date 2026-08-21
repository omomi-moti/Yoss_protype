import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, RotateCcw } from 'lucide-react';
import Modal from '../components/Modal';
import PublicHeader from '../components/PublicHeader';
import PublicOrganizationView from '../components/PublicOrganizationView';
import { TYPE_META } from '../components/contributionTypeMeta';
import { addSupport, resetSupport } from '../data/supportStore';
import { useOrganizationStore } from '../hooks/useOrganizationStore';
import { useSupportStore } from '../hooks/useSupportStore';
import type { Organization, OrganizationContribution } from '../types';

/**
 * 画面E：支援団体の公開ページ（一般向け・管理サイドバーの外側）。
 *
 * 団体が画面Aで登録し、公開した内容だけから組み立てる（下書きは出さない）。
 * 児童に由来するデータは一切出さない（issue #42）。
 *
 * 中身の描画は PublicOrganizationView に置いて、画面Aのプレビューと共有する。
 */

/** 寄付金の金額候補。毎回キーボードを出させないための既定値 */
const AMOUNT_PRESETS = [1000, 3000, 5000, 10000];

export default function OrganizationPublicPage() {
  const { id } = useParams();
  const { published } = useOrganizationStore();
  const tally = useSupportStore();
  const [target, setTarget] = useState<OrganizationContribution | null>(null);
  const [thanksFor, setThanksFor] = useState<string | null>(null);

  const org = published.find(o => o.id === id);

  if (!org) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <PublicHeader backTo={{ to: '/orgs', label: '支援団体一覧' }} />
        <div className="max-w-5xl mx-auto px-5 py-20 text-center">
          <p className="text-sm text-gray-500">この団体の公開ページは見つかりませんでした。</p>
          <Link to="/orgs" className="text-xs text-yoss-link mt-2 inline-block">
            支援団体一覧へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <PublicHeader backTo={{ to: '/orgs', label: '支援団体一覧' }} />

      <PublicOrganizationView org={org} tally={tally} onSupport={setTarget} />

      {/* プロトタイプなので、デモを繰り返せるように積み上がった分を消せるようにする */}
      <div className="max-w-5xl mx-auto px-5 pb-10 text-center">
        <button
          onClick={resetSupport}
          className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600"
        >
          <RotateCcw size={11} />
          このページで記録した支援をリセットする
        </button>
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

  const [amount, setAmount] = useState<string>(String(isMoney ? AMOUNT_PRESETS[1] : 1));

  const parsed = Number(amount);
  const canSubmit = amount !== '' && Number.isFinite(parsed) && parsed > 0;

  const submit = () => {
    if (!canSubmit) return;
    addSupport(contribution.id, parsed);
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
                      onClick={() => setAmount(String(preset))}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        parsed === preset
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
                onChange={e => setAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
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
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-xl bg-yoss-yellow text-white font-bold text-sm hover:bg-yoss-yellow-dark disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            {TYPE_META[contribution.type].cta}
          </button>
        </div>
      </div>
    </Modal>
  );
}
