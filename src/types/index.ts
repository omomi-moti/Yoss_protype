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
  enabled: boolean;
}

// 学校からのレビュー
export interface SchoolReview {
  schoolName: string;
  supportUsed: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  problemTags: ProblemTag[];
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

// ダッシュボード統計
export interface DashboardStats {
  totalStudentsSupported: number;
  totalRecords: number;
  continuationRate: number;
  improvementRate: number;
  byProblem: { tag: ProblemTag; count: number }[];
  bySupport: { name: string; organizationName: string; count: number; continuationRate: number; improvementRate: number }[];
  monthlyTrend: { month: string; count: number }[];
}

// 校内チーム会議で表示する支援候補
export interface SupportSuggestion {
  supportId: string;
  supportName: string;
  category: SupportCategory;
  organizationName: string;
  organizationType: OrganizationType;
  contact: OrganizationContact;
  cityWideCount: number;
  schoolCount: number;
  continuationRate: number | null;
  isNew: boolean;
  details: string;
}
