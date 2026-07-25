import { useState } from 'react';
import { Search, Star, MapPin, Tag, ChevronDown, ChevronUp, MessageSquare, Filter, X, Crown, Phone, Mail, Globe } from 'lucide-react';
import { organizations, SUPPORT_CATEGORIES, ORGANIZATION_TYPES } from '../data/organizations';
import type { Organization, OrganizationType, SupportCategory } from '../types';

// 種別ごとのバッジ配色
const TYPE_STYLES: Record<OrganizationType, string> = {
  'NPO': 'bg-green-50 text-green-600',
  '社会福祉協議会': 'bg-blue-50 text-blue-600',
  '自治体事業': 'bg-purple-50 text-purple-600',
  'ボランティア団体': 'bg-orange-50 text-orange-600',
  '民間企業': 'bg-gray-100 text-gray-600',
  'その他': 'bg-gray-100 text-gray-500',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? 'fill-yoss-yellow text-yoss-yellow' : 'text-gray-200'}
        />
      ))}
    </div>
  );
}

function OrganizationCard({ org, isExpanded, onToggle }: {
  org: Organization;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const avgRating = org.reviews.length > 0
    ? (org.reviews.reduce((sum, r) => sum + r.rating, 0) / org.reviews.length).toFixed(1)
    : null;

  const enabledSupports = org.supports.filter(s => s.enabled);

  return (
    <div className={`bg-white rounded-xl border-2 transition-all ${
      org.isMine
        ? 'border-yoss-yellow shadow-md shadow-yoss-yellow/10'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
              org.isMine
                ? 'bg-yoss-yellow text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {org.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-yoss-dark">{org.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${TYPE_STYLES[org.type]}`}>
                  {org.type}
                </span>
                {org.isMine && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yoss-yellow-light text-yoss-yellow-dark">
                    <Crown size={10} />
                    自分の団体
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                <span className="flex items-center gap-0.5">
                  <MapPin size={10} />
                  {org.area.prefecture}{org.area.city}
                </span>
                <span>{org.operator}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          {avgRating && (
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Star size={14} className="fill-yoss-yellow text-yoss-yellow" />
                <span className="text-lg font-bold text-yoss-dark">{avgRating}</span>
              </div>
              <span className="text-[10px] text-gray-400">{org.reviews.length}件のレビュー</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{org.description}</p>

        {/* Category tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {org.categories.map(category => (
            <span key={category} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
              {category}
            </span>
          ))}
        </div>

        {/* Supports summary */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            対応可能な支援：<strong className="text-yoss-dark">{enabledSupports.length}件</strong>
          </span>
          <button
            onClick={onToggle}
            className="flex items-center gap-1 text-xs text-yoss-yellow-dark hover:text-yoss-yellow font-bold transition-colors"
          >
            {isExpanded ? '閉じる' : '詳細を見る'}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Contact */}
          <div className="px-5 py-3 bg-gray-50/50 flex flex-wrap gap-4 text-[10px] text-gray-500">
            {org.contact.tel && (
              <span className="flex items-center gap-1"><Phone size={11} />{org.contact.tel}</span>
            )}
            {org.contact.email && (
              <span className="flex items-center gap-1"><Mail size={11} />{org.contact.email}</span>
            )}
            {org.contact.web && (
              <span className="flex items-center gap-1"><Globe size={11} />{org.contact.web}</span>
            )}
          </div>

          {/* Support list */}
          <div className="p-5">
            <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
              <Tag size={12} />
              対応可能な支援一覧
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {enabledSupports.map(s => (
                <div key={s.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yoss-yellow-light text-yoss-yellow-dark">
                      {s.category}
                    </span>
                    <span className="text-xs font-bold text-yoss-dark">{s.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {s.targetGrades} / {s.cost} / {s.capacity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {org.reviews.length > 0 && (
            <div className="border-t border-gray-100 p-5">
              <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                <MessageSquare size={12} />
                学校からのレビュー
              </h4>
              <div className="space-y-3">
                {org.reviews.map((review, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-[10px] font-bold text-yoss-dark">{review.supportUsed}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{review.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      {review.comment}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{review.schoolName}</span>
                      <div className="flex gap-1">
                        {review.problemTags.map(tag => (
                          <span key={tag} className="text-[9px] bg-white text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
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
