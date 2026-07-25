import type { SupportRecord, SupportWithOrg, DashboardStats, SupportSuggestion } from '../types';
import { getAllSupports } from './organizations';

const supportIndex = new Map(getAllSupports().map(s => [s.id, s]));

// 支援メニューの情報（団体名・領域）は organizations.ts から引くため、実績側では持たない
type RecordFields = Omit<
  SupportRecord,
  'id' | 'supportId' | 'supportName' | 'organizationId' | 'organizationName' | 'category'
>;

function buildRecords(
  supportId: string,
  idPrefix: string,
  count: number,
  fields: (i: number) => RecordFields
): SupportRecord[] {
  const support = supportIndex.get(supportId);
  if (!support) throw new Error(`未知の支援IDです: ${supportId}`);

  return Array.from({ length: count }, (_, i) => ({
    id: `${idPrefix}-${i}`,
    supportId: support.id,
    supportName: support.name,
    organizationId: support.organizationId,
    organizationName: support.organizationName,
    category: support.category,
    ...fields(i),
  }));
}

const SCHOOLS = ['○○小学校', '△△小学校', '□□中学校', '◇◇小学校', '☆☆中学校'];

// 軸②：支援実績のダミーデータ（自動集計される想定）
export const mockRecords: SupportRecord[] = [
  // 子ども食堂
  ...buildRecords('r4', 'rec-food', 78, i => ({
    problemTags: i % 3 === 0
      ? ['経済的困窮', '孤立・居場所なし']
      : i % 3 === 1
      ? ['孤立・居場所なし']
      : ['経済的困窮'],
    schoolName: SCHOOLS[i % 5],
    date: `2026-${String(4 + Math.floor(i / 20)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 10 < 7 ? '継続中' : i % 10 < 9 ? '終了' : '中断',
    improved: i % 10 < 6,
  })),
  // 就学援助
  ...buildRecords('r1', 'rec-aid', 34, i => ({
    problemTags: ['経済的困窮'],
    schoolName: SCHOOLS[i % 5],
    date: `2026-${String(4 + Math.floor(i / 10)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: '継続中',
    improved: i % 5 < 3,
  })),
  // 学習支援教室
  ...buildRecords('r7', 'rec-study', 25, i => ({
    problemTags: i % 2 === 0
      ? ['学習の遅れ', '経済的困窮']
      : ['学習の遅れ'],
    schoolName: SCHOOLS[i % 5],
    date: `2026-${String(5 + Math.floor(i / 8)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 8 < 5 ? '継続中' : '終了',
    improved: i % 8 < 4,
  })),
  // 保護者相談窓口
  ...buildRecords('r9', 'rec-parent', 18, i => ({
    problemTags: i % 3 === 0
      ? ['保護者支援が必要', '家庭でのケア負担']
      : ['保護者支援が必要'],
    schoolName: SCHOOLS[i % 3],
    date: `2026-${String(4 + Math.floor(i / 6)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 6 < 4 ? '継続中' : '終了',
    improved: i % 6 < 3,
  })),
  // 放課後子ども教室
  ...buildRecords('r5', 'rec-after', 20, i => ({
    problemTags: ['孤立・居場所なし'],
    schoolName: [SCHOOLS[0], SCHOOLS[1], SCHOOLS[3]][i % 3],
    date: `2026-${String(4 + Math.floor(i / 7)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 5 < 4 ? '継続中' : '終了',
    improved: i % 5 < 3,
  })),
  // 発達相談
  ...buildRecords('r12', 'rec-dev', 12, i => ({
    problemTags: ['発達特性'],
    schoolName: [SCHOOLS[0], SCHOOLS[2], SCHOOLS[4]][i % 3],
    date: `2026-${String(5 + Math.floor(i / 4)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 4 < 3 ? '継続中' : '終了',
    improved: i % 4 < 2,
  })),
  // 家庭訪問支援
  ...buildRecords('r10', 'rec-visit', 8, i => ({
    problemTags: ['家庭でのケア負担', '不登校傾向'],
    schoolName: [SCHOOLS[0], SCHOOLS[2]][i % 2],
    date: `2026-${String(5 + Math.floor(i / 3)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    continuationStatus: i % 4 < 3 ? '継続中' : '中断',
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

  // 支援メニュー別集計
  const supportMap = new Map<string, SupportRecord[]>();
  records.forEach(r => {
    const list = supportMap.get(r.supportId) || [];
    list.push(r);
    supportMap.set(r.supportId, list);
  });
  const bySupport = Array.from(supportMap.values())
    .map(recs => ({
      name: recs[0].supportName,
      organizationName: recs[0].organizationName,
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
    bySupport,
    monthlyTrend,
  };
}

// 画面D用：特定の問題タグに対する支援候補を生成
export function getSuggestions(
  problemTags: string[],
  supports: SupportWithOrg[],
  records: SupportRecord[],
  schoolName: string
): SupportSuggestion[] {
  // 問題タグ → YOSS 8領域のマッピング
  const tagToCategory: Record<string, string[]> = {
    '不登校傾向': ['学校適応', '地域情報'],
    '欠席・遅刻': ['学校適応'],
    '友人トラブル': ['学校適応'],
    '学習の遅れ': ['学習'],
    '宿題未提出': ['学習'],
    '家庭でのケア負担': ['家庭状況', '福祉'],
    '保護者支援が必要': ['家庭状況'],
    '連絡が取れない': ['家庭状況'],
    '発達特性': ['発達'],
    '保健室頻回': ['健康'],
    '経済的困窮': ['経済', '地域情報'],
    '諸費滞納': ['経済'],
    'SC/SSW関与': ['福祉'],
    '要対協ケース': ['福祉'],
    '孤立・居場所なし': ['地域情報'],
    '地域からの気になる情報': ['地域情報'],
  };

  const relevantCategories = new Set<string>();
  problemTags.forEach(tag => {
    (tagToCategory[tag] || []).forEach(cat => relevantCategories.add(cat));
  });

  return supports
    .filter(s => s.enabled && relevantCategories.has(s.category))
    .map(s => {
      const relatedRecords = records.filter(rec => rec.supportId === s.id);
      const schoolRecords = relatedRecords.filter(rec => rec.schoolName === schoolName);
      const continuing = relatedRecords.filter(rec => rec.continuationStatus === '継続中');

      return {
        supportId: s.id,
        supportName: s.name,
        category: s.category,
        organizationName: s.organizationName,
        organizationType: s.organizationType,
        contact: s.contact,
        cityWideCount: relatedRecords.length,
        schoolCount: schoolRecords.length,
        continuationRate: relatedRecords.length > 0
          ? Math.round((continuing.length / relatedRecords.length) * 100)
          : null,
        isNew: relatedRecords.length === 0,
        details: `${s.targetGrades} / ${s.cost} / ${s.capacity}`,
      };
    })
    .sort((a, b) => b.cityWideCount - a.cityWideCount);
}
