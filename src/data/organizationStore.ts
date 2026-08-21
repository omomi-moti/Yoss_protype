import type { Organization, OrganizationSupport, SchoolReview, SupportCategory } from '../types';
import { deriveCategories, organizations } from './organizations';

/**
 * 団体データの永続化ストア。
 *
 * 自団体は「下書き（draft）」と「公開済み（published）」の2つの状態を持つ。
 * 登録画面は draft を編集し、公開すると published に反映される。
 * 学校が見る画面C・画面Dは published だけを読む。
 *
 * プロトタイプ段階なので保存先は localStorage。
 */

const DRAFT_KEY = 'yoss.organization.draft';
const PUBLISHED_KEY = 'yoss.organization.published';
const SAVED_AT_KEY = 'yoss.organization.draftSavedAt';

export interface StoreState {
  /** 学校に見えている団体一覧 */
  published: Organization[];
  /** 自団体の編集中の内容 */
  draft: Organization;
  /** 下書きの最終保存時刻（ISO文字列） */
  draftSavedAt: string | null;
}

const mockMine = organizations.find(o => o.isMine) ?? organizations[0];

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // localStorage が使えない環境ではモックのまま動かす
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存に失敗しても画面は動かし続ける
  }
}

function clear(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

/**
 * 旧形式のレビュー（支援名を supportUsed に自由記述で持っていた）を supportId に寄せる。
 * 「保護者相談窓口（LINE）」のように支援名に補足が付く書き方があったため、前方一致でも拾う。
 */
function migrateReview(review: SchoolReview, supports: OrganizationSupport[]): SchoolReview {
  if (review.supportId) return review;

  const legacyName = (review as SchoolReview & { supportUsed?: string }).supportUsed ?? '';
  const matched =
    supports.find(support => support.name === legacyName) ??
    supports.find(support => legacyName.startsWith(support.name));

  return { ...review, supportId: matched?.id ?? '' };
}

/**
 * 旧形式の支援（対応領域を category に1つだけ持っていた）を categories に寄せる。
 * 旧形式でも category は必須だったため、実際には空配列にはならない。
 */
function migrateCategories(support: OrganizationSupport): SupportCategory[] {
  if (support.categories) return support.categories;

  const legacy = (support as OrganizationSupport & { category?: SupportCategory }).category;
  return legacy ? [legacy] : [];
}

/**
 * 保存済みのデータに、あとから追加・変更した項目を合わせる。
 * localStorage には過去のバージョンの形のまま残っているため、欠けている項目を埋めないと
 * 入力欄が uncontrolled になったり、レビューが支援に紐づかなくなる。
 */
function migrate(org: Organization): Organization {
  const supports = org.supports.map(support => ({
    ...support,
    frequency: support.frequency ?? '',
    howToUse: support.howToUse ?? '',
    categories: migrateCategories(support),
  }));

  return {
    ...org,
    supports,
    // 支援の領域が変わるので、団体の対応領域も導出し直す
    categories: deriveCategories(supports),
    // 一般の人からの支援はあとから足した項目。持っていない保存済みデータがある
    contributions: org.contributions ?? [],
    reviews: org.reviews.map(review => migrateReview(review, supports)),
  };
}

function buildInitialState(): StoreState {
  const stored = read<Organization>(PUBLISHED_KEY);
  const storedDraft = read<Organization>(DRAFT_KEY);

  const storedPublished = stored ? migrate(stored) : null;
  const draft = storedDraft ? migrate(storedDraft) : null;

  const published = storedPublished
    ? organizations.map(o => (o.id === storedPublished.id ? storedPublished : o))
    : organizations;

  return {
    published,
    draft: draft ?? (storedPublished ?? mockMine),
    draftSavedAt: read<string>(SAVED_AT_KEY),
  };
}

let state: StoreState = buildInitialState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getSnapshot(): StoreState {
  return state;
}

/** 下書きを保存する（公開はしない） */
export function saveDraft(draft: Organization) {
  const normalized = { ...draft, categories: deriveCategories(draft.supports) };
  const savedAt = new Date().toISOString();

  state = { ...state, draft: normalized, draftSavedAt: savedAt };
  write(DRAFT_KEY, normalized);
  write(SAVED_AT_KEY, savedAt);
  emit();
}

/** 下書きの内容を学校に公開する */
export function publishDraft() {
  const published = state.published.map(o => (o.id === state.draft.id ? state.draft : o));

  state = { ...state, published };
  write(PUBLISHED_KEY, state.draft);
  emit();
}

/** モックデータの状態に戻す（デモ用） */
export function resetStore() {
  clear(DRAFT_KEY);
  clear(PUBLISHED_KEY);
  clear(SAVED_AT_KEY);
  state = buildInitialState();
  emit();
}

/** 自団体の公開済みの内容 */
export function getPublishedMine(current: StoreState = state): Organization {
  return current.published.find(o => o.id === current.draft.id) ?? current.draft;
}

/** 下書きに未公開の変更があるか */
export function hasUnpublishedChanges(current: StoreState = state): boolean {
  return JSON.stringify(getPublishedMine(current)) !== JSON.stringify(current.draft);
}
