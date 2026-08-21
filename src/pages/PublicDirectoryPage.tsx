import PublicHeader from '../components/PublicHeader';
import PublicOrganizationCard from '../components/PublicOrganizationCard';
import { useOrganizationStore } from '../hooks/useOrganizationStore';
import { useSupportStore } from '../hooks/useSupportStore';
import { progressOf } from '../data/supportStore';

/**
 * 画面F：支援団体の公開一覧（一般向け）。
 *
 * 画面Cの支援団体ディレクトリとは別物。あちらは学校が児童に合う支援を探すためのもので、
 * 8領域と種別で絞り込む。こちらは一般の人が支援先を見つけるためのもので、
 * 出すのは「何を募集していて、どれだけ足りていないか」。
 *
 * 詳細ページ（画面E）へ進めるのは、画面Aで編集できる自団体だけ。
 * プロトタイプで内容を作り込んでいるのがその1件だけなので、他は一覧に並ぶところまで。
 * その1件は先頭に大きく置いて、入って読める団体がどれかを大きさで示す。
 */
export default function PublicDirectoryPage() {
  const { published } = useOrganizationStore();
  const tally = useSupportStore();

  const featured = published.find(o => o.isMine);
  const rest = published.filter(o => o !== featured);

  const recruiting = published.filter(o => o.contributions.some(c => c.enabled));
  const totals = recruiting
    .flatMap(o => o.contributions.filter(c => c.enabled).map(c => progressOf(c, tally)))
    .reduce(
      (acc, p) => ({ supporters: acc.supporters + p.supporters, shortages: acc.shortages + (p.remaining > 0 ? 1 : 0) }),
      { supporters: 0, shortages: 0 }
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <PublicHeader />

      <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-yoss-yellow-light via-white to-[#FAFAFA]">
        {/* 見出しの背後に置く光。写真が無いぶん、上部が白く抜けないようにする */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 15%, rgba(245,166,35,.22) 0, transparent 45%), radial-gradient(circle at 10% 90%, rgba(245,166,35,.12) 0, transparent 40%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-5 pt-14 pb-12">
          <p className="text-[11px] font-bold text-yoss-yellow-dark tracking-widest mb-3">
            YOSS で地域とつながる
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-yoss-dark leading-[1.15] max-w-2xl">
            この地域の子どもに、
            <br />
            いま足りていないもの。
          </h1>
          <p className="text-base text-gray-600 mt-5 max-w-xl leading-relaxed">
            学校と繋がっている団体が、必要としているものをそのまま公開しています。
            寄付でも、お米ひと袋でも、月に一度の手伝いでも構いません。
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-8">
            {[
              { label: '登録団体', value: published.length, unit: '団体' },
              { label: '募集中', value: recruiting.length, unit: '団体' },
              { label: 'まだ足りていない募集', value: totals.shortages, unit: '件' },
              { label: 'これまでの支援者', value: totals.supporters, unit: '人' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-[10px] text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-yoss-dark tracking-tight">
                  {stat.value.toLocaleString('ja-JP')}
                  <span className="text-xs font-bold ml-0.5">{stat.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10 space-y-10">
        {featured && (
          <section>
            <h2 className="text-sm font-bold text-yoss-dark mb-3">いま支援を募集しています</h2>
            <PublicOrganizationCard org={featured} tally={tally} linkable />
          </section>
        )}

        <section>
          <h2 className="text-sm font-bold text-yoss-dark mb-3">この地域の団体</h2>
          <div className="space-y-4">
            {rest.map(org => (
              <PublicOrganizationCard key={org.id} org={org} tally={tally} linkable={false} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
