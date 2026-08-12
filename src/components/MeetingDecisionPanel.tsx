import { Check, Plus, X } from 'lucide-react';
import { DIRECTIONS } from '../data/meeting';
import type { MeetingDecision, SupportDirection } from '../types';

/**
 * 「この会議で決めたこと」（右ドロワーの中身）。
 *
 * タブを切り替えても消えないよう、タブの外に置く。ここにある入力は
 * 実物の校内チーム会議にもある3つ（方向性のチェック・アクション・会議メモ）だけで、
 * 本プロトタイプで新しい入力欄は足していない。
 */
export default function MeetingDecisionPanel({
  decision,
  recommended,
  onToggleDirection,
  onRemoveAction,
  onChangeMemo,
  onAddFromSupport,
}: {
  decision: MeetingDecision;
  /** AI推奨として印を付ける方向性 */
  recommended: SupportDirection[];
  onToggleDirection: (direction: SupportDirection) => void;
  onRemoveAction: (actionId: string) => void;
  onChangeMemo: (memo: string) => void;
  /** タブ②へ送る。アクションは支援候補からしか作らない */
  onAddFromSupport: () => void;
}) {
  return (
    <div className="p-4 flex flex-col gap-5">
      <section>
        <h3 className="text-xs text-gray-500 mb-2">支援の方向性（タップで切替）</h3>
        <div className="flex flex-col gap-1.5">
          {DIRECTIONS.map(direction => {
            const isChecked = decision.directions.includes(direction.key);

            return (
              <button
                key={direction.key}
                onClick={() => onToggleDirection(direction.key)}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  isChecked
                    ? 'bg-yoss-yellow-light border-yoss-yellow'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <span
                  className={`shrink-0 w-[18px] h-[18px] rounded flex items-center justify-center ${
                    isChecked ? 'bg-yoss-yellow text-white' : 'border border-gray-300'
                  }`}
                >
                  {isChecked && <Check size={12} strokeWidth={3} />}
                </span>
                <span className={`text-[13px] ${isChecked ? 'font-bold text-yoss-dark' : 'text-gray-600'}`}>
                  {direction.label}
                </span>
                {recommended.includes(direction.key) && (
                  <span className="ml-auto shrink-0 text-[11px] font-bold text-yoss-yellow-dark bg-yoss-yellow-light border border-yoss-yellow/40 px-1.5 py-0.5 rounded">
                    AI推奨
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-xs text-gray-500 mb-2">アクション（{decision.actions.length}件）</h3>
        {decision.actions.length === 0 ? (
          <p className="text-[13px] text-gray-400 border border-dashed border-gray-200 rounded-lg px-3 py-3 leading-relaxed">
            まだアクションはありません。タブ②の支援候補から登録できます。
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {decision.actions.map(action => (
              <div key={action.id} className="border border-yoss-yellow/40 bg-yoss-yellow-light/50 rounded-lg px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <p className="text-[13px] text-yoss-dark leading-relaxed flex-1">{action.title}</p>
                  <button
                    onClick={() => onRemoveAction(action.id)}
                    aria-label={`${action.title}を取り消す`}
                    className="shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {action.organizationName}
                  <span className="mx-1.5">·</span>
                  方向性 {action.direction}
                  <span className="mx-1.5">·</span>
                  {action.registeredAt} 登録
                </p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onAddFromSupport}
          className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2.5 text-[13px] font-bold text-yoss-yellow-dark hover:border-yoss-yellow transition-colors"
        >
          <Plus size={14} />
          支援候補からアクションを追加
        </button>
      </section>

      <section>
        <h3 className="text-xs text-gray-500 mb-2">会議メモ</h3>
        <textarea
          value={decision.memo}
          onChange={event => onChangeMemo(event.target.value)}
          rows={4}
          placeholder="会議で出た話をそのまま書けます"
          className="w-full px-3 py-2.5 text-[13px] leading-relaxed border border-gray-200 rounded-lg bg-gray-50/60 focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
        />
      </section>
    </div>
  );
}
