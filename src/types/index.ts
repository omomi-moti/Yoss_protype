// 支援カテゴリ
export type SupportCategory = '経済面' | '居場所' | '学習' | '家庭支援' | '健康・発達' | '安全';

// 問題タグ（スクリーニング43項目から抽出した主要カテゴリ）
export type ProblemTag =
  | '経済的困窮'
  | '家庭でのケア負担'
  | '保護者支援が必要'
  | '学習の遅れ'
  | '孤立・居場所なし'
  | '発達特性'
  | '不登校傾向'
  | '健康面の課題';

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
