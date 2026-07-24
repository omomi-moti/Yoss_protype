import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Save, Info } from 'lucide-react';
import { defaultResources } from '../data/mockData';
import type { SupportResource } from '../types';

export default function RegisterPage() {
  const [resources, setResources] = useState<SupportResource[]>(defaultResources);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const categories = [...new Set(resources.map(r => r.category))];

  const toggle = (id: string) => {
    setResources(prev => prev.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">自治体向け</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yoss-yellow-light text-yoss-yellow-dark">軸①</span>
        </div>
        <h1 className="text-xl font-bold text-yoss-dark">対応可能な支援の登録</h1>
        <p className="text-sm text-gray-500 mt-1">
          御自治体で対応可能な支援を選択してください。ここで登録された情報が、管内の学校の校内チーム会議で支援候補として表示されます。
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <strong>年1回・約5分の入力です。</strong>
          チェックを入れた項目だけ、対象学年・費用・定員などの詳細を入力してください。
          登録内容は次回更新まで学校に表示されます。
        </div>
      </div>

      {/* Category sections */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryResources = resources.filter(r => r.category === category);
          const enabledCount = categoryResources.filter(r => r.enabled).length;

          return (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h2 className="font-bold text-sm text-yoss-dark">{category}</h2>
                <span className="text-[10px] text-gray-400">
                  {enabledCount} / {categoryResources.length} 件 対応可能
                </span>
              </div>

              {/* Resource list */}
              <div className="divide-y divide-gray-50">
                {categoryResources.map(resource => (
                  <div key={resource.id}>
                    {/* Toggle row */}
                    <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggle(resource.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          resource.enabled
                            ? 'bg-yoss-yellow border-yoss-yellow'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {resource.enabled && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>

                      {/* Name & description */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${resource.enabled ? 'text-yoss-dark' : 'text-gray-400'}`}>
                          {resource.name}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">{resource.description}</span>
                      </div>

                      {/* Expand button */}
                      {resource.enabled && (
                        <button
                          onClick={() => setExpandedId(expandedId === resource.id ? null : resource.id)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          {expandedId === resource.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </div>

                    {/* Expanded details */}
                    {expandedId === resource.id && resource.enabled && (
                      <div className="px-5 pb-4 pt-1 ml-8">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: '対象学年', value: resource.targetGrades },
                            { label: '費用', value: resource.cost },
                            { label: '定員・受入枠', value: resource.capacity },
                            { label: '窓口・連絡先', value: resource.contact },
                          ].map(field => (
                            <div key={field.label}>
                              <label className="text-[10px] text-gray-400 font-bold">{field.label}</label>
                              <input
                                type="text"
                                defaultValue={field.value}
                                className="w-full mt-0.5 px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent pt-4 pb-2 mt-6">
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-yoss-green text-white'
              : 'bg-yoss-yellow text-white hover:bg-yoss-yellow-dark shadow-lg shadow-yoss-yellow/20'
          }`}
        >
          {saved ? (
            <>
              <Check size={18} />
              登録しました
            </>
          ) : (
            <>
              <Save size={18} />
              対応可能な支援を登録する
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          登録された内容は、管内 {5} 校の校内チーム会議画面に反映されます
        </p>
      </div>
    </div>
  );
}
