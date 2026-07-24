import type { SupportResource, SupportRecord, DashboardStats, SupportSuggestion } from '../types';

// 軸①：自治体が登録する対応可能な支援
export const defaultResources: SupportResource[] = [
  // 経済面
  { id: 'r1', name: '就学援助', category: '経済面', description: '学用品費・給食費等の援助', targetGrades: '小1〜中3', cost: '無料', capacity: '所得基準あり', contact: '教育委員会 学事課', enabled: true },
  { id: 'r2', name: '医療費助成', category: '経済面', description: '18歳以下の医療費自己負担分を助成', targetGrades: '全学年', cost: '無料', capacity: '制限なし', contact: '市民課 子育て支援係', enabled: true },
  { id: 'r3', name: '給付型奨学金', category: '経済面', description: '返済不要の奨学金', targetGrades: '中3', cost: '無料', capacity: '年間20名', contact: '教育委員会', enabled: false },

  // 居場所
  { id: 'r4', name: '子ども食堂', category: '居場所', description: '無料または低額の食事提供と居場所', targetGrades: '全学年', cost: '無料〜100円', capacity: '各30名程度', contact: '社会福祉協議会', enabled: true },
  { id: 'r5', name: '放課後子ども教室', category: '居場所', description: '放課後の安全な居場所と体験活動', targetGrades: '小1〜小6', cost: '無料', capacity: '各校40名', contact: '生涯学習課', enabled: true },
  { id: 'r6', name: 'フリースクール連携', category: '居場所', description: '不登校児童生徒の学びの場', targetGrades: '小1〜中3', cost: '月額5,000円〜', capacity: '15名', contact: 'こども家庭センター', enabled: false },

  // 学習
  { id: 'r7', name: '学習支援教室', category: '学習', description: '大学生ボランティアによる学習支援', targetGrades: '小4〜中3', cost: '無料', capacity: '各回15名', contact: '社会福祉協議会', enabled: true },
  { id: 'r8', name: '日本語指導教室', category: '学習', description: '外国にルーツのある児童生徒向け', targetGrades: '全学年', cost: '無料', capacity: '10名', contact: '教育委員会 指導課', enabled: true },

  // 家庭支援
  { id: 'r9', name: '保護者相談窓口', category: '家庭支援', description: '子育ての悩み全般に対応', targetGrades: '-', cost: '無料', capacity: '予約制', contact: 'こども家庭センター', enabled: true },
  { id: 'r10', name: '家庭訪問支援', category: '家庭支援', description: '養育支援訪問事業', targetGrades: '-', cost: '無料', capacity: '月10件程度', contact: 'こども家庭センター', enabled: true },
  { id: 'r11', name: '保護者プログラム', category: '家庭支援', description: 'ペアレントトレーニング（全6回）', targetGrades: '-', cost: '無料', capacity: '各回10名', contact: 'こども家庭センター', enabled: false },

  // 健康・発達
  { id: 'r12', name: '発達相談', category: '健康・発達', description: '発達に関する専門相談', targetGrades: '全学年', cost: '無料', capacity: '月12件', contact: '保健センター', enabled: true },
  { id: 'r13', name: 'スクールカウンセラー連携', category: '健康・発達', description: 'SC との連携による心理支援', targetGrades: '全学年', cost: '無料', capacity: '各校週1回', contact: '教育委員会', enabled: true },
];

