import type { SupportSuggestion } from '../types';

type Conditions = Pick<
  SupportSuggestion,
  'targetGrades' | 'cost' | 'capacity' | 'frequency' | 'howToUse'
>;

/**
 * 支援の利用条件。
 *
 * ラベルの位置を固定した定義リストにすることで、カードをまたいでも同じ行に同じ項目が来て、
 * 「費用だけ見比べる」といった読み方が視線移動なしでできる。
 * カード（一覧）では対象・費用・定員まで、詳細では実施頻度と利用方法も出す。
 */
export default function SupportConditions({ support, full = false }: {
  support: Conditions;
  /** 実施頻度と利用方法まで表示する */
  full?: boolean;
}) {
  const items = [
    { label: '対象', value: support.targetGrades },
    { label: '費用', value: support.cost },
    { label: '定員', value: support.capacity },
    ...(full
      ? [
          { label: '実施頻度', value: support.frequency },
          { label: '利用方法', value: support.howToUse },
        ]
      : []),
  ];

  return (
    <dl className="bg-gray-50 rounded-lg px-3 py-2 space-y-0.5">
      {items.map(item => (
        <div key={item.label} className="flex gap-3 text-xs">
          <dt className={`text-gray-400 shrink-0 ${full ? 'w-16' : 'w-7'}`}>{item.label}</dt>
          {/* 登録画面で空のまま公開できる項目なので、未記入は「—」で埋める */}
          <dd className={item.value ? 'font-bold text-yoss-dark' : 'text-gray-300'}>
            {item.value || '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
}
