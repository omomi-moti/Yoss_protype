import type {
  DomainScores,
  ProblemTag,
  ScreeningAnswers,
  ScreeningChange,
  ScreeningItem,
  ScreeningOwner,
  SupportCategory,
} from '../types';
import { SUPPORT_CATEGORIES } from './organizations';

/**
 * 実物のスクリーニング37項目。
 *
 * 実物では、この37項目に付けた点数の合計が8領域のスコアになる。本プロトタイプでも
 * 同じ向きにして、児童のスコアは手で置かず、ここから導出する。
 *
 * 各領域の満点は項目数で変わる（学校適応は9項目=18点、経済は3項目=6点）が、
 * 実物の画面はどの領域も「10点」で並べているので、表示のときだけ10点満点に
 * 正規化する（normalizeScore）。順序づけや支援候補の抽出は正規化後の値で行う。
 */

/** 領域の見出し。実物のタブ名が8領域の名前と違うものだけ書き換える */
export const DOMAIN_GROUP_LABELS: Record<SupportCategory, string> = {
  学校適応: '学校適応',
  学習: '学習',
  家庭状況: '家庭状況',
  発達: '発達',
  健康: '健康',
  経済: '経済',
  福祉: '専門職や他機関利用状況',
  地域情報: '地域からの情報',
};

