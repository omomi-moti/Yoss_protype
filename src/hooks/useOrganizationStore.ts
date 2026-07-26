import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribe, type StoreState } from '../data/organizationStore';

/** 団体データのストアを購読する。公開すると全画面に即座に反映される。 */
export function useOrganizationStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot);
}
