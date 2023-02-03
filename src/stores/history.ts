import { once } from '@/utility/functions';
//import { useRefHistory } from "@vueuse/core";
import { getActivePinia, storeToRefs, type StateTree, type Store } from 'pinia';
import { toRaw, unref, watch, type Ref } from 'vue';
import { useShapesStore } from '@/stores/linkedlist';
import { useManualRefHistory, useRefHistory } from '@vueuse/core';
import type { Circle, Edge, Rectangle } from '@/utility/classes';
import { useStoreHistory } from './useStoreHistory';

//let init = false;
export const usePiniaHistory = () => {
  const pinia = getActivePinia();
  if (!pinia) throw new Error('To use pinia history store must exist');

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

  const storeHistory = useStoreHistory(store, { dump: stringifyShapesStore, parse: parseShapesStore });

  return { ...storeHistory };
};
