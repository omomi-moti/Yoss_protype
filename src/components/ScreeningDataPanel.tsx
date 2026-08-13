import { SUPPORT_CATEGORIES } from '../data/organizations';
import {
  DOMAIN_GROUP_LABELS,
  changeOf,
  itemsOfDomain,
  previousAnswers,
} from '../data/screening';
import { screeningOf } from '../data/students';
import type { ScreeningChange, Student } from '../types';

/** 変化ごとのチップの色。実物の凡例（悪化＝橙／良化＝青／変化なし＝灰） */
const CHANGE_STYLES: Record<ScreeningChange, string> = {
  悪化: 'bg-orange-500 text-white border-orange-500',
  良化: 'bg-blue-600 text-white border-blue-600',
  変化なし: 'bg-gray-500 text-white border-gray-500',
  未選択: 'bg-white text-gray-300 border-gray-200',
};

const LEGEND: ScreeningChange[] = ['悪化', '良化', '変化なし', '未選択'];

/**
 * スクリーニングの37項目（タブ②のサブタブ「データ」）。
 *
 * 実物と同じく、8領域それぞれの下に項目を並べ、2点・1点のどちらが付いたかを出す。
 * 色は前学期と比べた変化で、前学期の回答はデモ用のダミー（screening.ts 参照）。
 *
 * この37項目の合計が領域スコアであり、そのスコアがタブ④の支援候補を決めている。
 * 「なぜこの領域に点が付いたのか」をここまで遡って読めるようにするための面。
 */
export default function ScreeningDataPanel({ student }: { student: Student }) {
  const current = screeningOf(student);
  const previous = previousAnswers(current);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h3 className="text-sm font-bold text-yoss-dark">スクリーニング 37項目</h3>
        <p className="text-xs text-gray-500">
          この点数の合計が領域スコアになります ／ 色は前学期との比較
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

      {SUPPORT_CATEGORIES.map(domain => (
        <section key={domain}>
          <h4 className="inline-block text-[13px] font-bold text-yoss-dark border border-gray-200 border-b-0 rounded-t-lg px-4 py-1.5">
            {DOMAIN_GROUP_LABELS[domain]}
            <span className="ml-2 font-normal text-gray-400">{student.scores[domain]}点</span>
          </h4>

          <div className="border border-gray-200 rounded-b-lg rounded-tr-lg bg-gray-50/40 px-4 py-2">
            {itemsOfDomain(domain).map(item => {
              const value = current[item.id];
              const change = changeOf(value, previous[item.id]);

              return (
                <div key={item.id} className="flex items-start gap-3 py-1.5">
                  <span className="shrink-0 w-6 text-[13px] text-gray-400 text-right">{item.id}</span>
                  <span className="shrink-0 w-44 text-[13px] text-gray-700">
                    {item.label}
                    {item.starred && <span className="text-yoss-yellow-dark">★</span>}
                  </span>

                  {item.scored === false ? (
                    <span className="shrink-0 w-[3.25rem] text-[11px] text-gray-300">入力欄</span>
                  ) : (
                    <span className="shrink-0 flex gap-1">
                      {([2, 1] as const).map(point => (
                        <span
                          key={point}
                          className={`w-6 h-5 flex items-center justify-center rounded border text-[11px] font-bold ${
                            value === point ? CHANGE_STYLES[change] : 'bg-white text-gray-300 border-gray-200'
                          }`}
                        >
                          {point}
                        </span>
                      ))}
                    </span>
                  )}

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