const SCREENING_ITEMS: ScreeningItem[] = [
  {
    id: 1,
    domain: '学校適応',
    owner: 'データ',
    label: '転入',
    criteria: '過去に転入があるか はじめての転入…1 2回目以降の転入…2',
  },
  {
    id: 2,
    domain: '学校適応',
    owner: 'データ',
    label: '欠席日数',
    criteria: '学年ごとの欠席日数を入力する（点数は付かない）',
    scored: false,
  },
  {
    id: 3,
    domain: '学校適応',
    owner: 'データ',
    label: '不登校期間あり',
    criteria: '30~89日の欠席がある…1 90日以上の欠席がある…2',
  },
  {
    id: 4,
    domain: '学校適応',
    owner: 'データ',
    label: '7日以上の欠席',
    criteria: '今年度、7日間以上の欠席…1 連続した7日間以上の欠席…2',
  },
  {
    id: 5,
    domain: '学校適応',
    owner: '学級',
    label: '遅刻・早退',
    criteria: '遅刻または早退が週1回程度…1 週3以上…2',
  },
  {
    id: 6,
    domain: '学校適応',
    owner: '学級',
    label: '服装・身だしなみ',
    criteria: '週1回程度…1、週3以上…2',
    starred: true,
  },
  {
    id: 7,
    domain: '学校適応',
    owner: '学級',
    label: '言葉遣い等',
    criteria: '週1回程度…1、週3以上…2',
  },
  {
    id: 8,
    domain: '学校適応',
    owner: '学級',
    label: '友人関係',
    criteria: '友人とトラブルになる、ひとりでいる時間が多い、など週1回程度…1、週3以上…2',
  },
  {
    id: 9,
    domain: '学校適応',
    owner: '学級',
    label: 'けが',
    criteria:
      '目に見えるけがが多い、よく転ぶ、保護者の養育不適応によるけががあるなど 気になる…1、特に気になる…2',
  },
  { id: 10, domain: '学校適応', owner: '学級', label: 'その他', criteria: '' },

  {
    id: 11,
    domain: '学習',
    owner: '学級',
    label: '学力',
    criteria: '今学期、急激な学力の低下がみられる 気になる…1、特に気になる…2',
  },
  { id: 12, domain: '学習', owner: '学級', label: '授業中の様子', criteria: '週1回程度…1、週3以上…2' },
  {
    id: 13,
    domain: '学習',
    owner: '学級',
    label: '宿題',
    criteria: '宿題を忘れる、宿題をしてこない、など 週1回程度…1、週3以上…2',
  },
  { id: 14, domain: '学習', owner: '学級', label: 'その他', criteria: '' },

  {
    id: 15,
    domain: '家庭状況',
    owner: '学級',
    label: '持ち物',
    criteria: '体操服等の忘れ物がある、文房具がそろっていない、など 週1回程度…1、週3以上…2',
  },
  {
    id: 16,
    domain: '家庭状況',
    owner: '学級',
    label: '家庭での様子',
    criteria:
      '家族関係が複雑である（ひとり親で祖父母等の支援がない、継父・継母など）親の心身の健康状態が良くない、外国にルーツがあるなど 気になる…1、特に気になる…2',
  },
  {
    id: 17,
    domain: '家庭状況',
    owner: '学級',
    label: '家庭と連絡',
    criteria: '書類が提出されない、親と連絡がつかない、家庭訪問が実施できないなど 気になる…1、特に気になる…2',
  },
  { id: 18, domain: '家庭状況', owner: '学級', label: 'その他', criteria: '' },

  {
    id: 19,
    domain: '発達',
    owner: '特別支援',
    label: '特別支援学級への在籍',
    criteria: '通級含む 在籍している…1、在籍の上で学校不適応行動がある…2',
  },
  {
    id: 20,
    domain: '発達',
    owner: '特別支援',
    label: '特別支援学級への来訪',
    criteria: '非在籍者であるが、休み時間等に定期的に来訪する 週1回程度…1、週3以上…2',
  },
  { id: 21, domain: '発達', owner: '特別支援', label: 'その他', criteria: '' },

  {
    id: 22,
    domain: '健康',
    owner: '養護',
    label: '成長',
    criteria:
      '学年標準と比較して成長に遅れがある（低身長、低体重）過度な肥満があるなど 気になる…1、特に気になる…2',
  },
  {
    id: 23,
    domain: '健康',
    owner: '養護',
    label: '健康・疾病',
    criteria:
      '歯の未処置がある、発熱ありでも登校させる、校内検診後の受診勧奨に反応がない（治療済み用紙の未提出）など1 自傷行為がある、う歯の未処置が5本以上ある、直接受診を勧めるも疾病等の未受診があるなど2',
    starred: true,
  },
  {
    id: 24,
    domain: '健康',
    owner: '養護',
    label: '保健室への来訪',
    criteria: '定期的に保健室に来訪する 週1回程度…1、週3以上…2',
  },
  {
    id: 25,
    domain: '健康',
    owner: '養護',
    label: '発達',
    criteria: 'コミュニケーションが苦手である、こだわりが強いなど 気になる…1、特に気になる…2',
  },
  { id: 26, domain: '健康', owner: '養護', label: 'その他', criteria: '' },

  { id: 27, domain: '経済', owner: '事務', label: '要保護・準要保護', criteria: '準要保護…1、要保護…2' },
  {
    id: 28,
    domain: '経済',
    owner: '事務',
    label: '諸費',
    criteria: '3ヶ月未満の諸費滞納…1 3ヶ月以上の諸費滞納…2',
    starred: true,
  },
  { id: 29, domain: '経済', owner: '事務', label: 'その他', criteria: '' },

  {
    id: 30,
    domain: '福祉',
    owner: '管理職・生指',
    label: 'SC/SSW',
    criteria: '今学期におけるSC/SSWとのかかわりが1回程度…1、複数回ある…2',
  },
  {
    id: 31,
    domain: '福祉',
    owner: '管理職・生指',
    label: '要対協',
    criteria:
      '要保護児童対策地域協議会ケース（虐待として市に報告している事例のこと）として 過去に挙げた記録がある…1 要保護児童対策地域協議会ケースとして現在挙がっている…2',
    starred: true,
  },
  {
    id: 32,
    domain: '福祉',
    owner: '管理職・生指',
    label: '生活指導案件',
    criteria: '定期的に指導を行う 週1回程度…1、週3以上…2',
  },
  { id: 33, domain: '福祉', owner: '管理職・生指', label: 'その他', criteria: '' },

  {
    id: 34,
    domain: '地域情報',
    owner: '地域・調査',
    label: '地域からの情報',
    criteria:
      '学童保育 放課後学習支援、こども食堂 民生委員等を含む地域の人や資源から入った情報で 気になることがある 気になる…1、特に気になる…2',
  },
  {
    id: 35,
    domain: '地域情報',
    owner: '地域・調査',
    label: 'いじめアンケート',
    criteria: 'いじめアンケートに記載言及がある 気になる…1、特に気になる…2',
  },
  {
    id: 36,
    domain: '地域情報',
    owner: '地域・調査',
    label: '生活状況調査',
    criteria: '調査結果に懸念点がある 気になる…1、特に気になる…2',
  },
  { id: 37, domain: '地域情報', owner: '地域・調査', label: 'その他', criteria: '' },
];

