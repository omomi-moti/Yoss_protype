import { DIRECTIONS } from '../data/meeting';
import MeetingStudentSummary from './MeetingStudentSummary';
import type { MeetingDecision, Student } from '../types';

/**
 * タブ⑤「今回の対応記録」。
 *
 * この会議で登録した最終の内容を読むための面。記録をつけるのは右ドロワー
 * （この会議の記録をつける）なので、ここには入力を置かず表示だけにする。
 * タブ③に置いていた「アクション記録」はここに移した。今回決めたことと
 * 前回までの対応記録は別のものなので、同じ面に並べると混同するため。
 */
export default function MeetingDecisionTab({
  student,
  decision,
  onOpenRecorder,
}: {
  student: Student;
  decision: MeetingDecision;
  /** 記録をつけるドロワーを開く */
  onOpenRecorder: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="flex flex-col gap-3">
        <MeetingStudentSummary student={student} />

        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="text-sm font-bold text-yoss-dark">この会議で決めたこと</h3>
          <p className="text-xs text-gray-500">
            {decision.savedAt ? `自動保存 ${decision.savedAt}` : 'まだ何も記録していません'}
          </p>
          <button
            onClick={onOpenRecorder}
            className="text-xs text-yoss-link hover:underline"
          >
            記録をつける
          </button>
        </div>

        <div className="border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-5">
          <section>
            <h4 className="text-xs text-gray-500 mb-2">支援の方向性</h4>
            <div className="flex gap-2 flex-wrap">
              {DIRECTIONS.map(direction => {
                const isChecked = decision.directions.includes(direction.key);

                return (
                  <span
                    key={direction.key}
                    className={`text-[13px] px-3 py-1.5 rounded-lg border ${
                      isChecked
                        ? 'bg-yoss-yellow-light border-yoss-yellow font-bold text-yoss-dark'
                        : 'bg-white border-gray-200 text-gray-300'
                    }`}
                  >
                    {direction.label}
                  </span>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="text-xs text-gray-500 mb-2">アクション記録（{decision.actions.length}件）</h4>
            {decision.actions.length === 0 ? (
              <p className="text-[13px] text-gray-400 border border-dashed border-gray-200 rounded-lg px-4 py-3 leading-relaxed">
                この会議ではまだアクションを決めていません。タブ④の支援候補から登録できます。
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {decision.actions.map(action => (
                  <div
                    key={action.id}
                    className="border border-yoss-yellow/40 bg-yoss-yellow-light/40 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-yoss-yellow-dark bg-yoss-yellow-light border border-yoss-yellow/40 px-2 py-1 rounded">
                        未完了
                      </span>
                      <span className="text-[11px] text-yoss-yellow-dark border border-yoss-yellow/40 px-2 py-1 rounded">
                        支援候補から登録
                      </span>
                      <span className="ml-auto text-[11px] text-gray-400">
                        {action.registeredAt} 登録
                      </span>
                    </div>
                    <p className="text-[13px] text-yoss-dark leading-relaxed mt-2">{action.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      方向性 {action.direction}
                      <span className="mx-1.5">·</span>
                      対象の支援：{action.supportName}（{action.organizationName}）
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h4 className="text-xs text-gray-500 mb-2">会議メモ</h4>
            {decision.memo ? (
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {decision.memo}
              </p>
            ) : (
              <p className="text-[13px] text-gray-400">記録なし</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
