import { DOMAIN_GROUP_LABELS, overviewSections, previousAnswers } from '../data/screening';
import ScreeningChangeLegend from './ScreeningChangeLegend';
import ScreeningScoreBoxes from './ScreeningScoreBoxes';
import type { ScreeningOwner, Student } from '../types';

/**
 * タブ②の「全項目一覧」。37項目を入力面ごとに並べて、1画面で見渡す。
 *
 * 入力面ごとの表示（ScreeningItemPanel）と対になるもので、切り替えて使う。
 * あちらは「その担当が何を入力するか」を読む面なので、判断基準の文まで出して行を厚くする。
 * こちらは「どの領域に点が付いたか」を読む面なので、基準の文は落として項目名と点数だけにし、
 * 領域をカードに分けて横に並べる。同じ内容を同じ密度で2回出しても、見比べる意味がない。
 *
 * 入力面の見出しは実物と同じく1文字のバッジを付ける。カードが横に並ぶと、
 * どこからどこまでが同じ担当の入力なのかが分かりにくくなるため。
 */

/** 入力面のバッジ。実物の一覧に付いている1文字の印に合わせる */
const OWNER_BADGES: Record<ScreeningOwner, { short: string; className: string }> = {
  データ: { short: 'デ', className: 'bg-gray-100 text-gray-500' },
  学級: { short: '学', className: 'bg-rose-50 text-rose-500' },
  特別支援: { short: '特', className: 'bg-purple-50 text-purple-500' },
  養護: { short: '養', className: 'bg-emerald-50 text-emerald-600' },
  事務: { short: '事', className: 'bg-amber-50 text-amber-600' },
  '管理職・生指': { short: '管', className: 'bg-blue-50 text-blue-500' },
  '地域・調査': { short: '地', className: 'bg-cyan-50 text-cyan-600' },
};

/** 丸囲みの数字。実物の一覧が①〜⑩を丸で出しているのに合わせる（11以降は素の数字） */
function itemNumber(id: number): string {
  return id <= 10 ? '①②③④⑤⑥⑦⑧⑨⑩'[id - 1] : String(id);
}

export default function ScreeningOverviewPanel({ student }: { student: Student }) {
  const current = student.answers;
  const previous = previousAnswers(current);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3 flex-wrap">
        <p className="text-xs text-gray-500">
          37項目すべてを入力面ごとに並べています。付いた点数の合計が領域スコアになります ／
          色は前学期との比較
        </p>
        <div className="ml-auto">
          <ScreeningChangeLegend />
        </div>
      </div>

      {/*
        セクションは受け持つ領域の数だけ幅を取る。学級は3領域あるので1行を占め、
        1領域しかない面は3つ並ぶ。実物の一覧と同じ収まりになる。
      */}
      <div className="grid grid-cols-3 gap-3 items-start">
        {overviewSections().map(({ owner, groups }) => {
          const badge = OWNER_BADGES[owner];
          const span = groups.length >= 3 ? 'col-span-3' : groups.length === 2 ? 'col-span-2' : '';

          return (
            <section key={owner} className={span}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold ${badge.className}`}
                >
                  {badge.short}
                </span>
                <h4 className="text-[13px] font-bold text-yoss-dark">{owner}</h4>
              </div>

              <div
                className={`border border-gray-200 rounded-xl p-2.5 bg-gray-50/40 grid gap-2.5 ${
                  groups.length >= 3 ? 'grid-cols-3' : groups.length === 2 ? 'grid-cols-2' : ''
                }`}
              >
                {groups.map(({ domain, items }) => (
                  <div key={domain} className="min-w-0">
                    <h5 className="inline-flex items-center gap-1.5 text-[12px] font-bold text-yoss-dark border border-gray-200 border-b-0 rounded-t-lg bg-white px-3 py-1">
                      {DOMAIN_GROUP_LABELS[domain]}
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-100 rounded-full px-1.5">
                        {student.scores[domain]}点
                      </span>
                    </h5>

                    <div className="border border-gray-200 rounded-b-lg rounded-tr-lg bg-white px-2.5 py-1.5">
                      {items.map(item => {
                        const value = current[item.id];

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 py-0.5 text-[12px]"
                          >
                            <span className="shrink-0 w-5 text-gray-400 text-right">
                              {itemNumber(item.id)}
                            </span>
                            <span
                              className={`min-w-0 flex-1 truncate ${
                                value ? 'text-yoss-dark font-medium' : 'text-gray-600'
                              }`}
                              title={item.criteria || item.label}
                            >
                              {item.label}
                              {item.starred && <span className="text-yoss-yellow-dark">★</span>}
                            </span>
                            <ScreeningScoreBoxes value={value} previous={previous[item.id]} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
