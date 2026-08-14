import { ArrowRight, Building2, BarChart3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopPage() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: Building2,
      badge: '支援団体向け',
      badgeColor: 'bg-blue-50 text-blue-600',
      title: '軸①：支援の登録',
      description: '子ども食堂・NPO・社協などの支援団体が、対応可能な支援を簡単に登録。年1回・5分のチェック入力で、地域の支援リソースがYOSSに反映されます。',
      to: '/register',
      color: 'border-blue-200 hover:border-blue-400',
    },
    {
      icon: BarChart3,
      badge: '共通画面',
      badgeColor: 'bg-purple-50 text-purple-600',
      title: '支援団体ディレクトリ',
      description: '地域の支援団体が「何ができるか」をカードで一覧表示。学校からの実際のレビュー付き。対応領域や団体の種別で絞り込めます。',
      to: '/dashboard',
      color: 'border-purple-200 hover:border-purple-400',
    },
    {
      icon: Users,
      badge: '学校向け',
      badgeColor: 'bg-green-50 text-green-600',
      title: '支援候補の表示',
      description: '校内チーム会議で、この子の状態に合った支援候補が自動表示。先生の入力は一切増えません。',
      to: '/meeting',
      color: 'border-green-200 hover:border-green-400',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-yoss-yellow rounded-full" />
          <h1 className="text-2xl font-bold text-yoss-dark">
            地域資源機能の再設計
          </h1>
        </div>
        <p className="text-lg text-gray-500 ml-3">
          「マップ」から「支援団体連携」へ
        </p>
      </div>

      {/* Core message */}
      <div className="bg-yoss-yellow-light border border-yoss-yellow/30 rounded-xl p-6 mb-8">
        <p className="text-yoss-dark leading-relaxed">
          YOSSの支援分類 <strong>B（地域資源の活用）</strong>だけが、システムの外に抜け落ちています。
          <br />
          原因はUIではなく、<strong>地域の支援団体がシステムの外側にいる</strong>こと。
          <br /><br />
          本プロトタイプは、地域の支援団体を「外部」ではなく
          <strong>「一緒にやるプレイヤー」</strong>
          としてYOSSに取り込み、学校の負担を一切増やさずに支援サイクルを完結させる提案です。
        </p>
      </div>

      {/* Proof：画面Dの「支援の現状」B項目は、分類名だけでなく実際の件数を表示する */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-sm font-bold text-gray-400 mb-3">校内チーム会議での見え方</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          B の各項目は、対応する支援団体の登録件数がそのまま数字で出ます。
          団体が登録すれば件数が増え、登録が無い項目は「登録された支援がありません」と正直に出ます。
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-sm text-yoss-dark">③ 居場所、こども食堂の活用</p>
            <p className="text-xs font-bold text-yoss-yellow-dark mt-1">該当する登録済み支援 4件</p>
          </div>
          <div className="border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-sm text-yoss-dark">① 家庭教育支援の活用</p>
            <p className="text-xs font-bold text-yoss-yellow-dark mt-1">該当する登録済み支援 3件</p>
          </div>
        </div>
      </div>

      {/* 3 screens */}
      <div className="grid gap-4">
        {cards.map(card => (
          <button
            key={card.to}
            onClick={() => navigate(card.to)}
            className={`bg-white rounded-xl border-2 ${card.color} p-5 text-left transition-all hover:shadow-md group`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                <card.icon size={20} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-yoss-dark mb-1">{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors mt-3 shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Architecture diagram */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-400 mb-4">データの流れ</h3>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="text-center">
            <div className="w-28 h-16 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center font-bold text-blue-700">
              支援団体
            </div>
            <p className="text-[10px] text-gray-400 mt-1">支援を登録</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight size={20} className="text-yoss-yellow" />
            <ArrowRight size={20} className="text-yoss-yellow rotate-180" />
          </div>
          <div className="text-center">
            <div className="w-28 h-16 bg-yoss-yellow-light border-2 border-yoss-yellow rounded-lg flex items-center justify-center font-bold text-yoss-yellow-dark">
              YOSS
            </div>
            <p className="text-[10px] text-gray-400 mt-1">データを統合</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight size={20} className="text-yoss-yellow" />
            <ArrowRight size={20} className="text-yoss-yellow rotate-180" />
          </div>
          <div className="text-center">
            <div className="w-28 h-16 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center font-bold text-green-700">
              学校
            </div>
            <p className="text-[10px] text-gray-400 mt-1">支援候補を活用</p>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-3">
          学校の入力は増えない — 支援団体が登録したデータが、校内チーム会議画面に自動表示される
        </p>
      </div>
    </div>
  );
}
