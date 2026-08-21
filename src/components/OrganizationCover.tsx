import { Building2, HandHeart, Landmark, Sprout, Store, Users } from 'lucide-react';
import type { Organization, OrganizationType } from '../types';

/**
 * 団体の表紙。公開一覧（画面F）のカードと、公開ページ（画面E）の見出しで共有する。
 *
 * 写真を持たないので、地色は団体の種別から作る。全部同じ地色だと一覧が平坦になって
 * 団体を見分けられない。色が意味を持つのはここ（種別）だけで、バッジ・達成率・
 * ボタンは黄色のまま——ブランドの色と、押せる場所の色は動かさない。
 *
 * 一覧と詳細で同じ絵を出すことで、カードから入った先が同じ団体だと分かるようにする。
 */

const TYPE_ART: Record<OrganizationType, { gradient: string; icon: typeof Building2 }> = {
  NPO: { gradient: 'from-amber-400 via-orange-400 to-rose-400', icon: HandHeart },
  社会福祉協議会: { gradient: 'from-sky-400 via-cyan-400 to-teal-400', icon: Landmark },
  自治体事業: { gradient: 'from-indigo-400 via-violet-400 to-purple-400', icon: Building2 },
  ボランティア団体: { gradient: 'from-emerald-400 via-green-400 to-lime-400', icon: Sprout },
  民間企業: { gradient: 'from-slate-400 via-gray-400 to-zinc-400', icon: Store },
  その他: { gradient: 'from-rose-400 via-pink-400 to-fuchsia-400', icon: Users },
};

/** 写真が無いぶん、光の粒を散らして平面に見えないようにする */
const TEXTURE = {
  backgroundImage:
    'radial-gradient(circle at 20% 20%, rgba(255,255,255,.45) 0, transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,.3) 0, transparent 40%)',
};

export default function OrganizationCover({
  org,
  className = '',
  iconSize = 160,
  children,
}: {
  org: Organization;
  className?: string;
  iconSize?: number;
  /** 表紙の上に載せるもの（団体名など）。無ければ絵だけ */
  children?: React.ReactNode;
}) {
  const art = TYPE_ART[org.type];
  const Icon = art.icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${art.gradient} ${className}`}>
      <div className="absolute inset-0" style={TEXTURE} />
      <Icon
        size={iconSize}
        strokeWidth={1.25}
        className="absolute -right-8 -bottom-8 text-white/25"
      />
      {children}
    </div>
  );
}
