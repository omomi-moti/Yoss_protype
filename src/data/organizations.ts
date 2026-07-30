import type { Organization, OrganizationSupport, OrganizationType, ProblemTag, RelevantReview, ReviewSummary, SchoolReview, SupportCategory, SupportWithOrg } from '../types';

// 画面Cのフィルタ用（YOSS 8領域の表示順）
export const SUPPORT_CATEGORIES: SupportCategory[] = [
  '学校適応',
  '学習',
  '家庭状況',
  '発達',
  '健康',
  '経済',
  '福祉',
  '地域情報',
];

// 画面Cのフィルタ用（種別の表示順）
export const ORGANIZATION_TYPES: OrganizationType[] = [
  'NPO',
  '社会福祉協議会',
  '自治体事業',
  'ボランティア団体',
  '民間企業',
  'その他',
];

// categories は supports から導出するため、データ定義では持たない
type OrganizationSeed = Omit<Organization, 'categories'>;

const seeds: OrganizationSeed[] = [
  {
    id: 'org-1',
    name: '○○子ども食堂ネットワーク',
    operator: '特定非営利活動法人 ○○こども支援ネット',
    type: 'NPO',
    area: { prefecture: '大阪府', city: '○○市' },
    description: '市内3箇所で子ども食堂を運営。food bank と連携した食料支援も行う。学校からの紹介は電話1本で受け付け、初回は職員が同席して顔つなぎをします。地域の大人と子どもが日常的に出会える場づくりを大切にしています。',
    contact: { tel: '072-000-0001', email: 'info@example-shokudo.org', web: 'https://example-shokudo.org' },
    supports: [
      { id: 'r4', name: '子ども食堂', category: '地域情報', description: '無料または低額の食事提供と居場所', targetGrades: '全学年', cost: '無料〜100円', capacity: '各30名程度', frequency: '週2回（火・金 17:00〜19:00）', howToUse: '学校から電話1本で受付。初回は職員が同席して顔つなぎをします', enabled: true },
      { id: 's-pantry', name: 'フードパントリー', category: '経済', description: '食料品の無償配布（月2回）', targetGrades: '-', cost: '無料', capacity: '月40世帯', frequency: '月2回（第2・第4土曜）', howToUse: '事前申込制。学校経由の紹介も受け付けます', enabled: true },
    ],
    reviews: [
      {
        schoolName: '○○小学校',
        supportUsed: '子ども食堂',
        rating: 5,
        comment: '経済的に厳しい家庭の児童を繋いだところ、食事の確保だけでなく地域の大人との関係ができ、表情が明るくなった。',
        date: '2026-06',
        problemTags: ['経済的困窮', '孤立・居場所なし'],
      },
    ],
    isMine: true,
  },
  {
    id: 'org-2',
    name: '○○市社会福祉協議会',
    operator: '社会福祉法人 ○○市社会福祉協議会',
    type: '社会福祉協議会',
    area: { prefecture: '大阪府', city: '○○市' },
    description: '大学生ボランティアによる学習支援教室と、公民館を活用した放課後の居場所づくりを運営。ボランティアコーディネートの実績が長く、学校と地域をつなぐ調整役も担っています。',
    contact: { tel: '072-000-0002', email: 'shakyo@example.or.jp' },
    supports: [
      { id: 'r7', name: '学習支援教室', category: '学習', description: '大学生ボランティアによる学習支援', targetGrades: '小4〜中3', cost: '無料', capacity: '各回15名', frequency: '週1回（水 16:00〜18:00）', howToUse: '空き枠を電話で確認のうえ申込。体験参加も可', enabled: true },
      { id: 'r5', name: '放課後子ども教室', category: '地域情報', description: '放課後の安全な居場所と体験活動', targetGrades: '小1〜小6', cost: '無料', capacity: '各校40名', frequency: '平日毎日（放課後〜17:30）', howToUse: '各校の窓口で年度当初に登録。途中参加も可', enabled: true },
    ],
    reviews: [
      {
        schoolName: '△△小学校',
        supportUsed: '学習支援教室',
        rating: 4,
        comment: '不登校傾向の児童が学校外の学びの場として通い始めた。大学生との距離感が本人に合っていたようだ。',
        date: '2026-05',
        problemTags: ['学習の遅れ', '不登校傾向'],
      },
    ],
    isMine: false,
  },
  {
    id: 'org-3',
    name: '○○市こども家庭センター',
    operator: '○○市 こども未来部',
    type: '自治体事業',
    area: { prefecture: '大阪府', city: '○○市' },
    description: '保護者相談・家庭訪問・ヤングケアラー相談の窓口。LINE相談は24時間受付で、電話や来所では繋がらなかった家庭とのコンタクトに実績があります。要対協の事務局も担っています。',
    contact: { tel: '072-000-0003', email: 'kodomo@city.example.lg.jp', web: 'https://city.example.lg.jp/kodomo' },
    supports: [
      { id: 'r9', name: '保護者相談窓口', category: '家庭状況', description: '子育ての悩み全般に対応（LINE相談は24時間受付）', targetGrades: '-', cost: '無料', capacity: '予約制', frequency: '平日 9:00〜17:00（LINEは24時間受付）', howToUse: '保護者から直接、または学校からの取次ぎでも可', enabled: true },
      { id: 'r10', name: '家庭訪問支援', category: '家庭状況', description: '養育支援訪問事業', targetGrades: '-', cost: '無料', capacity: '月10件程度', frequency: '月2〜4回（1回2時間程度）', howToUse: '学校またはSSWから申込。事前に家庭との面談があります', enabled: true },
      { id: 's-ycarer', name: 'ヤングケアラー相談', category: '福祉', description: '専用相談窓口・ヘルパー派遣制度の案内', targetGrades: '全学年', cost: '無料', capacity: '随時', frequency: '随時（要予約）', howToUse: '学校から連絡。本人・保護者の同意を得たうえで面談します', enabled: true },
      { id: 'r11', name: '保護者プログラム', category: '家庭状況', description: 'ペアレントトレーニング（全6回）', targetGrades: '-', cost: '無料', capacity: '各回10名', frequency: '全6回（隔週・土曜午前）', howToUse: '年2期の募集時に申込。全回参加が原則です', enabled: false },
    ],
    reviews: [
      {
        schoolName: '□□中学校',
        supportUsed: '保護者相談窓口',
        rating: 5,
        comment: 'ヤングケアラーの疑いがあった生徒について、こども家庭センター経由で保護者支援に繋がった。担任一人では絶対にできなかった。',
        date: '2026-07',
        problemTags: ['家庭でのケア負担', '保護者支援が必要'],
      },
      {
        schoolName: '☆☆中学校',
        supportUsed: '保護者相談窓口（LINE）',
        rating: 5,
        comment: 'LINE相談は保護者のハードルが低く、電話や来所では繋がらなかった家庭と初めてコンタクトが取れた。',
        date: '2026-07',
        problemTags: ['保護者支援が必要', '不登校傾向'],
      },
      {
        schoolName: '◇◇小学校',
        supportUsed: '家庭訪問支援',
        rating: 5,
        comment: '民生委員さんとSSWが一緒に訪問してくれた。保護者が心を開いてくれて、就学援助の申請にもつながった。',
        date: '2026-06',
        problemTags: ['経済的困窮', '保護者支援が必要'],
      },
      {
        schoolName: '△△小学校',
        supportUsed: 'ヤングケアラー相談',
        rating: 5,
        comment: 'ヘルパー派遣により弟の世話の負担が減り、放課後に友達と過ごす時間ができた。本人の笑顔が増えた。',
        date: '2026-07',
        problemTags: ['家庭でのケア負担'],
      },
    ],
    isMine: false,
  },
  {
    id: 'org-4',
    name: 'フリースクールにじ',
    operator: '特定非営利活動法人 にじの会',
    type: 'NPO',
    area: { prefecture: '大阪府', city: '△△市' },
    description: '不登校の子どもの学びの場。市教委と出席認定の取り決めがあり、在籍校への報告書も発行します。週1日からの利用が可能で、まず見学だけという相談も歓迎しています。',
    contact: { tel: '072-000-0004', web: 'https://example-niji.org' },
    supports: [
      { id: 'r6', name: 'フリースクール通所', category: '学校適応', description: '不登校児童生徒の学びの場（出席認定対応）', targetGrades: '小1〜中3', cost: '月額5,000円〜', capacity: '15名', frequency: '週1〜5日（日数は選択制）', howToUse: 'まず見学だけの相談も歓迎。面談後、在籍校と出席認定を確認します', enabled: true },
      { id: 's-online', name: 'オンライン学習サポート', category: '学習', description: '通所が難しい子ども向けの在宅学習支援', targetGrades: '小4〜中3', cost: '月額3,000円', capacity: '10名', frequency: '週2回（各60分）', howToUse: 'Webから申込。端末の貸出あり', enabled: false },
    ],
    reviews: [
      {
        schoolName: '○○小学校',
        supportUsed: 'フリースクール通所',
        rating: 5,
        comment: '半年以上完全不登校だった児童が、フリースクールを経由して少しずつ別室登校を始めた。出席認定の仕組みが保護者の安心感につながった。',
        date: '2026-06',
        problemTags: ['不登校傾向', '孤立・居場所なし'],
      },
    ],
    isMine: false,
  },
  {
    id: 'org-5',
    name: '△△学習支援ボランティアの会',
    operator: '任意団体 △△学習支援ボランティアの会',
    type: 'ボランティア団体',
    area: { prefecture: '大阪府', city: '○○市' },
    description: '外国にルーツのある子どもへの日本語指導を中心に、公民館で週2回の学習室を開いています。通訳ボランティアが在籍しており、保護者面談への同行依頼も受け付けています。',
    contact: { email: 'volunteer@example.net' },
    supports: [
      { id: 'r8', name: '日本語指導教室', category: '学習', description: '外国にルーツのある児童生徒向け', targetGrades: '全学年', cost: '無料', capacity: '10名', frequency: '週2回（火・木 16:00〜18:00／公民館）', howToUse: 'メールで申込。保護者面談への通訳同行も相談可', enabled: true },
    ],
    reviews: [],
    isMine: false,
  },
  {
    id: 'org-6',
    name: '○○市教育委員会 学事課',
    operator: '○○市教育委員会',
    type: '自治体事業',
    area: { prefecture: '大阪府', city: '○○市' },
    description: '就学援助・給付型奨学金などの経済的支援と、適応指導教室・SC/SSW配置を所管。就学援助はオンライン申請に対応しており、学校からの案内文書のひな形も提供しています。',
    contact: { tel: '072-000-0006', web: 'https://city.example.lg.jp/kyoiku' },
    supports: [
      { id: 'r1', name: '就学援助', category: '経済', description: '学用品費・給食費等の援助（オンライン申請可）', targetGrades: '小1〜中3', cost: '無料', capacity: '所得基準あり', frequency: '年1回（年度途中の申請も可）', howToUse: 'オンライン申請。学校向けに案内文書のひな形を提供しています', enabled: true },
      { id: 'r14', name: '適応指導教室', category: '学校適応', description: '不登校児童生徒の学校復帰を支援', targetGrades: '小1〜中3', cost: '無料', capacity: '各20名', frequency: '平日毎日（9:00〜14:00）', howToUse: '在籍校を通じて申込。事前に教育相談を受けます', enabled: true },
      { id: 'r13', name: 'スクールカウンセラー連携', category: '福祉', description: 'SC・SSWとの連携による心理／福祉支援', targetGrades: '全学年', cost: '無料', capacity: '各校週1回', frequency: '各校 週1回の巡回', howToUse: '学校から派遣を依頼。緊急時は別途相談', enabled: true },
      { id: 'r3', name: '給付型奨学金', category: '経済', description: '返済不要の奨学金', targetGrades: '中3', cost: '無料', capacity: '年間20名', frequency: '年1回（12月募集）', howToUse: '学校長の推薦を得たうえで申請', enabled: false },
    ],
    reviews: [
      {
        schoolName: '○○小学校',
        supportUsed: '就学援助',
        rating: 4,
        comment: '諸費の滞納が続いていた家庭に案内。申請後、持ち物の状態が改善された。',
        date: '2026-05',
        problemTags: ['経済的困窮'],
      },
      {
        schoolName: '□□中学校',
        supportUsed: 'スクールカウンセラー連携',
        rating: 5,
        comment: 'SSWが定期的に来てくれるので、気になった時にすぐ相談できる。巡回の頻度がもう少し上がると助かる。',
        date: '2026-07',
        problemTags: ['不登校傾向', '発達特性'],
      },
    ],
    isMine: false,
  },
  {
    id: 'org-7',
    name: '○○市保健センター',
    operator: '○○市 健康福祉部',
    type: '自治体事業',
    area: { prefecture: '大阪府', city: '○○市' },
    description: '発達相談と医療費助成の窓口。発達相談は月2回、専門医が同席する枠を設けています。待機期間は2週間程度で、学校からの情報提供書があると初回の見立てがスムーズです。',
    contact: { tel: '072-000-0007', email: 'hoken@city.example.lg.jp' },
    supports: [
      { id: 'r12', name: '発達相談', category: '発達', description: '発達に関する専門相談（医師同席枠あり）', targetGrades: '全学年', cost: '無料', capacity: '月12件', frequency: '月2回（専門医が同席する枠あり）', howToUse: '電話予約。待機は2週間程度。学校からの情報提供書があると初回が円滑です', enabled: true },
      { id: 'r2', name: '医療費助成', category: '健康', description: '18歳以下の医療費自己負担分を助成', targetGrades: '全学年', cost: '無料', capacity: '制限なし', frequency: '通年', howToUse: '市の窓口で受給者証を申請', enabled: true },
    ],
    reviews: [],
    isMine: false,
  },
  {
    id: 'org-8',
    name: '株式会社まなびや ○○教室',
    operator: '株式会社まなびや',
    type: '民間企業',
    area: { prefecture: '大阪府', city: '○○市' },
    description: '学習塾の空き枠を活用した無償の学習席を提供しています（CSR事業）。学校またはスクールソーシャルワーカーからの推薦が必要で、教材費も含めて費用は一切かかりません。',
    contact: { tel: '072-000-0008', web: 'https://example-manabiya.co.jp/csr' },
    supports: [
      { id: 's-seat', name: '無償学習席の提供', category: '学習', description: '学習塾の空き枠を無償開放（学校推薦制）', targetGrades: '小5〜中3', cost: '無料', capacity: '各教室5名', frequency: '週3回（月・水・金 17:00〜21:00）', howToUse: '学校またはSSWの推薦が必要。教材費も含めて費用はかかりません', enabled: true },
    ],
    reviews: [],
    isMine: false,
  },
];

