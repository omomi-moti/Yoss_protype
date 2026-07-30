import { useState } from 'react';
import { X, Eye, Send, Check } from 'lucide-react';
import Modal from './Modal';
import OrganizationCard from './OrganizationCard';
import type { Organization } from '../types';

/**
 * 「学校からはこう見えます」プレビュー。
 * 画面Cと同じ OrganizationCard を使うことで、見え方のズレをなくす。
 */
export default function PreviewModal({ org, hasChanges, onPublish, onClose }: {
  org: Organization;
  hasChanges: boolean;
  onPublish: () => void;
  onClose: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Modal onClose={onClose} labelledBy="preview-title">
      <>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 bg-white rounded-t-2xl border-b border-gray-100">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-yoss-yellow-dark">
              <Eye size={12} />
              プレビュー
            </div>
            <h2 id="preview-title" className="text-base font-bold text-yoss-dark mt-0.5">学校からはこう見えます</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              支援団体ディレクトリ（画面C）と校内チーム会議で、この内容が学校に表示されます。
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
            aria-label="プレビューを閉じる"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card preview */}
        <div className="p-6">
          <OrganizationCard
            org={org}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white rounded-b-2xl border-t border-gray-100 flex items-center justify-between gap-4">
          {hasChanges ? (
            <p className="text-[10px] text-gray-500">
              公開すると、学校に表示されている内容がこの内容に更新されます。
            </p>
          ) : (
            <p className="flex items-center gap-1 text-[10px] text-yoss-green font-bold">
              <Check size={12} strokeWidth={3} />
              この内容はすでに公開されています
            </p>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2"
            >
              編集に戻る
            </button>
            <button
              onClick={onPublish}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg bg-yoss-yellow text-white hover:bg-yoss-yellow-dark transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              この内容で公開する
            </button>
          </div>
        </div>
      </>
    </Modal>
  );
}