// 軸②：支援実績のダミーデータ（自動集計される想定）
export const mockRecords: SupportRecord[] = [
  // 子ども食堂
  ...Array.from({ length: 78 }, (_, i) => ({
    id: `rec-food-${i}`,
    resourceId: 'r4',
    resourceName: '子ども食堂',
    category: '居場所' as const,
    problemTags: i % 3 === 0
      ? ['経済的困窮' as const, '孤立・居場所なし' as const]
      : i % 3 === 1
      ? ['孤立・居場所なし' as const]
      : ['経済的困窮' as const],
    schoolName: ['○○小学校', '△△小学校', '□□中学校', '◇◇小学校', '☆☆中学校'][i % 5],
    date: `2026-${String(4 + Math.floor(i / 20)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 10 < 7 ? '継続中' as const : i % 10 < 9 ? '終了' as const : '中断' as const,
    improved: i % 10 < 6,
  })),
  // 就学援助
  ...Array.from({ length: 34 }, (_, i) => ({
    id: `rec-aid-${i}`,
    resourceId: 'r1',
    resourceName: '就学援助',
    category: '経済面' as const,
    problemTags: ['経済的困窮' as const],
    schoolName: ['○○小学校', '△△小学校', '□□中学校', '◇◇小学校', '☆☆中学校'][i % 5],
    date: `2026-${String(4 + Math.floor(i / 10)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: '継続中' as const,
    improved: i % 5 < 3,
  })),
  // 学習支援教室
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `rec-study-${i}`,
    resourceId: 'r7',
    resourceName: '学習支援教室',
    category: '学習' as const,
    problemTags: i % 2 === 0
      ? ['学習の遅れ' as const, '経済的困窮' as const]
      : ['学習の遅れ' as const],
    schoolName: ['○○小学校', '△△小学校', '□□中学校', '◇◇小学校', '☆☆中学校'][i % 5],
    date: `2026-${String(5 + Math.floor(i / 8)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 8 < 5 ? '継続中' as const : '終了' as const,
    improved: i % 8 < 4,
  })),
  // 保護者相談
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `rec-parent-${i}`,
    resourceId: 'r9',
    resourceName: '保護者相談窓口',
    category: '家庭支援' as const,
    problemTags: i % 3 === 0
      ? ['保護者支援が必要' as const, '家庭でのケア負担' as const]
      : ['保護者支援が必要' as const],
    schoolName: ['○○小学校', '△△小学校', '□□中学校'][i % 3],
    date: `2026-${String(4 + Math.floor(i / 6)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 6 < 4 ? '継続中' as const : '終了' as const,
    improved: i % 6 < 3,
  })),
  // 放課後子ども教室
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `rec-after-${i}`,
    resourceId: 'r5',
    resourceName: '放課後子ども教室',
    category: '居場所' as const,
    problemTags: ['孤立・居場所なし' as const],
    schoolName: ['○○小学校', '△△小学校', '◇◇小学校'][i % 3],
    date: `2026-${String(4 + Math.floor(i / 7)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 5 < 4 ? '継続中' as const : '終了' as const,
    improved: i % 5 < 3,
  })),
  // 発達相談
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `rec-dev-${i}`,
    resourceId: 'r12',
    resourceName: '発達相談',
    category: '健康・発達' as const,
    problemTags: ['発達特性' as const],
    schoolName: ['○○小学校', '□□中学校', '☆☆中学校'][i % 3],
    date: `2026-${String(5 + Math.floor(i / 4)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 4 < 3 ? '継続中' as const : '終了' as const,
    improved: i % 4 < 2,
  })),
  // 家庭訪問支援
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `rec-visit-${i}`,
    resourceId: 'r10',
    resourceName: '家庭訪問支援',
    category: '家庭支援' as const,
    problemTags: ['家庭でのケア負担' as const, '不登校傾向' as const],
    schoolName: ['○○小学校', '□□中学校'][i % 2],
    date: `2026-${String(5 + Math.floor(i / 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 4 < 3 ? '継続中' as const : '中断' as const,
    improved: i % 4 < 2,
  })),
];

// ダッシュボード用集計関数
export function computeStats(records: SupportRecord[]): DashboardStats {
  const uniqueStudents = new Set(records.map(r => r.id)).size;
  const continuingCount = records.filter(r => r.continuationStatus === '継続中').length;
  const improvedCount = records.filter(r => r.improved).length;

  // 問題タグ別集計
  const problemMap = new Map<string, number>();
  records.forEach(r => {
    r.problemTags.forEach(tag => {
      problemMap.set(tag, (problemMap.get(tag) || 0) + 1);
    });
  });
  const byProblem = Array.from(problemMap.entries())
    .map(([tag, count]) => ({ tag: tag as any, count }))
    .sort((a, b) => b.count - a.count);

  // リソース別集計
  const resourceMap = new Map<string, SupportRecord[]>();
  records.forEach(r => {
    const list = resourceMap.get(r.resourceName) || [];
    list.push(r);
    resourceMap.set(r.resourceName, list);
  });
  const byResource = Array.from(resourceMap.entries())
    .map(([name, recs]) => ({
      name,
      count: recs.length,
      continuationRate: Math.round((recs.filter(r => r.continuationStatus === '継続中').length / recs.length) * 100),
      improvementRate: Math.round((recs.filter(r => r.improved).length / recs.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // 月別トレンド
  const monthMap = new Map<string, number>();
  records.forEach(r => {
    const month = r.date.substring(0, 7);
    monthMap.set(month, (monthMap.get(month) || 0) + 1);
  });
  const monthlyTrend = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month: month.replace('2026-', '') + '月', count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalStudentsSupported: uniqueStudents,
    totalRecords: records.length,
    continuationRate: Math.round((continuingCount / records.length) * 100),
    improvementRate: Math.round((improvedCount / records.length) * 100),
    byProblem,
    byResource,
    monthlyTrend,
  };
}

// 画面D用：特定の問題タグに対する支援候補を生成
export function getSuggestions(
  problemTags: string[],
  resources: SupportResource[],
  records: SupportRecord[],
  schoolName: string
): SupportSuggestion[] {
  // 問題タグに関連するリソースを探す
  const tagToCategory: Record<string, string[]> = {
    '経済的困窮': ['経済面', '居場所', '学習'],
    '家庭でのケア負担': ['家庭支援'],
    '保護者支援が必要': ['家庭支援'],
    '学習の遅れ': ['学習'],
    '孤立・居場所なし': ['居場所'],
    '発達特性': ['健康・発達'],
    '不登校傾向': ['居場所', '家庭支援', '健康・発達'],
    '健康面の課題': ['健康・発達'],
  };

  const relevantCategories = new Set<string>();
  problemTags.forEach(tag => {
    (tagToCategory[tag] || []).forEach(cat => relevantCategories.add(cat));
  });

  return resources
    .filter(r => r.enabled && relevantCategories.has(r.category))
    .map(r => {
      const relatedRecords = records.filter(rec => rec.resourceId === r.id);
      const schoolRecords = relatedRecords.filter(rec => rec.schoolName === schoolName);
      const continuing = relatedRecords.filter(rec => rec.continuationStatus === '継続中');

      return {
        resourceName: r.name,
        category: r.category,
        cityWideCount: relatedRecords.length,
        schoolCount: schoolRecords.length,
        continuationRate: relatedRecords.length > 0
          ? Math.round((continuing.length / relatedRecords.length) * 100)
          : null,
        isNew: relatedRecords.length === 0,
        details: `${r.targetGrades} / ${r.cost} / ${r.capacity}`,
      };
    })
    .sort((a, b) => b.cityWideCount - a.cityWideCount);
}
