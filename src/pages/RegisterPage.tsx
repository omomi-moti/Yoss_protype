import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, ExternalLink, Eye, Info, Plus, Trash2, AlertCircle, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ContributionSection from '../components/ContributionSection';
import PreviewModal from '../components/PreviewModal';
import { ORGANIZATION_TYPES, SUPPORT_CATEGORIES, deriveCategories } from '../data/organizations';
import { getPublishedMine, publishDraft, resetStore, saveDraft as persistDraft } from '../data/organizationStore';
import { useOrganizationStore } from '../hooks/useOrganizationStore';
import type { Organization, OrganizationContribution, OrganizationSupport, SupportCategory } from '../types';

/**
 * 登録する対象のタブ。
 *
 * 学校に出す支援（8領域）と、一般の人に出す募集（3種別）は受け手が違い、
 * 出ていく画面も別になる。同じ画面に縦に並べると、どちらが学校に見えるのかが
 * 読み取れなくなるため、タブで切り替える。
 */
type RegisterTab = 'supports' | 'contributions';

function formatSavedAt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const store = useOrganizationStore();

  const [profile, setProfile] = useState<Organization>(store.draft);
  // 編集中の支援は下書きに保持し、「保存」を押すまで profile には反映しない
  const [drafts, setDrafts] = useState<Record<string, OrganizationSupport>>({});
  // 一度も保存されていない新規追加分（キャンセルすると行ごと消える）
  const [unsavedIds, setUnsavedIds] = useState<Set<string>>(new Set());
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const [tab, setTab] = useState<RegisterTab>('supports');
  const [showPreview, setShowPreview] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const nextSupportId = useRef(0);

  // 未保存の支援を除いた、学校に出せる状態の団体情報
  const publishableProfile = useMemo<Organization>(() => {
    const supports = profile.supports.filter(s => !unsavedIds.has(s.id));
    return { ...profile, supports, categories: deriveCategories(supports) };
  }, [profile, unsavedIds]);

  // 下書きは入力のたびに自動保存する（5〜10分かかるフォームなので取りこぼさない）
  useEffect(() => {
    const timer = setTimeout(() => persistDraft(publishableProfile), 500);
    return () => clearTimeout(timer);
  }, [publishableProfile]);

  const publishedMine = getPublishedMine(store);
  const hasUnpublished = JSON.stringify(publishedMine) !== JSON.stringify(publishableProfile);
  const savedAtLabel = formatSavedAt(store.draftSavedAt);

  const handlePublish = () => {
    publishDraft();
    setShowPreview(false);
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 8000);
  };

  const handleReset = () => {
    resetStore();
    setProfile(getPublishedMine());
    setDrafts({});
    setUnsavedIds(new Set());
    setJustPublished(false);
  };

  // 学校に表示される対応領域は、保存済みの支援から導出される
  const savedSupports = profile.supports.filter(s => s.enabled && !unsavedIds.has(s.id));
  const activeCategories = [...new Set(savedSupports.flatMap(s => s.categories))];
  const enabledTotal = savedSupports.length;
  const enabledContributions = profile.contributions.filter(c => c.enabled).length;

  const tabs: { key: RegisterTab; label: string; count: number }[] = [
    { key: 'supports', label: '対応可能な支援（8領域）', count: enabledTotal },
    { key: 'contributions', label: '一般の方からの支援', count: enabledContributions },
  ];

  const updateContributions = (contributions: OrganizationContribution[]) => {
    setProfile(prev => ({ ...prev, contributions }));
  };

  const toggle = (id: string) => {
    setProfile(prev => ({
      ...prev,
      supports: prev.supports.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const updateField = <K extends keyof Organization>(key: K, value: Organization[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const startEdit = (support: OrganizationSupport) => {
    setDrafts(prev => ({ ...prev, [support.id]: { ...support } }));
    setJustSavedId(null);
  };

  const updateDraft = <K extends keyof OrganizationSupport>(
    id: string,
    key: K,
    value: OrganizationSupport[K]
  ) => {
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const discardDraft = (id: string) => {
    setDrafts(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const saveDraft = (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    setProfile(prev => ({
      ...prev,
      supports: prev.supports.map(s => (s.id === id ? draft : s)),
    }));
    setUnsavedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    discardDraft(id);
    setJustSavedId(id);
    setTimeout(() => setJustSavedId(current => (current === id ? null : current)), 2000);
  };

  const cancelEdit = (id: string) => {
    // 一度も保存していない新規追加は、キャンセルで行ごと取り消す
    if (unsavedIds.has(id)) {
      removeSupport(id);
      return;
    }
    discardDraft(id);
  };

  // 編集中の支援の対応領域を1つ増減する。主たる領域（先頭）を外すと別のセクションに移る
  const toggleDraftCategory = (id: string, category: SupportCategory) => {
    setDrafts(prev => {
      const draft = prev[id];
      if (!draft) return prev;

      const categories = draft.categories.includes(category)
        ? draft.categories.filter(c => c !== category)
        : [...draft.categories, category];

      return { ...prev, [id]: { ...draft, categories } };
    });
  };

  const addSupport = (category: SupportCategory) => {
    const id = `s-new-${nextSupportId.current++}`;
    const support: OrganizationSupport = {
      id, name: '', categories: [category], description: '', targetGrades: '', cost: '', capacity: '',
      frequency: '', howToUse: '', enabled: true,
    };
    setProfile(prev => ({ ...prev, supports: [...prev.supports, support] }));
    setDrafts(prev => ({ ...prev, [id]: { ...support } }));
    setUnsavedIds(prev => new Set(prev).add(id));
  };

  const removeSupport = (id: string) => {
    setProfile(prev => ({ ...prev, supports: prev.supports.filter(s => s.id !== id) }));
    setUnsavedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    discardDraft(id);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">支援団体向け</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yoss-yellow-light text-yoss-yellow-dark">軸①</span>
        </div>
        <h1 className="text-xl font-bold text-yoss-dark">支援団体の登録</h1>
        <p className="text-sm text-gray-500 mt-1">
          団体の基本情報と、対応可能な支援を登録してください。ここで登録された情報が、地域の学校の校内チーム会議で支援候補として表示されます。
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <strong>初回の登録は5〜10分、次回以降の更新は数分で完了します。</strong>
          入力内容は自動的に下書き保存されるので、途中で閉じても失われません。
          学校に表示されるのは、最後に「公開」した内容です。
        </div>
      </div>

      {/* 公開状態 */}
      <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg px-4 py-2.5 mb-6">
        <div className="flex items-center gap-2 min-w-0">
          {justPublished ? (
            <span className="flex items-center gap-1 text-xs font-bold text-yoss-green">
              <Check size={14} strokeWidth={3} />
              公開しました
            </span>
          ) : hasUnpublished ? (
            <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
              <AlertCircle size={14} />
              未公開の変更があります
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
              <Check size={14} strokeWidth={3} />
              最新の内容が公開されています
            </span>
          )}
          {savedAtLabel && (
            <span className="text-[10px] text-gray-400 truncate">下書き保存 {savedAtLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {justPublished && (
            <button
              onClick={() => navigate('/dashboard')}
              className="text-[10px] font-bold text-yoss-yellow-dark hover:text-yoss-yellow"
            >
              ディレクトリで確認する
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600"
            title="下書きと公開内容を初期データに戻します"
          >
            <RotateCcw size={11} />
            初期状態に戻す
          </button>
        </div>
      </div>

      {/* 団体プロフィール */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="font-bold text-sm text-yoss-dark">団体の基本情報</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 font-bold">団体名</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => updateField('name', e.target.value)}
                className="w-full mt-0.5 px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold">運営主体</label>
              <input
                type="text"
                value={profile.operator}
                onChange={e => updateField('operator', e.target.value)}
                className="w-full mt-0.5 px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold">種別</label>
              <select
                value={profile.type}
                onChange={e => updateField('type', e.target.value as Organization['type'])}
                className="w-full mt-0.5 px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
              >
                {ORGANIZATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold">所在地域</label>
              <div className="flex gap-2 mt-0.5">
                <input
                  type="text"
                  value={profile.area.prefecture}
                  onChange={e => updateField('area', { ...profile.area, prefecture: e.target.value })}
                  className="w-24 px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                />
                <input
                  type="text"
                  value={profile.area.city}
                  onChange={e => updateField('area', { ...profile.area, city: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                />
              </div>
            </div>
          </div>

          {/* 紹介文 */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 font-bold">紹介文</label>
              <span className={`text-[10px] ${profile.description.length > 200 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                {profile.description.length} / 200
              </span>
            </div>
            <textarea
              value={profile.description}
              onChange={e => updateField('description', e.target.value)}
              rows={4}
              className="w-full mt-0.5 px-3 py-2 text-xs leading-relaxed border border-gray-200 rounded-md resize-none focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              申込方法・所要期間・学校推薦の要否など、学校が問い合わせる前に知りたいことを書くと繋がりやすくなります。
            </p>
          </div>

          {/* 連絡先 */}
          <div>
            <label className="text-[10px] text-gray-400 font-bold">連絡先</label>
            <div className="grid grid-cols-3 gap-3 mt-0.5">
              {([
                { key: 'tel', label: '電話' },
                { key: 'email', label: 'メール' },
                { key: 'web', label: 'Web' },
              ] as const).map(field => (
                <input
                  key={field.key}
                  type="text"
                  value={profile.contact[field.key] ?? ''}
                  placeholder={field.label}
                  onChange={e => updateField('contact', { ...profile.contact, [field.key]: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 登録するものの切り替え。画面Dのタブバーと同じ見た目に合わせる */}
      <div className="flex items-end gap-1 border-b border-gray-200 mb-4">
        {tabs.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2.5 text-[13px] border-b-[3px] transition-colors ${
              item.key === tab
                ? 'border-gray-700 font-bold text-yoss-dark'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {item.label}
            <span className="ml-1.5 text-[10px] font-normal text-gray-400">{item.count}</span>
          </button>
        ))}
      </div>

      {tab === 'supports' && (
        <>
      {/* 学校に表示される対応領域（登録内容から導出） */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-bold text-sm text-yoss-dark mb-1">学校に表示される対応領域</h2>
        <p className="text-[10px] text-gray-400 mb-3">
          YOSSの8領域のうち、支援を登録した領域が対応領域として学校に表示されます。
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORT_CATEGORIES.map(category => {
            const isActive = activeCategories.includes(category);
            return (
              <span
                key={category}
                className={`text-[10px] px-2.5 py-1 rounded-md border ${
                  isActive
                    ? 'bg-yoss-yellow text-white border-yoss-yellow font-bold'
                    : 'bg-white text-gray-300 border-gray-200 border-dashed'
                }`}
              >
                {category}
              </span>
            );
          })}
        </div>
      </div>

      {/* 対応可能な支援（8領域すべてを表示） */}
      <div className="space-y-4">
        {SUPPORT_CATEGORIES.map(category => {
          // 複数領域に対応する支援は、主たる領域（categories の先頭）の下にだけ置く。
          // 対応するすべての領域に並べると同じ支援が画面に何度も出てしまうため。
          const categorySupports = profile.supports.filter(s => s.categories[0] === category);
          // 件数は「この領域に対応する支援」で数える（保存済みのみ）。主たる領域が別の支援も
          // 学校にはこの領域の候補として出るため、一覧に並ばないからといって未登録ではない
          const covering = profile.supports.filter(
            s => s.categories.includes(category) && !unsavedIds.has(s.id)
          );
          const savedCount = covering.length;
          const enabledCount = covering.filter(s => s.enabled).length;
          // この一覧には並ばないが、この領域に対応している支援
          const fromOtherSections = covering.filter(s => s.categories[0] !== category && s.enabled);

          return (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h2 className={`font-bold text-sm ${enabledCount > 0 ? 'text-yoss-dark' : 'text-gray-400'}`}>
                  {category}
                </h2>
                <span className="text-[10px] text-gray-400">
                  {savedCount === 0
                    ? '未登録'
                    : `${enabledCount} / ${savedCount} 件 対応可能`}
                </span>
              </div>

              {/* Support list */}
              <div className="divide-y divide-gray-50">
                {categorySupports.map(support => {
                  const draft = drafts[support.id];
                  const isEditing = draft !== undefined;
                  const isUnsaved = unsavedIds.has(support.id);

                  return (
                  <div key={support.id} className={isEditing ? 'bg-yoss-yellow-light/30' : undefined}>
                    {/* Toggle row */}
                    <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggle(support.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          support.enabled
                            ? 'bg-yoss-yellow border-yoss-yellow'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {support.enabled && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>

                      {/* Name & description — 保存済みの内容だけを表示する */}
                      <button
                        onClick={() => support.enabled && (isEditing ? cancelEdit(support.id) : startEdit(support))}
                        disabled={!support.enabled}
                        className="flex-1 min-w-0 flex items-center gap-2 text-left disabled:cursor-default"
                      >
                        <span className={`text-sm font-medium ${support.enabled ? 'text-yoss-dark' : 'text-gray-400'}`}>
                          {support.name || <span className="text-gray-400">新しい支援</span>}
                        </span>
                        {isUnsaved && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-500 shrink-0">
                            未保存
                          </span>
                        )}
                        {justSavedId === support.id && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-yoss-green shrink-0">
                            <Check size={9} strokeWidth={3} />
                            保存しました
                          </span>
                        )}
                        {/* 主たる領域はセクション見出しに出ているので、それ以外だけを添える */}
                        {support.categories.length > 1 && (
                          <span className="text-[9px] text-gray-400 shrink-0">
                            ＋{support.categories.slice(1).join('・')}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 truncate">{support.description}</span>
                      </button>

                      {/* Expand button */}
                      {support.enabled && (
                        <button
                          onClick={() => (isEditing ? cancelEdit(support.id) : startEdit(support))}
                          className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
                        >
                          {isEditing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </div>

                    {/* Edit form — 入力は下書きに保持し、保存を押すまで上の行には反映しない */}
                    {isEditing && support.enabled && (
                      <div className="px-5 pb-4 pt-1 ml-8">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-[10px] text-gray-400 font-bold">支援の名称</label>
                            <input
                              type="text"
                              value={draft.name}
                              placeholder="例）学習支援教室"
                              onChange={e => updateDraft(support.id, 'name', e.target.value)}
                              className="w-full mt-0.5 px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 font-bold">支援の内容</label>
                            <input
                              type="text"
                              value={draft.description}
                              placeholder="例）大学生ボランティアによる学習支援"
                              onChange={e => updateDraft(support.id, 'description', e.target.value)}
                              className="w-full mt-0.5 px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                            />
                          </div>
                        </div>
                        {/* 対応する領域（複数可）。校内チーム会議での候補の出方が決まる */}
                        <div className="mb-3">
                          <label className="text-[10px] text-gray-400 font-bold">対応する領域</label>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {SUPPORT_CATEGORIES.map(option => {
                              const isSelected = draft.categories.includes(option);
                              return (
                                <button
                                  key={option}
                                  onClick={() => toggleDraftCategory(support.id, option)}
                                  className={`text-[10px] px-2.5 py-1 rounded-md border transition-colors ${
                                    isSelected
                                      ? 'bg-yoss-yellow-light border-yoss-yellow text-yoss-yellow-dark font-bold'
                                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            複数選べます。選んだ領域それぞれの支援候補として、校内チーム会議に表示されます。
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {([
                            { key: 'targetGrades', label: '対象学年', placeholder: '例）小4〜中3' },
                            { key: 'cost', label: '費用', placeholder: '例）無料' },
                            { key: 'capacity', label: '定員・受入枠', placeholder: '例）各回15名' },
                            { key: 'frequency', label: '実施頻度', placeholder: '例）週1回（水 16:00〜18:00）' },
                            { key: 'howToUse', label: '利用方法', placeholder: '例）電話で空き枠を確認のうえ申込' },
                          ] as const).map(field => (
                            <div key={field.key} className={field.key === 'howToUse' ? 'col-span-2' : ''}>
                              <label className="text-[10px] text-gray-400 font-bold">{field.label}</label>
                              <input
                                type="text"
                                value={draft[field.key]}
                                placeholder={field.placeholder}
                                onChange={e => updateDraft(support.id, field.key, e.target.value)}
                                className="w-full mt-0.5 px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
                              />
                            </div>
                          ))}
                        </div>

                        {/* 項目ごとの保存 */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => saveDraft(support.id)}
                            disabled={draft.name.trim() === '' || draft.categories.length === 0}
                            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-md bg-yoss-yellow text-white hover:bg-yoss-yellow-dark transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <Check size={13} strokeWidth={3} />
                            {isUnsaved ? 'この支援を追加' : '変更を保存'}
                          </button>
                          <button
                            onClick={() => cancelEdit(support.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5"
                          >
                            キャンセル
                          </button>
                          {draft.name.trim() === '' ? (
                            <span className="text-[10px] text-gray-400">支援の名称を入力すると保存できます</span>
                          ) : draft.categories.length === 0 ? (
                            <span className="text-[10px] text-gray-400">対応する領域を1つ以上選ぶと保存できます</span>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <p className="text-[10px] text-gray-400">
                            連絡先は団体の基本情報で登録したものが表示されます
                          </p>
                          <button
                            onClick={() => removeSupport(support.id)}
                            className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={11} />
                            この支援を削除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}

                {/* 主たる領域が別のため、この一覧には並ばない支援 */}
                {fromOtherSections.length > 0 && (
                  <p className="px-5 py-2.5 text-[10px] text-gray-400 leading-relaxed">
                    {fromOtherSections.map(s => s.name).join('・')} も{category}に対応しています
                    （{fromOtherSections.map(s => s.categories[0]).join('・')}の欄で編集できます）
                  </p>
                )}

                {/* Add support */}
                <button
                  onClick={() => addSupport(category)}
                  className="w-full flex items-center gap-2 px-5 py-2.5 text-xs text-gray-400 hover:text-yoss-yellow-dark hover:bg-yoss-yellow-light/40 transition-colors"
                >
                  <Plus size={14} />
                  {category}の支援を追加
                </button>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}

      {tab === 'contributions' && (
        <>
          <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <Info size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="text-xs text-gray-500 leading-relaxed">
              ここで登録する募集は<strong className="text-yoss-dark">一般の方に向けた団体の公開ページ</strong>に出るもので、
              学校の校内チーム会議には表示されません。校内チーム会議に出す支援は「対応可能な支援（8領域）」タブで登録してください。
            </div>
          </div>
          {/* 画面Eの本文。紹介文（200文字）は一覧用の要約なので、長文はここに分けて持つ */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-sm text-yoss-dark">取り組みの説明</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  公開ページの本文になります。何をしている団体で、なぜ支援が必要なのかを書いてください。
                </p>
              </div>
              <Link
                to={`/orgs/${profile.id}`}
                target="_blank"
                className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-yoss-link hover:underline"
              >
                <ExternalLink size={11} />
                公開ページを見る
              </Link>
            </div>
            <div className="p-5">
              <textarea
                value={profile.story}
                rows={8}
                placeholder="例）市内3箇所で子ども食堂を開いています。平日の夕方、学校から直接来られる場所に……"
                onChange={e => updateField('story', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md bg-white leading-relaxed focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
              />
              <p className="text-[10px] text-gray-400 mt-1.5">
                改行はそのまま公開ページに反映されます。空のままなら紹介文が代わりに表示されます。
              </p>
            </div>
          </div>

          <ContributionSection contributions={profile.contributions} onChange={updateContributions} />
        </>
      )}

      {/* Publish */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent pt-4 pb-2 mt-6">
        <button
          onClick={() => setShowPreview(true)}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-yoss-yellow text-white hover:bg-yoss-yellow-dark shadow-lg shadow-yoss-yellow/20"
        >
          <Eye size={18} />
          学校からの見え方を確認する
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          {enabledTotal} 件の支援が、{profile.area.city} の学校の校内チーム会議画面に反映されます
          {enabledContributions > 0 && `／${enabledContributions} 件の募集を一般の方に公開します`}
        </p>
      </div>

      {showPreview && (
        <PreviewModal
          org={publishableProfile}
          hasChanges={hasUnpublished}
          onPublish={handlePublish}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
