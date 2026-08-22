import type { ScreeningChange } from '../types';

/**
 * 前学期と比べた変化の色。実物の凡例（悪化＝橙／良化＝青／変化なし＝灰）。
 *
 * 入力面ごとの表示（ScreeningItemPanel）と全項目一覧（ScreeningOverviewPanel）で
 * 共有する。同じ点数が画面によって別の色になっていると、色から変化を読めなくなる。
 */
export const CHANGE_STYLES: Record<ScreeningChange, string> = {
  悪化: 'bg-orange-500 text-white border-orange-500',
  良化: 'bg-blue-600 text-white border-blue-600',
  変化なし: 'bg-gray-500 text-white border-gray-500',
  未選択: 'bg-white text-gray-300 border-gray-200',
};

export const CHANGE_LEGEND: ScreeningChange[] = ['悪化', '良化', '変化なし', '未選択'];
