import { computed, ref, toRef, watch, type Ref } from 'vue';
import { defineStore } from 'pinia';
import { useRefHistory } from '@vueuse/core';
import { Circle, Edge, Rectangle } from '@/utility/classes';
import type { ValidObjects } from '@/utility/types';
import { isOutOfBounds } from '@/utility/functions';
import type { Expand, OptionalKeys, RequiredKeys } from '@/utility/merge';

const setValue = <T extends Circle | Rectangle | Edge, K extends keyof T, V extends T[K]>(
  obj: T,
  prop: K,
  value: V,
) => {
  obj[prop] = value;
};

//type LListStoreType = {
//  circleHolder: { elems: Circle[]; maxId: number };
//  rectHolder: { elems: Rectangle[]; maxId: number };
//  edgeHolder: { elems: Edge[]; maxId: number };
//};
//type LinkedLStoreRawType = {
//  circleHolder: { elems: Circle[]; maxId: number };
//  rectHolder: { elems: Rectangle[]; maxId: number };
//  edgeHolder: { elems: (Edge & { a?: string; b?: string })[]; maxId: number };
//};

const ctors: { [key in ValidObjects]: new (...args: any[]) => any } = {
  Circle: Circle,
  Rectangle: Rectangle,
  Edge: Edge,
};

class Creator<T> {
  constructor(private ctor: new (...args: any[]) => T) {}
  create(...args: any[]) {
    return new this.ctor(args[0]);
  }
}

const prepareSetters = <T extends Circle | Rectangle | Edge>(array: Ref<T[]>, maxId: Ref<number>) => {
  const add = (elIn: Omit<T, 'id'>): T => {
    const creator = new Creator(ctors[elIn.objType]);
    array.value.push(creator.create({ ...elIn, id: maxId.value++ }));

    return array.value[array.value.length - 1];
  };

  const addMany = (elsIn: Omit<T, 'id'>[]) => elsIn.forEach(add);

  const updateByIndex = (index: number, vars: Partial<T>) => {
    if (isOutOfBounds(index, array.value)) return;

    for (const [k, v] of Object.entries(vars) as Array<[keyof T, T[keyof T]]>) {
      setValue(array.value[index], k, v);
    }
  };

  const update = (el: T, vars: Partial<T>) =>
    updateByIndex(
      array.value.findIndex((x) => x.id === el.id),
      vars,
    );

  const removeIndex = (index: number) => {
    if (!isOutOfBounds(index, array.value)) {
      array.value.splice(index, 1);
    }
  };

  const removeLast = () => array.value.pop();
  const reset = () => (array.value = []);

  return {
    add,
    addMany,
    updateByIndex,
    update,
    removeIndex,
    removeLast,
    reset,
  };
};

export const useShapesStore = defineStore('shapes', () => {
  const circles = ref<Circle[]>([]);
  const rects = ref<Rectangle[]>([]);
  const edges = ref<Edge[]>([]);

  const circleMaxId = ref<number>(0);
  const rectMaxId = ref<number>(0);
  const edgeMaxId = ref<number>(0);

  const printState = () => {
    //console.log(storeState.value);
  };

  //this.$state;
  //const init = (state) => {
  //  //this.;
  //  console.log(state);
  //};

  return {
    circleFuncs: prepareSetters(circles, circleMaxId),
    rectsFuncs: prepareSetters(rects, rectMaxId),
    edgeFuncs: prepareSetters(edges, edgeMaxId),
    printState,
    circles,
    rects,
    edges,
    circleMaxId,
    rectMaxId,
    edgeMaxId,
  };
});

//console.log(useShapesStore().$state);
