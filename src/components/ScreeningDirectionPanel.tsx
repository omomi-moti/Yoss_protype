import { DIRECTIONS, DIRECTION_ITEMS, DIRECTION_STATES } from '../data/meeting';
import { countSupportsForDomains } from '../data/organizations';
import { parseCurrentSupport } from '../data/students';
import type { Organization, Student, SupportCategory, SupportDirection } from '../types';

/** 方向性ごとの帯の色。実物の A=赤系 / B=青系 / C=緑系 に寄せる */
const PANEL_STYLES: Record<SupportDirection, string> = {
  A: 'bg-red-50/70 border-red-100',
  B: 'bg-yoss-yellow-light border-yoss-yellow/40',
  C: 'bg-green-50/70 border-green-100',
};

/**
 * 「支援の現状」（タブ②のサブタブ）。
 *
 * 実物と同じく、方向性 A/B/C の下に項目を並べ、新／続／拒 を記録する面。
 * 本プロトタイプが指している問題がそのまま見える場所でもある。B の項目の隣には、
 * その項目に対応する領域に地域の支援が何件登録されているかを出す。0件の項目は
 * 「登録された支援がありません」と明示する——B にチェックを入れられても、
 * 実際にどの団体に繋ぐのかはシステムのどこにも無い、という状態をそのまま見せる。
 * 件数を押すと、その項目に対応する領域を選んだ状態でタブ④が開く（件数だけ見せて
 * 「じゃあ具体的に何があるのか」に答えないままにしないため）。
 *
 * 表示のみ。実物の入力そのものなので、本プロトタイプで触らせる必要がない。
 */
export default function ScreeningDirectionPanel({
  student,
  organizations,
  onGoToSupport,
}: {
  student: Student;
  /** 公開中の団体。B項目の隣の件数はここから数える */
  organizations: Organization[];
  /** タブ④（領域と支援候補）へ送る。domain を渡すと、その領域を選んだ状態で開く */
  onGoToSupport: (domain?: SupportCategory) => void;
}) {
  // 今の方針に入っている方向性の先頭項目だけ「続」にする（デモ用の見せ方）
  const { directions } = parseCurrentSupport(student);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h3 className="text-sm font-bold text-yoss-dark">支援の現状</h3>
        <p className="text-xs text-gray-500">
          新＝今回から／続＝継続／拒＝本人・保護者が拒否 ／ スクリーニングの入力がそのまま出ています
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 items-start">
        {DIRECTIONS.map(direction => {
          const items = DIRECTION_ITEMS.filter(item => item.direction === direction.key);
          const isCurrent = directions.includes(direction.key);

          return (
            <div
              key={direction.key}
              className={`rounded-xl border ${PANEL_STYLES[direction.key]}`}
            >
              <h4 className="px-4 py-2.5 text-[13px] font-bold text-yoss-dark border-b border-black/5">
                {direction.label}
              </h4>

              <div className="px-4 py-2">
                {items.map(item => {
                  // B以外、および domains を持たない項目（単発の事業活用／その他）は集計しない
                  const count = item.domains ? countSupportsForDomains(organizations, item.domains) : null;

                  return (
                    <div key={item.index} className="py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-gray-700 min-w-0 flex-1">
                          {item.index}. {item.label}
                        </span>
                        <div className="shrink-0 flex gap-1">
                          {DIRECTION_STATES.map(state => (
                            <span
                              key={state}
                              className={`w-5 h-5 flex items-center justify-center rounded text-[10px] ${
                                // 今の方針に入っている方向性の先頭項目だけ「続」が付いている想定
                                isCurrent && item.index === 1 && state === '続'
                                  ? 'bg-yoss-yellow text-white font-bold'
                                  : 'bg-white/70 text-gray-300 border border-black/5'
                              }`}
                            >
                              {state}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 件数は項目名の下に添える。カテゴリ名の先に何があるか（無いか）をこの位置で示す */}
                      {count !== null && (
                        <button
                          // domains は複数持てるが、実際に登録されているのは先頭の領域に寄っている
                          // ことが多いので、ジャンプ先はひとまず先頭の領域にする
                          onClick={() => onGoToSupport(item.domains![0])}
                          className={`mt-0.5 text-[11px] hover:underline ${
                            count > 0 ? 'text-yoss-yellow-dark font-bold' : 'text-red-500'
                          }`}
                        >
                          {count > 0 ? `該当する登録済み支援 ${count}件` : '登録された支援がありません'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {direction.key === 'B' && (
                <div className="px-4 py-3 border-t border-yoss-yellow/40">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    件数は8領域のうち近いものから数えた目安です。分類名の隣に団体名が出るのは
                    ここだけで、実際の詳細はタブ④で確認します。
                  </p>
                  <button
                    // 特定の項目からではないので領域を渡さない。いちばん重い領域から開く
                    onClick={() => onGoToSupport()}
                    className="mt-1.5 text-xs font-bold text-yoss-yellow-dark hover:underline"
                  >
                    タブ④で具体的な支援候補を見る
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
