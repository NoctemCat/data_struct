import type { Circle, Rectangle, Edge } from '@/utility/classes';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useShapesStore } from './shapes';
import { useShapesHistory } from './shapesHistory';

export const useTimelineStore = defineStore('timeline', () => {
  const currentHistory = ref<number>(0);

  const shapes = useShapesStore();
  const { commit, history, reset, undo, redo, clear, parseHistory } = useShapesHistory();

  const parsedHistory = computed(
    () => parseHistory(history.value[currentHistory.value].snapshot as unknown as string) as typeof shapes.$state,
  );
  const circles = computed(() => parsedHistory.value.circles);
  const rects = computed(() => parsedHistory.value.rects);
  const edges = computed(() => parsedHistory.value.edges);
  watch(
    () => history.value,
    (_) => {
      currentHistory.value = history.value.length - 1;
    },
  );
  watch(
    () => currentHistory.value,
    (_) => {
      if (currentHistory.value < 0) {
        currentHistory.value = 0;
      } else if (currentHistory.value >= history.value.length) {
        currentHistory.value = history.value.length - 1;
      }
    },
  );
  return { currentHistory, circles, rects, edges };
});
