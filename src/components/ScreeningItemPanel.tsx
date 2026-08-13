import { DOMAIN_GROUP_LABELS, changeOf, itemGroupsOfOwner, previousAnswers } from '../data/screening';
import { absenceDays, screeningOf } from '../data/students';
import type { ScreeningChange, ScreeningOwner, Student } from '../types';

/** 変化ごとのチップの色。実物の凡例（悪化＝橙／良化＝青／変化なし＝灰） */
const CHANGE_STYLES: Record<ScreeningChange, string> = {
  悪化: 'bg-orange-500 text-white border-orange-500',
  良化: 'bg-blue-600 text-white border-blue-600',
  変化なし: 'bg-gray-500 text-white border-gray-500',
  未選択: 'bg-white text-gray-300 border-gray-200',
};

const LEGEND: ScreeningChange[] = ['悪化', '良化', '変化なし', '未選択'];

/**
 * スクリーニングの項目一覧（タブ②のサブタブの中身）。
 *
 * 実物は37項目をサブタブごとに分けて入力する（データ＝①〜④、学級＝⑤〜18、…）ので、
 * ここも受け持ちの項目だけを、領域の見出しごとに並べる。
 * 色は前学期と比べた変化で、前学期の回答はデモ用のダミー（screening.ts 参照）。
 *
 * この37項目の合計が領域スコアであり、そのスコアがタブ④の支援候補を決めている。
 * 「なぜこの領域に点が付いたのか」をここまで遡って読めるようにするための面。
 */
export default function ScreeningItemPanel({
  student,
  owner,
}: {
  student: Student;
  owner: ScreeningOwner;
}) {
  const current = screeningOf(student);
  const previous = previousAnswers(current);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3 flex-wrap">
        <p className="text-xs text-gray-500">
          {owner}が入力する項目です。付いた点数の合計が領域スコアになります ／ 色は前学期との比較
        </p>
        <div className="ml-auto flex gap-2 shrink-0">
          {LEGEND.map(change => (
            <span key={change} className="flex items-center gap-1 text-[11px] text-gray-500">
              <span className={`w-3.5 h-3.5 rounded-sm border ${CHANGE_STYLES[change]}`} />
              {change}
            </span>
          ))}
        </div>
      </div>

      {itemGroupsOfOwner(owner).map(({ domain, items }) => (
        <section key={domain}>
          <h4 className="inline-block text-[13px] font-bold text-yoss-dark border border-gray-200 border-b-0 rounded-t-lg px-4 py-1.5">
            {DOMAIN_GROUP_LABELS[domain]}
            <span className="ml-2 font-normal text-gray-400">{student.scores[domain]}点</span>
          </h4>

          <div className="border border-gray-200 rounded-b-lg rounded-tr-lg bg-gray-50/40 px-4 py-2">
            {items.map(item => {
              const value = current[item.id];
              const change = changeOf(value, previous[item.id]);

              // 点数ではなく学年ごとの日数を入れる項目（②欠席日数）
              if (item.scored === false) {
                return (
                  <div key={item.id} className="py-1.5">
                    <div className="flex items-baseline gap-2 text-[13px] text-gray-700">
                      <span className="shrink-0 w-5 text-gray-400 text-right">{item.id}</span>
                      {item.label}
                    </div>
                    <div className="grid grid-cols-4 gap-x-4 gap-y-1 pl-7 pt-1.5">
                      {absenceDays(student).map(({ grade, days }) => (
                        <div key={grade} className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500 w-14 text-right">{grade}</span>
                          <span
                            className={`flex-1 border rounded px-2 py-0.5 text-[11px] text-center ${
                              days === null
                                ? 'border-gray-200 bg-white text-gray-300'
                                : days >= 30
                                ? 'border-orange-200 bg-orange-50 text-orange-600 font-bold'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            {days === null ? '-' : days}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  // 点が付いた行だけ地を白くして、灰色の行から浮かせる
                  className={`flex items-start gap-3 px-1.5 py-1.5 rounded ${value ? 'bg-white' : ''}`}
                >
                  <span className="shrink-0 w-5 text-[13px] text-gray-400 text-right">{item.id}</span>
                  <span className={`shrink-0 w-44 text-[13px] ${value ? 'text-yoss-dark' : 'text-gray-600'}`}>
                    {item.label}
                    {item.starred && <span className="text-yoss-yellow-dark">★</span>}
                  </span>

                  <span className="shrink-0 flex gap-1">
                    {([2, 1] as const).map(point => (
                      <span
                        key={point}
                        className={`w-6 h-5 flex items-center justify-center rounded border text-[11px] font-bold ${
                          value === point
                            ? CHANGE_STYLES[change]
                            : 'bg-white text-gray-300 border-gray-200'
                        }`}
                      >
                        {point}
                      </span>
                    ))}
                  </span>

                  <span className="text-[11px] text-gray-400 leading-relaxed min-w-0">
                    {item.criteria}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
