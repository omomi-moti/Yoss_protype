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

// 自治体が登録する支援リソース
export interface SupportResource {
  id: string;
  name: string;
  category: SupportCategory;
  description: string;
  targetGrades: string;
  cost: string;
  capacity: string;
  contact: string;
  enabled: boolean;
}

// 支援実績（ダミーデータ用）
export interface SupportRecord {
  id: string;
  resourceId: string;
  resourceName: string;
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
  byResource: { name: string; count: number; continuationRate: number; improvementRate: number }[];
  monthlyTrend: { month: string; count: number }[];
}

// 校内チーム会議で表示する支援候補
export interface SupportSuggestion {
  resourceName: string;
  category: SupportCategory;
  cityWideCount: number;
  schoolCount: number;
  continuationRate: number | null;
  isNew: boolean;
  details: string;
}