// 対応領域は「現在対応可能な支援」から導出する
export function deriveCategories(supports: OrganizationSupport[]): SupportCategory[] {
  return [...new Set(supports.filter(s => s.enabled).map(s => s.category))];
}

/**
 * 学校レビューを集計する。
 * SchoolReview.supportUsed は自由記述（「保護者相談窓口（LINE）」など）で支援メニューと
 * 1対1に対応しないため、集計は団体単位で行う。
 */
export function summarizeReviews(reviews: SchoolReview[]): ReviewSummary {
  if (reviews.length === 0) return { averageRating: null, count: 0 };

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { averageRating: total / reviews.length, count: reviews.length };
}

/**
 * 学校レビューに「検討中の児童との重なり」を付けて並べ替える。
 *
 * 会議で知りたいのは「同じような課題の子にこの団体を使って、こうなったか」なので、
 * 児童の課題タグと重なるレビューを先に出す。重なりが同数なら新しい順。
 */
export function sortReviewsByRelevance(
  reviews: SchoolReview[],
  studentTags: ProblemTag[]
): RelevantReview[] {
  return reviews
    .map(review => ({
      review,
      matchedTags: review.problemTags.filter(tag => studentTags.includes(tag)),
    }))
    .sort((a, b) => {
      if (a.matchedTags.length !== b.matchedTags.length) {
        return b.matchedTags.length - a.matchedTags.length;
      }
      return b.review.date.localeCompare(a.review.date);
    });
}

export const organizations: Organization[] = seeds.map(org => ({
  ...org,
  categories: deriveCategories(org.supports),
}));

// 画面D（校内チーム会議）向けに、支援メニューを団体横断でフラット化する
export function getAllSupports(orgs: Organization[] = organizations): SupportWithOrg[] {
  return orgs.flatMap(org =>
    org.supports.map(support => ({
      ...support,
      organizationId: org.id,
      organizationName: org.name,
      organizationType: org.type,
      contact: org.contact,
    }))
  );
}
