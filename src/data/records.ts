import type { ProblemTag, ScreeningEntry, StaffRole, Student, SupportRecord } from '../types';

/**
 * スクリーニングと対応記録のデモデータ。
 *
 * 画面Dのタブ①②③が出す情報は、どれも「先生が既に入力しているもの」という設定なので、
 * 児童ごとに別々のデータを持たず、スクリーニングの問題タグ1つから
 *   タブ①＝担当の自由記述 ／ タブ②＝スクリーニングの項目行 ／ タブ③＝日常の対応記録
 * の3つを導出する。タグを足したら3つのタブに同時に反映される。
 */

/** タブ①のカードとタブ②の担当タブの並び */
export const STAFF_ROLES: StaffRole[] = [
  '担任',
  '特別支援',
  '養護',
  '事務',
  'SC・SSW',
  '管理職・生指',
];

interface ScreeningItemDef {
  role: StaffRole;
  /** スクリーニングの項目名（タブ②の行） */
  item: string;
  /** 担当が入力した気になる情報（タブ①のカード本文） */
  note: string;
  /** 日常の対応記録（タブ③） */
  record: string;
}

const SCREENING_ITEMS: Record<ProblemTag, ScreeningItemDef> = {
  不登校傾向: {
    role: '担任',
    item: '欠席・不登校傾向',
    note: '2学期に入って欠席が増えている。朝の連絡がないまま休む日がある。',
    record: '欠席の連絡がないため家庭へ電話。つながらず。',
  },
  '欠席・遅刻': {
    role: '担任',
    item: '欠席・遅刻の増加',
    note: '遅刻が増えている。朝の支度が整わないまま登校する日が多い。',
    record: '遅刻について本人に声かけ。朝起きられないとのこと。',
  },
  友人トラブル: {
    role: '担任',
    item: '友人関係のトラブル',
    note: '休み時間を一人で過ごすことが多い。友達との距離感がつかみにくい様子。',
    record: '休み時間のトラブルについて双方から聞き取り。',
  },
  学習の遅れ: {
    role: '担任',
    item: '学習の遅れ',
    note: '学年相当の内容に遅れが見られる。個別の声かけを続けている。',
    record: '放課後に個別の補習を実施。',
  },
  宿題未提出: {
    role: '担任',
    item: '持ち物・宿題の未提出',
    note: '宿題や持ち物が揃わない日が増えている。',
    record: '持ち物が揃わない件で保護者へ連絡帳で連絡。',
  },
  連絡が取れない: {
    role: '担任',
    item: '保護者と連絡が取れない',
    note: '家庭への連絡がつかない日が続いている。',
    record: '保護者へ電話。折り返しなし。翌日に再連絡予定。',
  },
  '孤立・居場所なし': {
    role: '担任',
    item: '放課後の居場所がない',
    note: '放課後に一人で過ごしていることが多い。帰宅後の様子が見えにくい。',
    record: '放課後の過ごし方について本人に確認。',
  },
  発達特性: {
    role: '特別支援',
    item: '発達面の配慮の必要性',
    note: '一斉指示が入りにくい。個別の配慮を続けている。',
    record: '通級指導での様子を担任と共有。',
  },
  保健室頻回: {
    role: '養護',
    item: '保健室の来室が多い',
    note: '保健室の来室が増えている。朝食を摂っていない日がある様子。',
    record: '頭痛で保健室来室（今学期3回目）。朝食なし。',
  },
  経済的困窮: {
    role: '事務',
    item: '経済状況の困難',
    note: '学用品が揃わない状態が続いている。就学援助の申請は未提出のまま。',
    record: '就学援助の案内を再送付。',
  },
  諸費滞納: {
    role: '事務',
    item: '諸費の滞納',
    note: '諸費の滞納が2学期も続いている。',
    record: '諸費の督促を送付。',
  },
  家庭でのケア負担: {
    role: 'SC・SSW',
    item: '家庭でのケア負担',
    note: '家庭で家族の世話を担っている様子。疲れが見える日がある。',
    record: '家庭訪問で生活の状況を確認。',
  },
  保護者支援が必要: {
    role: 'SC・SSW',
    item: '保護者への支援の必要性',
    note: '保護者自身に余裕がなく、家庭だけでの対応が難しい。',
    record: '保護者面談に同席し、利用できる制度を案内。',
  },
  'SC/SSW関与': {
    role: 'SC・SSW',
    item: 'SC・SSWの関与',
    note: 'SSWが関与中。定期的に状況を共有している。',
    record: 'ケース会議で情報共有。継続支援。',
  },
  要対協ケース: {
    role: '管理職・生指',
    item: '要対協ケース',
    note: '要保護児童対策地域協議会で共有済み。継続して見守る。',
    record: '要対協で情報共有。継続見守り。',
  },
  地域からの気になる情報: {
    role: '管理職・生指',
    item: '地域からの情報提供',
    note: '地域の方から、放課後の様子について気になる情報が寄せられている。',
    record: '地域からの情報を受け、担任と情報共有。',
  },
};

/** 対応記録に振る日付。新しい順に、この児童のタグの数だけ使う */
const RECORD_DATES = ['9/12', '9/05', '8/29', '7/18', '7/02', '6/20', '6/05'];

/** タブ①：担当ごとの「気になる情報」。入力の無い担当も並べる（抜け漏れに見せないため） */
export function entriesByRole(student: Student): { role: StaffRole; entries: ScreeningEntry[] }[] {
  const entries = student.problems.map(tag => {
    const { role, item, note } = SCREENING_ITEMS[tag];
    return { role, item, note };
  });

  return STAFF_ROLES.map(role => ({
    role,
    entries: entries.filter(entry => entry.role === role),
  }));
}

/** タブ③：日常の対応記録。新しい順・参照専用 */
export function supportRecords(student: Student): SupportRecord[] {
  return student.problems.map((tag, index) => ({
    date: RECORD_DATES[index % RECORD_DATES.length],
    role: SCREENING_ITEMS[tag].role,
    text: SCREENING_ITEMS[tag].record,
  }));
}

/** タブ②：前学期のチーム会議で残っている記録 */
export function previousMeetingMemo(student: Student): string {
  return `${student.notes}。前学期のチーム会議で共有し、継続して見守ることを確認。`;
}
