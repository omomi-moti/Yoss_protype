import { DIRECTIONS, DIRECTION_ITEMS, DIRECTION_STATES } from '../data/meeting';
import { parseCurrentSupport } from '../data/students';
import type { Student, SupportDirection } from '../types';

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
 * 本プロトタイプが指している問題がそのまま見える場所でもある。B の項目は
 * どれも「◯◯の活用」というカテゴリ名で、チェックを入れられても
 * 実際にどの団体に繋ぐのかはここには無い。だから B に印を付けても実務が動かない。
 *
 * 表示のみ。実物の入力そのものなので、本プロトタイプで触らせる必要がない。
 */
export default function ScreeningDirectionPanel({
  student,
  onGoToSupport,
}: {
  student: Student;
  /** タブ④（領域と支援候補）へ送る */
  onGoToSupport: () => void;
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
                {items.map(item => (
                  <div key={item.index} className="flex items-center gap-2 py-1.5">
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
                ))}
              </div>

              {/*
                B だけ、カテゴリ名の先に何も無いことを画面上で示す。
                プロトタイプの主張そのものなので、文章ではなくこの位置に置く。
              */}
              {direction.key === 'B' && (
                <div className="px-4 py-3 border-t border-yoss-yellow/40">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    どの項目も分類名だけで、繋ぎ先の団体名はここにありません。
                  </p>
                  <button
                    onClick={onGoToSupport}
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
