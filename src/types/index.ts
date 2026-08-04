// YOSS 8領域（共通言語）
export type SupportCategory =
  | '学校適応'
  | '学習'
  | '家庭状況'
  | '発達'
  | '健康'
  | '経済'
  | '福祉'
  | '地域情報';

// 問題タグ（スクリーニング43項目から抽出した主要カテゴリ）
export type ProblemTag =
  | '不登校傾向'
  | '欠席・遅刻'
  | '友人トラブル'
  | '学習の遅れ'
  | '宿題未提出'
  | '家庭でのケア負担'
  | '保護者支援が必要'
  | '連絡が取れない'
  | '発達特性'
  | '保健室頻回'
  | '経済的困窮'
  | '諸費滞納'
  | 'SC/SSW関与'
  | '要対協ケース'
  | '孤立・居場所なし'
  | '地域からの気になる情報';

// 8領域それぞれのスコア（該当なしは0）
export type DomainScores = Record<SupportCategory, number>;

// 校内チーム会議で検討する児童
export interface Student {
  id: string;
  grade: string;
  number: number;
  scores: DomainScores;
  /** 表示専用。支援候補の抽出には使わない */
  problems: ProblemTag[];
  notes: string;
  currentSupport: string;
}

// 支援団体の種別
export type OrganizationType =
  | 'NPO'
  | '社会福祉協議会'
  | '自治体事業'
  | 'ボランティア団体'
  | '民間企業'
  | 'その他';

// 団体の所在地域
export interface OrganizationArea {
  prefecture: string;
  city: string;
}

// 団体の連絡先
export interface OrganizationContact {
  tel?: string;
  email?: string;
  web?: string;
}

// 団体が提供する個別の支援メニュー
export interface OrganizationSupport {
  id: string;
  name: string;
  category: SupportCategory;
  description: string;
  targetGrades: string;
  cost: string;
  capacity: string;
  /** 実施頻度・曜日・時間帯 */
  frequency: string;
  /** 申込方法・必要な手続き */
  howToUse: string;
  enabled: boolean;
}

// 学校からのレビューの集計（星の平均と件数）
export interface ReviewSummary {
  /** 1〜5の平均。レビューが1件もなければ null */
  averageRating: number | null;
  count: number;
}

// 学校からのレビュー
export interface SchoolReview {
  schoolName: string;
  /** どの支援メニューへのレビューか。表示名は団体の supports から引く */
  supportId: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  problemTags: ProblemTag[];
}

// 検討中の児童との重なりを付けたレビュー（画面Dで関連の高い事例から見せるのに使う）
export interface RelevantReview {
  review: SchoolReview;
  /** 児童の課題タグと重なったタグ */
  matchedTags: ProblemTag[];
}

// 登録の単位＝地域の支援団体・組織
export interface Organization {
  id: string;
  name: string;
  operator: string;
  type: OrganizationType;
  area: OrganizationArea;
  description: string; // 200文字以内
  contact: OrganizationContact;
  categories: SupportCategory[];
  supports: OrganizationSupport[];
  reviews: SchoolReview[];
  isMine: boolean;
}

// 支援メニューに提供元団体の情報を付与したもの（横断検索用）
export interface SupportWithOrg extends OrganizationSupport {
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  contact: OrganizationContact;
}

// 支援実績（ダミーデータ用）
export interface SupportRecord {
  id: string;
  supportId: string;
  supportName: string;
  organizationId: string;
  organizationName: string;
  category: SupportCategory;
  problemTags: ProblemTag[];
  schoolName: string;
  date: string;
  continuationStatus: '継続中' | '終了' | '中断';
  improved: boolean;
}

// 校内チーム会議で表示する支援候補
export interface SupportSuggestion {
  supportId: string;
  supportName: string;
  /** 何をしてくれる支援なのか。カードの折りたたみ状態でも見せる */
  description: string;
  targetGrades: string;
  cost: string;
  capacity: string;
  frequency: string;
  howToUse: string;
  /** この支援が対応する領域。児童のスコアが1以上の領域だけが候補になる */
  category: SupportCategory;
  /** 児童の category 領域のスコア。表示順の第1キー */
  matchedScore: number;
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  contact: OrganizationContact;
  /** この支援へのレビューの集計。表示順の第2キー */
  review: ReviewSummary;
  /** 提供団体全体へのレビューの集計。支援単体の件数が少ないときの補足に使う */
  organizationReview: ReviewSummary;
  cityWideCount: number;
  schoolCount: number;
  continuationRate: number | null;
  isNew: boolean;
}

/**
 * 校内チーム会議を始めるときの検索条件（実物の「会議の準備・実施」に合わせた項目）。
 *
 * directions と studentName は実物に項目があるため持つが、絞り込みには使わない。
 * 理由は issue #30 を参照。
 */
export interface MeetingSearchCriteria {
  /** 学年（'3年' 形式）。空配列は未選択＝全件 */
  grades: string[];
  /** クラス（'1組' 形式）。空配列は未選択＝全件 */
  classes: string[];
  /** スクリーニング点数の下限・上限。空文字は未指定 */
  minScore: string;
  maxScore: string;
  /** 支援の方向性 A / B / C。表示のみ */
  directions: string[];
  /** 生徒名。表示のみ */
  studentName: string;
}

// 画面Dの表示単位：ひとつの領域と、そこに対応できる支援候補
export interface DomainSuggestionGroup {
  domain: SupportCategory;
  /** この児童の domain 領域のスコア */
  score: number;
  suggestions: SupportSuggestion[];
}