/**
 * 欠席日数（②）の入力枠。実物は在籍しうる学年ぶんの枠が常に並ぶので、
 * 小学1年から高校3年まで固定で持つ。
 */
export const ABSENCE_GRADES = [
  '小学1年', '小学2年', '小学3年', '小学4年',
  '小学5年', '小学6年', '中学1年', '中学2年',
  '中学3年', '高校1年', '高校2年', '高校3年',
];

/** 実物のサブタブの並び。項目はこの単位で分かれて入力される */
export const SCREENING_OWNERS: ScreeningOwner[] = [
  'データ',
  '学級',
  '特別支援',
  '養護',
  '事務',
  '管理職・生指',
  '地域・調査',
];

/** 領域ごとの項目（表示の並びは id 順） */
function itemsOfDomain(domain: SupportCategory): ScreeningItem[] {
  return SCREENING_ITEMS.filter(item => item.domain === domain);
}

/**
 * その入力面が受け持つ項目を、領域ごとにまとめて返す。
 * 「学級」のように複数の領域にまたがる面があるので、領域の見出しごと返す。
 */
export function itemGroupsOfOwner(
  owner: ScreeningOwner
): { domain: SupportCategory; items: ScreeningItem[] }[] {
  return SUPPORT_CATEGORIES.map(domain => ({
    domain,
    items: SCREENING_ITEMS.filter(item => item.owner === owner && item.domain === domain),
  })).filter(group => group.items.length > 0);
}

/**
 * 全項目一覧（タブ②の「全項目一覧」）用。入力面ごとに、その面が受け持つ領域のカードを返す。
 *
 * 入力面ごとの表示（itemGroupsOfOwner）と違い、カードの中身はその領域の全項目にする。
 * 実物の一覧が、学級の「学校適応」カードに データ の①③④ も並べているのに合わせたもの
 * ——一覧は「誰が入力したか」ではなく「その領域に何点付いたか」を読む面なので、
 * 入力面をまたいで領域ごとにまとめないと合計と行が合わない。
 *
 * データは自前の領域を持たない（①〜④はすべて学校適応で、学級のカードに入る）ため、
 * セクションとしては出さない。②欠席日数は点が付かない項目なので一覧では省く。
 */
export function overviewSections(): {
  owner: ScreeningOwner;
  groups: { domain: SupportCategory; items: ScreeningItem[] }[];
}[] {
  return SCREENING_OWNERS.filter(owner => owner !== 'データ').map(owner => ({
    owner,
    groups: itemGroupsOfOwner(owner).map(({ domain }) => ({
      domain,
      items: itemsOfDomain(domain).filter(item => item.scored !== false),
    })),
  }));
}

/** 領域の素点の満点（点が付く項目数 × 2） */
function rawMaxOf(domain: SupportCategory): number {
  return itemsOfDomain(domain).filter(item => item.scored !== false).length * 2;
}

/** 表示に使う満点。実物の画面がどの領域も10点で並べているのに合わせる */
export const MAX_DOMAIN_SCORE = 10;

/** 素点を10点満点に直す。領域ごとに項目数が違うので、そのままでは比べられない */
function normalizeScore(domain: SupportCategory, raw: number): number {
  return Math.round((raw / rawMaxOf(domain)) * MAX_DOMAIN_SCORE);
}

/**
 * スクリーニングの問題タグ（表示用の要約）と、その根拠になる37項目の対応。
 *
 * Student.answers（37項目への回答）が真実源で、ProblemTag はここから導出する
 * 表示専用の値。タグは複数の項目にまたがって根拠を持つことがあり、逆に同じ項目が
 * 複数のタグの根拠になることもあるため、1項目だけでは判定できないタグ
 * （家庭でのケア負担／保護者支援が必要）は AND_TAGS に入れ、全項目が一致したときだけ
 * そのタグを立てる。それでも解けない重なり方（他のタグと同時に立った場合など）は
 * 拾いきれないことがある——ベストエフォートの要約であって、37項目の代わりにはならない。
 */
