import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe } from '../data/supportStore';

/** 画面Eで積み上がった支援を購読する（useOrganizationStore と同じ作法） */
export function useSupportStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
