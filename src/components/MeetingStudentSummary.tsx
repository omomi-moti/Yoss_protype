import { DIRECTIONS, DIRECTION_STYLES } from '../data/meeting';
import { parseCurrentSupport, scoreLevel, totalScore } from '../data/students';
import type { Student } from '../types';

// スコアの水準ごとの文字色（児童一覧のバッジ配色と揃える）
const SCORE_STYLES = {
  high: 'text-yoss-dark',
  middle: 'text-gray-600',
  low: 'text-gray-400',
} as const;

/**
 * 検討中の児童のサマリー。タブを切り替えても同じ位置に出る。
 *
 * 上部の児童バーは進行位置を示すためのものなので、名前・状況・合計スコアはここで読む。
 * ここに出す「現在の方針」は前学期までに決まっているもので、
 * この会議で決める方向性（右ドロワー）とは別のもの。
 *
 * 名前・状況・方針・スコアを1行の文章に詰め込むと塊が見分けにくいため、
 * 方針はA/B/Cのバッジ（決定パネルと同じ見た目）に、状況の「・」区切りは少し余白を
 * 持たせ、方針とスコアの間には縦線を入れて、情報のかたまりを目で区切れるようにする。
 */
export default function MeetingStudentSummary({ student }: { student: Student }) {
  const { directions, detail } = parseCurrentSupport(student);
  const notes = student.notes.split('・');

  return (
    <div className="shrink-0 flex items-center gap-6 rounded-xl border border-gray-200 bg-white px-5 py-3">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-yoss-dark leading-tight">
          {student.grade} {student.number}番
        </h2>
        {/* 右の「現在の方針」と同じ調子でラベルを添える。文だけだと何を指す情報か伝わらないため */}
        <p className="text-[11px] text-gray-500 mt-2">気になる様子</p>
        <p className="text-[13px] text-gray-600 mt-0.5">
          {notes.map((note, index) => (
            <span key={note}>
              {index > 0 && <span className="mx-1.5 text-gray-300">・</span>}
              {note}
            </span>
          ))}
        </p>
      </div>

      <div className="shrink-0 ml-auto flex items-center gap-5">
        <div className="text-right">
          {/* 補足（要対協で共有 など）は見出しに添える。バッジの下に浮かせると何の説明か伝わらないため */}
          <p className="text-[11px] text-gray-500 mb-1.5 whitespace-nowrap">
            現在の方針
            {detail && <span className="text-gray-400">（{detail}）</span>}
          </p>
          <div className="flex gap-1 justify-end">
            {DIRECTIONS.map(direction => (
              <span
                key={direction.key}
                title={direction.label}
                className={`w-6 h-6 flex items-center justify-center rounded border text-xs font-bold ${
                  directions.includes(direction.key)
                    ? DIRECTION_STYLES[direction.key].on
                    : DIRECTION_STYLES[direction.key].off
                }`}
              >
                {direction.key}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 text-right pl-5 border-l border-yoss-yellow/30">
          <div className={`text-xl font-bold leading-none ${SCORE_STYLES[scoreLevel(totalScore(student.scores))]}`}>
            {totalScore(student.scores)}pt
          </div>
          <div className="text-[11px] text-gray-500 mt-1 whitespace-nowrap">合計スコア</div>
        </div>
      </div>
    </div>
  );
}
