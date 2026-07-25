import { useState } from 'react';
import { MapPin, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Sparkles, Phone, Mail, Globe } from 'lucide-react';
import { getSuggestions, mockRecords } from '../data/mockData';
import { getAllSupports } from '../data/organizations';
import type { ProblemTag } from '../types';

const allSupports = getAllSupports();

// デモ用の児童データ
const demoStudents = [
  {
    id: 'S-001',
    grade: '5年1組',
    number: 12,
    score: 9,
    problems: ['経済的困窮', '孤立・居場所なし'] as ProblemTag[],
    notes: '遅刻多い・身だしなみが気になる・給食をたくさん食べる',
    currentSupport: 'A（担任の声かけ）',
  },
  {
    id: 'S-002',
    grade: '3年2組',
    number: 8,
    score: 7,
    problems: ['学習の遅れ', '保護者支援が必要'] as ProblemTag[],
    notes: '宿題未提出が続く・保護者と連絡が取りにくい',
    currentSupport: 'A（学年主任の面談）',
  },
  {
    id: 'S-003',
    grade: '6年1組',
    number: 23,
    score: 11,
    problems: ['不登校傾向', '家庭でのケア負担', '孤立・居場所なし'] as ProblemTag[],
    notes: '欠席増加・弟の世話で疲れている様子・保健室利用増',
    currentSupport: 'A+B（SC相談開始）',
  },
];

export default function MeetingPage() {
  const [selectedStudent, setSelectedStudent] = useState(demoStudents[0]);
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  const suggestions = getSuggestions(
    selectedStudent.problems,
    allSupports,
    mockRecords,
    '○○小学校'
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-600">学校向け</span>
        </div>
        <h1 className="text-xl font-bold text-yoss-dark">校内チーム会議 — 支援候補表示</h1>
        <p className="text-sm text-gray-500 mt-1">
          スクリーニング結果と支援団体の登録データから、この児童に合った支援候補を自動表示します。
          <strong className="text-yoss-dark">先生の追加入力は一切ありません。</strong>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left: Student list */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-500">検討対象児童</h3>
              <p className="text-[10px] text-gray-400">スクリーニング会議で挙がった児童</p>
            </div>
            {demoStudents.map(student => (
              <button
                key={student.id}
                onClick={() => { setSelectedStudent(student); setExpandedResource(null); }}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                  selectedStudent.id === student.id
                    ? 'bg-yoss-yellow-light border-l-2 border-l-yoss-yellow'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-yoss-dark">{student.grade} {student.number}番</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    student.score >= 10 ? 'bg-red-50 text-red-500' :
                    student.score >= 6 ? 'bg-yellow-50 text-yellow-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {student.score}pt
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {student.problems.map(p => (
                    <span key={p} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Support suggestions */}
        <div className="col-span-2 space-y-4">
          {/* Student summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-yoss-dark">
                  {selectedStudent.grade} {selectedStudent.number}番
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedStudent.notes}</p>
              </div>
              <div className={`text-lg font-bold px-3 py-1 rounded-lg ${
                selectedStudent.score >= 10 ? 'bg-red-50 text-red-500' :
                selectedStudent.score >= 6 ? 'bg-yellow-50 text-yellow-600' :
                'bg-gray-50 text-gray-500'
              }`}>
                合計 {selectedStudent.score}pt
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedStudent.problems.map(p => (
                <span key={p} className="text-[10px] bg-yoss-yellow-light text-yoss-yellow-dark font-bold px-2 py-1 rounded-md">
                  {p}
                </span>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-gray-400">
              現在の支援方針：{selectedStudent.currentSupport}
            </div>
          </div>

          {/* Support suggestions header */}
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-yoss-yellow" />
            <h3 className="text-sm font-bold text-yoss-dark">
              この児童の状態に対して、○○市で利用可能な支援
            </h3>
          </div>

          {/* Suggestion cards */}
          {suggestions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-400">この状態に対応する登録済み支援がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map(suggestion => (
                <div
                  key={suggestion.supportId}
                  className={`bg-white rounded-xl border transition-all ${
                    suggestion.isNew
                      ? 'border-dashed border-blue-200'
                      : 'border-gray-200 hover:border-yoss-yellow/50'
                  }`}
                >
                  <button
                    onClick={() => setExpandedResource(
                      expandedResource === suggestion.supportId ? null : suggestion.supportId
                    )}
                    className="w-full text-left px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          suggestion.isNew
                            ? 'bg-blue-50 text-blue-500'
                            : 'bg-yoss-yellow-light text-yoss-yellow-dark'
                        }`}>
                          {suggestion.category.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-yoss-dark">{suggestion.supportName}</span>
                            {suggestion.isNew && (
                              <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-bold">
                                新設・実績なし
                              </span>
                            )}
                          </div>
                          {/* 実施団体 */}
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {suggestion.organizationName}
                            <span className="text-gray-400 ml-1.5">{suggestion.organizationType}</span>
                          </p>
                          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                            <span className="flex items-center gap-0.5">
                              <MapPin size={10} />
                              市内 {suggestion.cityWideCount}件
                            </span>
                            <span>
                              御校 {suggestion.schoolCount}件
                            </span>
                            {suggestion.continuationRate !== null && (
                              <span className="flex items-center gap-0.5">
                                <TrendingUp size={10} />
                                継続率 {suggestion.continuationRate}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {expandedResource === suggestion.supportId
                        ? <ChevronUp size={16} className="text-gray-400" />
                        : <ChevronDown size={16} className="text-gray-400" />
                      }
                    </div>
                  </button>

                  {/* Expanded details */}
                  {expandedResource === suggestion.supportId && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 ml-11">
                      <p className="text-xs text-gray-500 mb-2">{suggestion.details}</p>

                      {/* Stats comparison */}
                      {!suggestion.isNew && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-[10px] text-gray-400">市内利用</p>
                              <p className="text-lg font-bold text-yoss-dark">{suggestion.cityWideCount}<span className="text-xs text-gray-400">件</span></p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">御校</p>
                              <p className="text-lg font-bold text-yoss-dark">{suggestion.schoolCount}<span className="text-xs text-gray-400">件</span></p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">継続率</p>
                              <p className="text-lg font-bold text-yoss-green">{suggestion.continuationRate}%</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {suggestion.isNew && (
                        <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3 mb-3">
                          <AlertCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-blue-700">
                            この支援は{suggestion.organizationName}が「対応可能」として新しく登録したものです。まだ利用実績はありませんが、対応可能な状態です。
                          </p>
                        </div>
                      )}

                      {/* 連絡先 */}
                      <div className="border-t border-gray-50 pt-3">
                        <p className="text-[10px] font-bold text-gray-400 mb-1.5">
                          {suggestion.organizationName} の連絡先
                        </p>
                        <div className="flex flex-wrap gap-3 text-[10px] text-gray-600">
                          {suggestion.contact.tel && (
                            <span className="flex items-center gap-1"><Phone size={11} />{suggestion.contact.tel}</span>
                          )}
                          {suggestion.contact.email && (
                            <span className="flex items-center gap-1"><Mail size={11} />{suggestion.contact.email}</span>
                          )}
                          {suggestion.contact.web && (
                            <span className="flex items-center gap-1"><Globe size={11} />{suggestion.contact.web}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-3">
            <p className="text-[10px] text-green-700 leading-relaxed">
              <strong>この画面は自動生成されています。</strong>
              地域の支援団体が登録した支援情報と、学校の支援記録から、この児童のスクリーニング結果に合った支援候補を表示しています。先生の追加入力は一切ありません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
