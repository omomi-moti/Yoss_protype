import type { Student } from '../types';

// デモ用の児童データ（スクリーニング会議で挙がった想定）
export const demoStudents: Student[] = [
  {
    id: 'S-001',
    grade: '5年1組',
    number: 12,
    score: 9,
    problems: ['経済的困窮', '孤立・居場所なし'],
    notes: '遅刻多い・身だしなみが気になる・給食をたくさん食べる',
    currentSupport: 'A（担任の声かけ）',
  },
  {
    id: 'S-002',
    grade: '3年2組',
    number: 8,
    score: 7,
    problems: ['学習の遅れ', '保護者支援が必要'],
    notes: '宿題未提出が続く・保護者と連絡が取りにくい',
    currentSupport: 'A（学年主任の面談）',
  },
  {
    id: 'S-003',
    grade: '6年1組',
    number: 23,
    score: 11,
    problems: ['不登校傾向', '家庭でのケア負担', '孤立・居場所なし'],
    notes: '欠席増加・弟の世話で疲れている様子・保健室利用増',
    currentSupport: 'A+B（SC相談開始）',
  },
];
