import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { Circle, Edge } from '@/utility/classes';

export const useTimelineStore = defineStore('timeline', () => {
  const circles = ref<Circle[]>([]);

  let maxCircleId = 0;

  const addCircle = (circleIn: Omit<Circle, 'id'>) => {
    maxCircleId++;
    circles.value.push({ ...circleIn, id: `circle${maxCircleId}` });
  };
  const addCircles = (circlesIn: Omit<Circle, 'id'>[]) => {
    circlesIn.forEach((el) => {
      maxCircleId++;
      circles.value.push({ ...el, id: `circle${maxCircleId}` });
    });
  };
  const removeCircle = (index: number) => {
    if (index >= 0 && index < circles.value.length) {
      circles.value.splice(index, 1);
    }
  };

  return { circles, addCircle, addCircles, removeCircle };
});
