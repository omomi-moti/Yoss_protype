import { Check, ChevronDown, ChevronUp, Coins, Package, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { CONTRIBUTION_TYPES } from '../data/organizations';
import type { ContributionType, OrganizationContribution } from '../types';

/**
 * 画面Aの「一般の方からの支援」タブ。寄付金・物品・ボランティアを登録する。
 *
 * 対応可能な支援（8領域）とは別のタブに置く。受け手が違うためで、
 * こちらは団体の公開ページに出るもの、8領域の支援は学校の校内チーム会議に出るもの。
 * データも Organization.contributions と Organization.supports で分かれている。
 *
 * 8領域の支援と違って「保存」ボタンを持たず、入力がそのまま反映される。
 * あちらは名称と領域が揃うまで学校に出せないため保存で区切っているが、
 * こちらは学校の画面に出ないので、揃うまで隠す理由がない。
 */

const TYPE_META: Record<
  ContributionType,
  { icon: typeof Coins; hint: string; addLabel: string; namePlaceholder: string }
> = {
  寄付金: {
    icon: Coins,
    hint: 'クラウドファンディング形式で募ります。決済はこのプロトタイプでは扱わず、金額の表示だけを行います。',
    addLabel: '寄付金の募集を追加',
    namePlaceholder: '例）子ども食堂 運営基金',
  },
  物品: {
    icon: Package,
    hint: '品目ごとに1件ずつ登録します。必要数は公開ページで「あと◯◯」として表示されます。',
    addLabel: '必要な物品を追加',
    namePlaceholder: '例）お米',
  },
  ボランティア: {
    icon: Users,
    hint: '募集内容と人数を登録します。活動の曜日・時間帯は募集内容に書いてください。',
    addLabel: 'ボランティア募集を追加',
    namePlaceholder: '例）調理・配膳スタッフ',
  },
};

const inputClass =
  'w-full mt-0.5 px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20';

/** 「50万円」ではなく「500,000円」で出す。入力欄の数字と突き合わせやすくするため */
function yen(value: number | undefined): string {
  return `${(value ?? 0).toLocaleString('ja-JP')}円`;
}

/** 達成率。目標額が未入力（0）のときは出さない */
function achievementRate(c: OrganizationContribution): number | null {
  if (!c.goalAmount) return null;
  return Math.round(((c.currentAmount ?? 0) / c.goalAmount) * 100);
}

/** 募集の要約。折りたたんだ行に出す */
function summaryOf(c: OrganizationContribution): string {
  if (c.type === '寄付金') {
    const rate = achievementRate(c);
    return `${yen(c.currentAmount)} / ${yen(c.goalAmount)}${rate === null ? '' : `（${rate}%）`}`;
  }
  const unit = c.type === 'ボランティア' ? '名' : c.unit || '';
  if (!c.neededCount) return '必要数が未入力';
  return `${(c.receivedCount ?? 0).toLocaleString('ja-JP')} / ${c.neededCount.toLocaleString('ja-JP')}${unit}`;
}

export default function ContributionSection({
  contributions,
  onChange,
}: {
  contributions: OrganizationContribution[];
  onChange: (contributions: OrganizationContribution[]) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<OrganizationContribution>) => {
    onChange(contributions.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const remove = (id: string) => {
    onChange(contributions.filter(c => c.id !== id));
    setExpandedId(current => (current === id ? null : current));
  };

  const add = (type: ContributionType) => {
    const id = `c-new-${Date.now()}`;
    onChange([...contributions, { id, type, name: '', description: '', enabled: true }]);
    setExpandedId(id);
  };

  /** 数値欄。空欄は 0 ではなく undefined にする（「未入力」と「0」を区別するため） */
  const numberField = (
    id: string,
    label: string,
    key: 'goalAmount' | 'currentAmount' | 'neededCount' | 'receivedCount',
    value: number | undefined
  ) => (
    <div>
      <label className="text-[10px] text-gray-400 font-bold">{label}</label>
      <input
        type="number"
        min={0}
        value={value ?? ''}
        onChange={e => {
          // 先頭の 0 を落とす。0 の入った欄に打ち足すと「07」になるが、React は
          // 数値入力で「新しい値と DOM の値が数値として等しい」場合に DOM を
          // 書き換えないため（07 == 7）、こちらで直接直さないと 0 が消えない
          const raw = e.target.value.replace(/^0+(?=\d)/, '');
          if (raw !== e.target.value) e.target.value = raw;
          update(id, { [key]: raw === '' ? undefined : Number(raw) });
        }}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {CONTRIBUTION_TYPES.map(type => {
        const meta = TYPE_META[type];
        const Icon = meta.icon;
        const items = contributions.filter(c => c.type === type);
        const enabledCount = items.filter(c => c.enabled).length;

        return (
          <div key={type} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Icon size={15} className={enabledCount > 0 ? 'text-yoss-yellow-dark' : 'text-gray-300'} />
                <h2 className={`font-bold text-sm ${enabledCount > 0 ? 'text-yoss-dark' : 'text-gray-400'}`}>
                  {type}
                </h2>
                <span className="text-[10px] text-gray-400">{enabledCount}件</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{meta.hint}</p>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map(item => {
                const isExpanded = expandedId === item.id;

                return (
                  <div key={item.id}>
                    <div className="flex items-center gap-3 px-5 py-3">
                      <button
                        onClick={() => update(item.id, { enabled: !item.enabled })}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          item.enabled
                            ? 'bg-yoss-yellow border-yoss-yellow'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        aria-label={item.enabled ? '募集中' : '募集を止める'}
                      >
                        {item.enabled && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="flex-1 min-w-0 flex items-center gap-2 text-left"
                      >
                        <span className={`text-sm font-medium ${item.enabled ? 'text-yoss-dark' : 'text-gray-400'}`}>
                          {item.name || <span className="text-gray-400">新しい募集</span>}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">{summaryOf(item)}</span>
                        <span className="text-xs text-gray-400 truncate">{item.description}</span>
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 ml-8">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-[10px] text-gray-400 font-bold">
                              {type === '物品' ? '品目' : '募集の名称'}
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              placeholder={meta.namePlaceholder}
                              onChange={e => update(item.id, { name: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 font-bold">
                              {type === 'ボランティア' ? '募集内容' : '説明'}
                            </label>
                            <input
                              type="text"
                              value={item.description}
                              placeholder="例）火曜・金曜の16:00〜19:30。調理経験は問いません"
                              onChange={e => update(item.id, { description: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {type === '寄付金' && (
                            <>
                              {numberField(item.id, '目標額（円）', 'goalAmount', item.goalAmount)}
                              {numberField(item.id, '現在額（円）', 'currentAmount', item.currentAmount)}
                            </>
                          )}
                          {type === '物品' && (
                            <>
                              {numberField(item.id, '必要数', 'neededCount', item.neededCount)}
                              {numberField(item.id, '集まった数', 'receivedCount', item.receivedCount)}
                              <div>
                                <label className="text-[10px] text-gray-400 font-bold">単位</label>
                                <input
                                  type="text"
                                  value={item.unit ?? ''}
                                  placeholder="例）kg・個・箱"
                                  onChange={e => update(item.id, { unit: e.target.value })}
                                  className={inputClass}
                                />
                              </div>
                            </>
                          )}
                          {type === 'ボランティア' && (
                            <>
                              {numberField(item.id, '募集人数（名）', 'neededCount', item.neededCount)}
                              {numberField(item.id, '応募済み（名）', 'receivedCount', item.receivedCount)}
                            </>
                          )}
                        </div>

                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => remove(item.id)}
                            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                            この募集を削除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => add(type)}
                className="w-full flex items-center gap-2 px-5 py-2.5 text-xs text-gray-400 hover:text-yoss-yellow-dark hover:bg-yoss-yellow-light/40 transition-colors"
              >
                <Plus size={14} />
                {meta.addLabel}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
