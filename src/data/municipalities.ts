export interface SchoolReview {
  schoolName: string;
  supportUsed: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  problemTags: string[];
}

export interface Municipality {
  id: string;
  name: string;
  prefecture: string;
  population: string;
  schoolCount: number;
  description: string;
  supportTags: string[];
  supports: {
    name: string;
    category: string;
    detail: string;
  }[];
  reviews: SchoolReview[];
  isMine: boolean;
}

export const ALL_TAGS = [
  '就学援助', '医療費助成', '子ども食堂', '放課後居場所', 'フリースクール連携',
  '学習支援', '日本語指導', '保護者相談', '家庭訪問', '発達相談',
  'SC連携', 'SSW配置', 'ヤングケアラー支援', '給付型奨学金', '保護者プログラム',
];

export const municipalities: Municipality[] = [
  {
    id: 'm1',
    name: '○○市',
    prefecture: '大阪府',
    population: '約12万人',
    schoolCount: 5,
    description: '子育て支援に力を入れており、こども家庭センターを中心に学校・地域連携を推進中。YOSS導入2年目。',
    supportTags: ['就学援助', '医療費助成', '子ども食堂', '放課後居場所', '学習支援', '日本語指導', '保護者相談', '家庭訪問', '発達相談', 'SC連携', 'SSW配置'],
    supports: [
      { name: '就学援助', category: '経済面', detail: '小1〜中3 / 無料 / 所得基準あり' },
      { name: '医療費助成', category: '経済面', detail: '18歳以下 / 自己負担分を全額助成' },
      { name: '子ども食堂', category: '居場所', detail: '市内3箇所 / 無料〜100円 / 各30名' },
      { name: '放課後子ども教室', category: '居場所', detail: '小1〜小6 / 無料 / 各校40名' },
      { name: '学習支援教室', category: '学習', detail: '小4〜中3 / 無料 / 大学生ボランティア' },
      { name: '日本語指導教室', category: '学習', detail: '全学年 / 無料 / 10名' },
      { name: '保護者相談窓口', category: '家庭支援', detail: '予約制 / 無料 / こども家庭センター' },
      { name: '家庭訪問支援', category: '家庭支援', detail: '月10件程度 / 養育支援訪問事業' },
      { name: '発達相談', category: '健康・発達', detail: '全学年 / 無料 / 月12件' },
      { name: 'SC連携', category: '健康・発達', detail: '各校週1回配置' },
      { name: 'SSW配置', category: '健康・発達', detail: '拠点校方式・巡回型' },
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
      {
        schoolName: '△△小学校',
        supportUsed: '学習支援教室',
        rating: 4,
        comment: '不登校傾向の児童が学校外の学びの場として通い始めた。大学生との距離感が本人に合っていたようだ。',
        date: '2026-05',
        problemTags: ['学習の遅れ', '不登校傾向'],
      },
      {
        schoolName: '□□中学校',
        supportUsed: '保護者相談窓口',
        rating: 5,
        comment: 'ヤングケアラーの疑いがあった生徒について、こども家庭センター経由で保護者支援に繋がった。担任一人では絶対にできなかった。',
        date: '2026-07',
        problemTags: ['家庭でのケア負担', '保護者支援が必要'],
      },
      {
        schoolName: '○○小学校',
        supportUsed: '就学援助',
        rating: 4,
        comment: '諸費の滞納が続いていた家庭に案内。申請後、持ち物の状態が改善された。',
        date: '2026-05',
        problemTags: ['経済的困窮'],
      },
    ],
    isMine: true,
  },
  {
    id: 'm2',
    name: '△△市',
    prefecture: '大阪府',
    population: '約8万人',
    schoolCount: 3,
    description: 'フリースクール連携と保護者プログラムに先進的に取り組む。不登校支援のモデル自治体として注目。',
    supportTags: ['就学援助', '医療費助成', '子ども食堂', 'フリースクール連携', '学習支援', '保護者相談', '保護者プログラム', '発達相談', 'SC連携', 'SSW配置', 'ヤングケアラー支援'],
    supports: [
      { name: '就学援助', category: '経済面', detail: '小1〜中3 / 無料 / 所得基準あり' },
      { name: '医療費助成', category: '経済面', detail: '中3まで / 自己負担分を助成' },
      { name: '子ども食堂', category: '居場所', detail: '市内5箇所 / 無料 / NPO運営' },
      { name: 'フリースクール連携', category: '居場所', detail: '2箇所と提携 / 月額補助あり / 出席認定対応' },
      { name: '学習支援教室', category: '学習', detail: '中学生対象 / 週2回 / 無料' },
      { name: '保護者相談窓口', category: '家庭支援', detail: 'こども家庭センター内 / 予約不要の日あり' },
      { name: '保護者プログラム', category: '家庭支援', detail: 'ペアレントトレーニング全6回 / 無料 / 年3クール' },
      { name: '発達相談', category: '健康・発達', detail: '全学年 / 月8件 / 医師同席あり' },
      { name: 'ヤングケアラー支援', category: '家庭支援', detail: '専用相談窓口 / ヘルパー派遣制度あり' },
    ],
    reviews: [
      {
        schoolName: '市立A小学校',
        supportUsed: 'フリースクール連携',
        rating: 5,
        comment: '半年以上完全不登校だった児童が、フリースクールを経由して少しずつ別室登校を始めた。出席認定の仕組みが保護者の安心感につながった。',
        date: '2026-06',
        problemTags: ['不登校傾向', '孤立・居場所なし'],
      },
      {
        schoolName: '市立B中学校',
        supportUsed: '保護者プログラム',
        rating: 4,
        comment: '保護者が子どもとの関わり方を学んだことで、家庭での衝突が減り、生徒の遅刻が大幅に改善した。',
        date: '2026-05',
        problemTags: ['保護者支援が必要'],
      },
      {
        schoolName: '市立A小学校',
        supportUsed: 'ヤングケアラー支援',
        rating: 5,
        comment: 'ヘルパー派遣により弟の世話の負担が減り、放課後に友達と過ごす時間ができた。本人の笑顔が増えた。',
        date: '2026-07',
        problemTags: ['家庭でのケア負担'],
      },
    ],
    isMine: false,
  },
  {
    id: 'm3',
    name: '□□町',
    prefecture: '大阪府',
    population: '約2万人',
    schoolCount: 2,
    description: '小規模自治体ながら、地域のつながりを活かした子ども支援を実施。SSWの常勤配置が特徴。',
    supportTags: ['就学援助', '子ども食堂', '放課後居場所', '保護者相談', '家庭訪問', 'SSW配置'],
    supports: [
      { name: '就学援助', category: '経済面', detail: '小1〜中3 / 無料' },
      { name: '子ども食堂', category: '居場所', detail: '月2回 / 社協運営 / 無料' },
      { name: '放課後居場所', category: '居場所', detail: '公民館活用 / 週3日 / 無料' },
      { name: '保護者相談窓口', category: '家庭支援', detail: '役場福祉課 / 随時対応' },
      { name: '家庭訪問支援', category: '家庭支援', detail: '民生委員と連携 / 月5件程度' },
      { name: 'SSW常勤配置', category: '健康・発達', detail: '週5日常駐 / 全校巡回' },
    ],
    reviews: [
      {
        schoolName: '町立小学校',
        supportUsed: '家庭訪問支援',
        rating: 5,
        comment: '民生委員さんとSSWが一緒に訪問してくれた。保護者が心を開いてくれて、就学援助の申請にもつながった。小規模だからこそできる連携だと思う。',
        date: '2026-06',
        problemTags: ['経済的困窮', '保護者支援が必要'],
      },
      {
        schoolName: '町立中学校',
        supportUsed: 'SSW常勤配置',
        rating: 5,
        comment: 'SSWが毎日いるので、気になった時にすぐ相談できる。週1回の巡回型では絶対にこのスピード感は出ない。',
        date: '2026-07',
        problemTags: ['不登校傾向', '発達特性'],
      },
    ],
    isMine: false,
  },
  {
    id: 'm4',
    name: '◇◇市',
    prefecture: '大阪府',
    population: '約15万人',
    schoolCount: 8,
    description: 'データ活用に積極的で、YOSSと独自の出席管理システムを連携。給付型奨学金制度が充実。',
    supportTags: ['就学援助', '医療費助成', '給付型奨学金', '子ども食堂', '放課後居場所', '学習支援', '保護者相談', '発達相談', 'SC連携', 'SSW配置'],
    supports: [
      { name: '就学援助', category: '経済面', detail: '小1〜中3 / 無料 / オンライン申請可' },
      { name: '医療費助成', category: '経済面', detail: '18歳まで / 完全無料化' },
      { name: '給付型奨学金', category: '経済面', detail: '中3対象 / 年間50名 / 月1万円' },
      { name: '子ども食堂', category: '居場所', detail: '市内8箇所 / 企業協賛あり' },
      { name: '放課後居場所', category: '居場所', detail: '全校実施 / 無料 / 地域ボランティア' },
      { name: '学習支援教室', category: '学習', detail: '小5〜中3 / 週3回 / ICT教材あり' },
      { name: '保護者相談', category: '家庭支援', detail: 'LINE相談対応 / 24時間受付' },
      { name: '発達相談', category: '健康・発達', detail: '専門医月2回 / 待機2週間' },
    ],
    reviews: [
      {
        schoolName: '市立C小学校',
        supportUsed: '給付型奨学金',
        rating: 4,
        comment: '修学旅行の費用が心配だった家庭に案内できた。経済面の不安が減ったことで、本人も行事に前向きになった。',
        date: '2026-06',
        problemTags: ['経済的困窮'],
      },
      {
        schoolName: '市立D中学校',
        supportUsed: '保護者相談（LINE）',
        rating: 5,
        comment: 'LINE相談は保護者のハードルが低く、電話や来所では繋がらなかった家庭と初めてコンタクトが取れた。',
        date: '2026-07',
        problemTags: ['保護者支援が必要', '不登校傾向'],
      },
    ],
    isMine: false,
  },
];
