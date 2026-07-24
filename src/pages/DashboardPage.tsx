import { useState } from 'react';
import { Search, Star, MapPin, School, Tag, ChevronDown, ChevronUp, MessageSquare, Filter, X, Crown } from 'lucide-react';
import { municipalities, ALL_TAGS } from '../data/municipalities';
import type { Municipality } from '../data/municipalities';

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

function MunicipalityCard({ muni, isExpanded, onToggle }: {
  muni: Municipality;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const avgRating = muni.reviews.length > 0
    ? (muni.reviews.reduce((sum, r) => sum + r.rating, 0) / muni.reviews.length).toFixed(1)
    : null;

  return (
    <div className={`bg-white rounded-xl border-2 transition-all ${
      muni.isMine
        ? 'border-yoss-yellow shadow-md shadow-yoss-yellow/10'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${
              muni.isMine
                ? 'bg-yoss-yellow text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {muni.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-yoss-dark">{muni.name}</h3>
                {muni.isMine && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yoss-yellow-light text-yoss-yellow-dark">
                    <Crown size={10} />
                    自分の自治体
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                <span className="flex items-center gap-0.5">
                  <MapPin size={10} />
                  {muni.prefecture}
                </span>
                <span>{muni.population}</span>
                <span className="flex items-center gap-0.5">
                  <School size={10} />
                  {muni.schoolCount}校
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          {avgRating && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yoss-yellow text-yoss-yellow" />
                <span className="text-lg font-bold text-yoss-dark">{avgRating}</span>
              </div>
              <span className="text-[10px] text-gray-400">{muni.reviews.length}件のレビュー</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{muni.description}</p>

        {/* Support tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {muni.supportTags.map(tag => (
            <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        {/* Supports summary */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            対応可能な支援：<strong className="text-yoss-dark">{muni.supports.length}件</strong>
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
          {/* Support list */}
          <div className="p-5">
            <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
              <Tag size={12} />
              対応可能な支援一覧
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {muni.supports.map(s => (
                <div key={s.name} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yoss-yellow-light text-yoss-yellow-dark">
                      {s.category}
                    </span>
                    <span className="text-xs font-bold text-yoss-dark">{s.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {muni.reviews.length > 0 && (
            <div className="border-t border-gray-100 p-5">
              <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                <MessageSquare size={12} />
                学校からのレビュー
              </h4>
              <div className="space-y-3">
                {muni.reviews.map((review, idx) => (
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>('m1'); // 自分の自治体を最初から開く
  const [showTagFilter, setShowTagFilter] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Filter municipalities
  const filtered = municipalities.filter(muni => {
    if (searchQuery && !muni.name.includes(searchQuery) && !muni.description.includes(searchQuery)) {
      return false;
    }
    if (selectedTags.length > 0 && !selectedTags.some(tag => muni.supportTags.includes(tag))) {
      return false;
    }
    return true;
  });

  // Sort: own municipality first
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
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">自治体</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-600">学校</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">共通画面</span>
        </div>
        <h1 className="text-xl font-bold text-yoss-dark">自治体サポートディレクトリ</h1>
        <p className="text-sm text-gray-500 mt-1">
          各自治体が対応可能な支援と、学校からの実際のレビューを確認できます
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
              placeholder="自治体名で検索..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-yoss-yellow focus:ring-1 focus:ring-yoss-yellow/20"
            />
          </div>
          {/* Tag filter button */}
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border transition-colors ${
              selectedTags.length > 0
                ? 'bg-yoss-yellow-light border-yoss-yellow text-yoss-yellow-dark font-bold'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <Filter size={14} />
            タグで絞り込み
            {selectedTags.length > 0 && (
              <span className="bg-yoss-yellow text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {selectedTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Tag filter panel */}
        {showTagFilter && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400">支援タグで絞り込み</span>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="flex items-center gap-0.5 text-[10px] text-red-400 hover:text-red-500"
                >
                  <X size={10} />
                  クリア
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[10px] px-2.5 py-1 rounded-md border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-yoss-yellow text-white border-yoss-yellow font-bold'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">
          {sorted.length}件の自治体
          {selectedTags.length > 0 && ` — 「${selectedTags.join('」「')}」で絞り込み中`}
        </span>
      </div>

      {/* Municipality cards */}
      <div className="space-y-4">
        {sorted.map(muni => (
          <MunicipalityCard
            key={muni.id}
            muni={muni}
            isExpanded={expandedId === muni.id}
            onToggle={() => setExpandedId(expandedId === muni.id ? null : muni.id)}
          />
        ))}
        {sorted.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">条件に一致する自治体がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
