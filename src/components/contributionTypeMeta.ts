import { Coins, Package, Users } from 'lucide-react';
import type { ContributionType } from '../types';

/**
 * 3種別の見せ方。画面Eの一覧と支援モーダルで共有する。
 *
 * コンポーネントのファイルから出すと Fast Refresh が効かなくなるため、
 * 定数だけを別ファイルに置く。
 */
export const TYPE_META: Record<
  ContributionType,
  { icon: typeof Coins; lead: string; cta: string }
> = {
  寄付金: { icon: Coins, lead: '運営そのものを支える', cta: '寄付する' },
  物品: { icon: Package, lead: '必要なものを届ける', cta: '物品を送る' },
  ボランティア: { icon: Users, lead: '人手として関わる', cta: '応募する' },
};
