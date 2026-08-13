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

// スクリーニングを入力する校内の担当
export type StaffRole =
  | '担任'
  | '特別支援'
  | '養護'
  | '事務'
  | 'SC・SSW'
  | '管理職・生指';

/** スクリーニングの1項目。担当の自由記述・AI判定・日常の対応記録の元になる */
export interface ScreeningEntry {
  role: StaffRole;
  /** 項目名（タブ②の行） */
  item: string;
  /** 担当が入力した気になる情報（タブ①のカード本文） */
  note: string;
  /** 入力があった項目にだけ付く */
  judgement: '経過観察' | '要注意';
}

/** 日常の対応記録（タブ③・参照専用） */
export interface SupportRecord {
  date: string;
  role: StaffRole;
  text: string;
}

// 支援の方向性 A / B / C
export type SupportDirection = 'A' | 'B' | 'C';

/**
 * 実物のスクリーニング37項目のうちの1項目。
 * 8領域それぞれの下に並び、点数（1点／2点）を付けると領域スコアになる。
 */
export interface ScreeningItem {
  /** 実物の通し番号（1〜37）。画面にもそのまま出す */
  id: number;
  domain: SupportCategory;
  label: string;
  /** 1点・2点の基準。実物の説明文をそのまま出す */
  criteria: string;
  /** 実物で★が付いている項目 */
  starred?: boolean;
  /**
   * 点数を付けない項目（②欠席日数のように学年ごとの日数を入れるだけの行）。
   * 行は残す。項目が抜けているように見せないため。
   */
  scored?: false;
}

/** 児童のスクリーニング回答。項目ID → 点数。未回答の項目は持たない */
export type ScreeningAnswers = Record<number, 1 | 2>;

/** 前学期と比べた変化。実物の凡例（悪化・良化・変化なし・未選択）に合わせる */
export type ScreeningChange = '悪化' | '良化' | '変化なし' | '未選択';

/**
 * 「支援の現状」の1項目（A/B/C それぞれの下に8項目前後並ぶ）。
 * B の項目にカテゴリ名しか無いことが、本プロトタイプが指している問題そのもの。
 */
export interface DirectionItem {
  direction: SupportDirection;
  /** 方向性ごとの通し番号 */
  index: number;
  label: string;
}

/** 支援の現状で各項目に付く状態。実物の 新／続／拒 */
export type DirectionState = '新' | '続' | '拒';

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
  /**
   * この支援が効く領域。子ども食堂のように複数領域にまたがる支援があるため複数持つ。
   * 先頭は「主たる領域」で、登録画面（画面A）でどの領域の下に並ぶかを決める。
   */
  categories: SupportCategory[];
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
  /** この支援が対応する領域（登録されたすべて） */
  categories: SupportCategory[];
  /**
   * categories のうち、この児童のスコアが1以上だった領域。スコアの高い順。
   * 支援は合致した領域すべての候補に出る。
   */
  matchedDomains: SupportCategory[];
  /** matchedDomains のスコア合計。表示順の第1キー */
  matchedScore: number;
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  contact: OrganizationContact;
  /**
   * この支援へのレビューの集計。表示順の第2キー。
   * レビューは利用した学校しか書けないため、利用実績の代わりでもある（issue #22）。
   */
  review: ReviewSummary;
  /** 提供団体全体へのレビューの集計。支援単体の件数が少ないときの補足に使う */
  organizationReview: ReviewSummary;
  /** review.count のうち、ログイン中の学校が書いた件数。自校で使ったことがあるかを示す */
  schoolReviewCount: number;
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

/**
 * 会議で割り振ったアクション。
 *
 * 支援候補の「アクションとして登録」から作る。先生の入力欄を増やさないため、
 * 文面・担当・方向性はすべて登録元の支援から導出する（手入力の項目は持たない）。
 */
export interface MeetingAction {
  id: string;
  supportId: string;
  supportName: string;
  organizationName: string;
  /** アクションの文面 */
  title: string;
  direction: SupportDirection;
  /** 「たった今 登録」の表示に使う */
  registeredAt: string;
}

/** ひとりの児童について、この会議で決めたこと */
export interface MeetingDecision {
  directions: SupportDirection[];
  actions: MeetingAction[];
  memo: string;
  /** 最後に変更した時刻。未変更なら null */
  savedAt: string | null;
}

// 画面Dのタブ（実物の校内チーム会議の構成に合わせる）
// 'decision' は実物には無い5番目のタブ。「この会議で決めたこと」を右ドロワーと複製表示する
export type MeetingTab = 'situation' | 'support' | 'record' | 'screening' | 'decision';

// 画面Dの表示単位：ひとつの領域と、そこに対応できる支援候補
export interface DomainSuggestionGroup {
  domain: SupportCategory;
  /** この児童の domain 領域のスコア */
  score: number;
  suggestions: SupportSuggestion[];
}
