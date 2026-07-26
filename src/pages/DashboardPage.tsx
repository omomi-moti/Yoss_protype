import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import OrganizationCard from '../components/OrganizationCard';
import { useOrganizationStore } from '../hooks/useOrganizationStore';
import { SUPPORT_CATEGORIES, ORGANIZATION_TYPES } from '../data/organizations';
import type { OrganizationType, SupportCategory } from '../types';

export default function DashboardPage() {
  const { published: organizations } = useOrganizationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SupportCategory[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<OrganizationType[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>('org-1'); // 自分の団体を最初から開く
  const [showFilter, setShowFilter] = useState(false);

  const toggleCategory = (category: SupportCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleType = (type: OrganizationType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filterCount = selectedCategories.length + selectedTypes.length;

  // Filter organizations
  const filtered = organizations.filter(org => {
    if (searchQuery && !org.name.includes(searchQuery) && !org.description.includes(searchQuery) && !org.operator.includes(searchQuery)) {
      return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.some(c => org.categories.includes(c))) {
      return false;
    }
    if (selectedTypes.length > 0 && !selectedTypes.includes(org.type)) {
      return false;
    }
    return true;
  });

  // Sort: own organization first
  const sorted = [...filtered].sort((a, b) => {
    if (a.isMine && !b.isMine) return -1;
    if (!a.isMine && b.isMine) return 1;
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">支援団体</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-600">学校</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">共通画面</span>
        </div>
        <h1 className="text-xl font-bold text-yoss-dark">支援団体ディレクトリ</h1>
        <p className="text-sm text-gray-500 mt-1">
          地域の支援団体が対応可能な支援と、学校からの実際のレビューを確認できます
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="団体名・運営主体で検索..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
            />
          </div>
          {/* Filter button */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border transition-colors ${
              filterCount > 0
                ? 'bg-yoss-yellow-light border-yoss-yellow text-yoss-yellow-dark font-bold'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <Filter size={14} />
            絞り込み
            {filterCount > 0 && (
              <span className="bg-yoss-yellow text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            {/* 領域 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400">対応領域で絞り込み</span>
                {filterCount > 0 && (
                  <button
                    onClick={() => { setSelectedCategories([]); setSelectedTypes([]); }}
                    className="flex items-center gap-0.5 text-[10px] text-red-400 hover:text-red-500"
                  >
                    <X size={10} />
                    クリア
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUPPORT_CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`text-[10px] px-2.5 py-1 rounded-md border transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-yoss-yellow text-white border-yoss-yellow font-bold'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 種別 */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 block mb-2">団体の種別で絞り込み</span>
              <div className="flex flex-wrap gap-1.5">
                {ORGANIZATION_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`text-[10px] px-2.5 py-1 rounded-md border transition-colors ${
                      selectedTypes.includes(type)
                        ? 'bg-yoss-yellow text-white border-yoss-yellow font-bold'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">
          {sorted.length}件の団体
          {filterCount > 0 && ` — 「${[...selectedCategories, ...selectedTypes].join('」「')}」で絞り込み中`}
        </span>
      </div>

      {/* Organization cards */}
      <div className="space-y-4">
        {sorted.map(org => (
          <OrganizationCard
            key={org.id}
            org={org}
            isExpanded={expandedId === org.id}
            onToggle={() => setExpandedId(expandedId === org.id ? null : org.id)}
          />
        ))}
        {sorted.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">条件に一致する団体がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