const TAG_EVIDENCE: Record<ProblemTag, { id: number; value: 1 | 2 }[]> = {
  不登校傾向: [{ id: 3, value: 2 }],
  '欠席・遅刻': [{ id: 5, value: 2 }],
  友人トラブル: [{ id: 8, value: 2 }],
  学習の遅れ: [{ id: 11, value: 2 }],
  宿題未提出: [{ id: 13, value: 2 }],
  家庭でのケア負担: [
    { id: 16, value: 2 },
    { id: 30, value: 1 },
  ],
  保護者支援が必要: [
    { id: 16, value: 2 },
    { id: 17, value: 1 },
  ],
  連絡が取れない: [{ id: 17, value: 2 }],
  発達特性: [{ id: 20, value: 2 }],
  保健室頻回: [{ id: 24, value: 2 }],
  経済的困窮: [{ id: 27, value: 2 }],
  諸費滞納: [{ id: 28, value: 2 }],
  'SC/SSW関与': [{ id: 30, value: 2 }],
  要対協ケース: [{ id: 31, value: 2 }],
  '孤立・居場所なし': [{ id: 36, value: 2 }],
  地域からの気になる情報: [{ id: 34, value: 2 }],
};

/** 項目を複数持つタグのうち、全項目が一致したときだけ立てるもの（id16 の共有対策） */
const AND_TAGS: ProblemTag[] = ['家庭でのケア負担', '保護者支援が必要'];

/** 37項目の回答から、表示用の問題タグを導出する */
export function tagsFromAnswers(answers: ScreeningAnswers): ProblemTag[] {
  return (Object.keys(TAG_EVIDENCE) as ProblemTag[]).filter(tag => {
    const evidence = TAG_EVIDENCE[tag];
    return AND_TAGS.includes(tag)
      ? evidence.every(({ id, value }) => answers[id] === value)
      : evidence.some(({ id, value }) => answers[id] === value);
  });
}

/**
 * 前学期の回答（デモ用のダミー）。
 *
 * 本プロトタイプは単一学期しか持たないが、実物の画面は前学期と比べた変化
 * （悪化・良化・変化なし）を色で出す。比較対象が無いと色が全部つかないので、
 * 今学期の回答から項目IDで機械的に散らして前学期を作る。
 * 3項目に1つが悪化、1つが良化、1つが変化なしになる。
 */
export function previousAnswers(current: ScreeningAnswers): ScreeningAnswers {
  const previous: ScreeningAnswers = {};

  for (const [key, value] of Object.entries(current)) {
    const id = Number(key);

    if (id % 3 === 0) {
      // 悪化：前学期は1段軽かった（1点だった項目は前学期は未回答）
      if (value === 2) previous[id] = 1;
    } else if (id % 3 === 1) {
      // 良化：前学期はもっと重かった
      previous[id] = 2;
    } else {
      // 変化なし
      previous[id] = value;
    }
  }

  return previous;
}

/** 今学期と前学期を比べた変化。実物の凡例の色分けに使う */
export function changeOf(current?: 1 | 2, previous?: 1 | 2): ScreeningChange {
  if (!current && !previous) return '未選択';
  if (!current) return '良化';
  if (!previous) return '悪化';
  if (current > previous) return '悪化';
  if (current < previous) return '良化';
  return '変化なし';
}

/** 回答から8領域のスコアを出す。実物と同じく、これが領域スコアの正体 */
export function scoresFromAnswers(answers: ScreeningAnswers): DomainScores {
  return SUPPORT_CATEGORIES.reduce((scores, domain) => {
    const raw = itemsOfDomain(domain).reduce((sum, item) => sum + (answers[item.id] ?? 0), 0);
    scores[domain] = normalizeScore(domain, raw);
    return scores;
  }, {} as DomainScores);
}
