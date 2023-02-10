//import { useRefHistory } from "@vueuse/core";
import type { Store } from 'pinia';
import { useShapesStore } from '@/stores/shapes';
import type { UseManualRefHistoryReturn } from '@vueuse/core';
import type { Circle, Edge, Rectangle } from '@/utility/classes';
import { useStoreManualHistory } from './useManualStoreHistory';
import type { Raw } from 'vue';

const storetemp = useShapesStore();

let storeHistory: ReturnType<typeof useStoreManualHistory>;
export const useShapesHistory = () => {
  if (storeHistory) {
    return { ...storeHistory };
  }

  const store = useShapesStore();

  const stringifyShapesStore = (state: typeof store.$state): string => {
    return JSON.stringify(state, (_, value) => {
      if (value?.objType == 'Edge') {
        return { ...value, a: value.a?.id, b: value.b?.id };
      }
      return value;
    });
  };

  const parseShapesStore = (raw: string): typeof store.$state => {
    const parsed = JSON.parse(raw);

    const mappedElems = new Map<string, Circle | Rectangle>();
    parsed.circles.forEach((el: Circle) => mappedElems.set(el.id, el));
    parsed.rects.forEach((el: Rectangle) => mappedElems.set(el.id, el));

    parsed.edges = parsed.edges.map((el: Omit<Edge, 'a' | 'b'> & { a: string; b: string }) => {
      return {
        ...el,
        a: mappedElems.get(el.a ?? ''),
        b: mappedElems.get(el.b ?? ''),
      };
    });
    return parsed;
  };

  storeHistory = useStoreManualHistory(store, {
    dump: stringifyShapesStore,
    parse: parseShapesStore,
  }) as typeof storeHistory;
  return { ...storeHistory };
};
