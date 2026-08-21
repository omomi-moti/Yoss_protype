import { Check, Send, Sparkles, X } from 'lucide-react';
import Modal from './Modal';
import PublicOrganizationView from './PublicOrganizationView';
import { useSupportStore } from '../hooks/useSupportStore';
import type { Organization } from '../types';

/**
 * 「一般の方からはこう見えます」プレビュー。
 *
 * 画面Eと同じ PublicOrganizationView を使う。プレビューが本物と違う見た目だと、
 * 確認したことにならないため。
 *
 * 出すのは下書き（まだ公開していない内容）。公開前に確認するためのものなので、
 * 画面Eが公開済みしか出さないのとは逆になる。支援ボタンは押せない。
 */
export default function PublicPreviewModal({ org, hasChanges, onPublish, onClose }: {
  org: Organization;
  hasChanges: boolean;
  onPublish: () => void;
  onClose: () => void;
}) {
  const tally = useSupportStore();
  const enabledCount = org.contributions.filter(c => c.enabled).length;

  return (
    <Modal onClose={onClose} labelledBy="public-preview-title" size="full">
      <>
        <div className="flex items-start justify-between gap-4 px-6 py-4 bg-white border-b border-gray-100">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-yoss-yellow-dark">
              <Sparkles size={12} />
              入力内容から自動生成
            </div>
            <h2 id="public-preview-title" className="text-base font-bold text-yoss-dark mt-0.5">
              一般の方からはこう見えます
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              基本情報・取り組みの説明・{enabledCount}件の募集から、このページを組み立てています。
              ページを別に作る必要はありません。
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

        {/* 本物と同じ幅で組みたいので、モーダルの中で縦にスクロールさせる */}
        <div className="max-h-[70vh] overflow-y-auto bg-[#FAFAFA]">
          <PublicOrganizationView org={org} tally={tally} />
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-4">
          {hasChanges ? (
            <p className="text-[10px] text-gray-500">
              公開すると、一般の方に見えているページがこの内容に更新されます。
            </p>
          ) : (
            <p className="flex items-center gap-1 text-[10px] text-yoss-green font-bold">
              <Check size={12} strokeWidth={3} />
              この内容はすでに公開されています
            </p>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2">
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
