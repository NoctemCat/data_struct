import { computed, ref, toRef } from 'vue';
import { defineStore } from 'pinia';
import { useRefHistory } from '@vueuse/core';
import { Circle, Edge, Rectangle } from '@/utility/classes';

type ValueOf<T> = T[keyof T];
type PossibleVars<T> = {
  [key in keyof T]?: ValueOf<T>;
};
type TypeVars<T> = Omit<
  {
    [key in keyof T]: T[keyof T];
  },
  'id'
>;

//type IntersType = Circle & Rectangle & Edge;
type UnionType = Circle | Rectangle | Edge;

const setValue = <T extends UnionType, K extends keyof T, V extends T[K]>(obj: T, prop: K, value: V) => {
  obj[prop] = value;
};

const getByIndexGen = <T extends UnionType>(index: number, holder: { elems: T[]; maxId: number }) => {
  if (index >= 0 && index < holder.elems.length) {
    return holder.elems[index];
  }
};

const addGen = <T extends UnionType>(elIn: TypeVars<T>, holder: { elems: T[]; maxId: number }): T => {
  switch (elIn.objType) {
    case 'Circle':
      holder.elems.push(
        new Circle({
          ...elIn,
          id: `${elIn.objType}${holder.maxId}`,
        } as unknown as Circle) as T,
      );
      break;
    case 'Rectangle':
      holder.elems.push(
        new Rectangle({
          ...elIn,
          id: `${elIn.objType}${holder.maxId}`,
        } as unknown as Rectangle) as T,
      );
      break;
    case 'Edge':
      holder.elems.push(
        new Edge({
          ...elIn,
          id: `${elIn.objType}${holder.maxId}`,
        } as Edge) as T,
      );
      break;
  }
  holder.maxId++;
  return holder.elems[holder.elems.length - 1];
};

const addManyGen = <T extends UnionType>(elsIn: TypeVars<T>[], holder: { elems: T[]; maxId: number }) => {
  const added: typeof elsIn = [];
  elsIn.forEach((el) => {
    added.push(addGen(el, holder));
  });
  return added;
};

const updateByIndexGen = <T extends UnionType>(
  index: number,
  vars: PossibleVars<T>,
  holder: { elems: T[]; maxId: number },
) => {
  if (index < 0 || index >= holder.elems.length) {
    return;
  }
  for (const [k, v] of Object.entries(vars) as Array<[keyof T, ValueOf<T>]>) {
    setValue(holder.elems[index], k, v);
  }
};

const updateGen = <T extends UnionType>(el: T, vars: PossibleVars<T>, holder: { elems: T[]; maxId: number }) => {
  const index = holder.elems.findIndex((x) => x.id === el.id);

  if (index > -1) {
    updateByIndexGen(index, vars, holder);
  }
};

const removeIndexGen = <T extends UnionType>(index: number, holder: { elems: T[]; maxId: number }) => {
  if (index >= 0 && index < holder.elems.length) {
    holder.elems.splice(index, 1);
  }
};

const removeLastGen = <T extends UnionType>(holder: { elems: T[]; maxId: number }) => {
  if (holder.elems.length > 0) {
    holder.elems.pop();
  }
};

const resetGen = <T extends UnionType>(holder: { elems: T[]; maxId: number }) => {
  holder.elems = [];
};

type LListStoreType = {
  circleHolder: { elems: Circle[]; maxId: number };
  rectHolder: { elems: Rectangle[]; maxId: number };
  edgeHolder: { elems: Edge[]; maxId: number };
};
type LinkedLStoreRawType = {
  circleHolder: { elems: Circle[]; maxId: number };
  rectHolder: { elems: Rectangle[]; maxId: number };
  edgeHolder: { elems: (Edge & { a?: string; b?: string })[]; maxId: number };
};

export const useLListStore = defineStore('linkedlist', () => {
  //const circleHolder: { elems: Circle[]; maxId: number } = { elems: [], maxId: 0 };
  //const rectHolder: { elems: Rectangle[]; maxId: number } = { elems: [], maxId: 0 };
  //const edgeHolder: { elems: Edge[]; maxId: number } = { elems: [], maxId: 0 };

  const storeState = ref<LListStoreType>({
    circleHolder: { elems: [] as Circle[], maxId: 0 },
    rectHolder: { elems: [] as Rectangle[], maxId: 0 },
    edgeHolder: { elems: [] as Edge[], maxId: 0 },
  });

  const dumpHistory = (state: LListStoreType) => {
    const preparedEdges = state.edgeHolder.elems.map((el) => {
      return { ...el, a: el.a?.id, b: el.b?.id };
    });
    return JSON.stringify({ ...state, edgeHolder: { elems: preparedEdges, maxId: state.edgeHolder.maxId } });
  };

  const parseHistory = (raw: string) => {
    const rawParsed = JSON.parse(raw) as LinkedLStoreRawType;

    const mappedCircles = new Map<string, Circle>();
    rawParsed.circleHolder.elems.forEach((el) => mappedCircles.set(el.id, el));

    const mappedRects = new Map<string, Rectangle>();
    rawParsed.rectHolder.elems.forEach((el) => mappedRects.set(el.id, el));

    const parsedEdges = rawParsed.edgeHolder.elems.map((el) => {
      const connectedElA = mappedCircles.get(el.a ?? '') ?? mappedRects.get(el.a ?? '');
      const connectedElB = mappedCircles.get(el.b ?? '') ?? mappedRects.get(el.b ?? '');

      return { ...el, a: connectedElA, b: connectedElB };
    });

    console.log('parse history', {
      ...rawParsed,
      edgeHolder: { elems: parsedEdges, maxId: rawParsed.edgeHolder.maxId },
    });
    return { ...rawParsed, edgeHolder: { elems: parsedEdges, maxId: rawParsed.edgeHolder.maxId } };
  };

  const { history, commit, undo, redo } = useRefHistory(storeState, {
    flush: 'post',
    deep: true,
    dump: dumpHistory,
    parse: parseHistory,
  });

  const circleFuncs = {
    getByIndex: (index: number) => getByIndexGen(index, storeState.value.circleHolder),
    add: (circleIn: TypeVars<Circle>) => addGen(circleIn, storeState.value.circleHolder),
    addMany: (circlesIn: TypeVars<Circle>[]) => addManyGen(circlesIn, storeState.value.circleHolder),
    update: (el: Circle, vars: PossibleVars<Circle>) => updateGen(el, vars, storeState.value.circleHolder),
    updateByIndex: (index: number, vars: PossibleVars<Circle>) =>
      updateByIndexGen(index, vars, storeState.value.circleHolder),
    removeIndex: (index: number) => removeIndexGen(index, storeState.value.circleHolder),
    removeLast: () => removeLastGen(storeState.value.circleHolder),
    reset: () => resetGen(storeState.value.circleHolder),
  };

  const rectsFuncs = {
    getByIndex: (index: number) => getByIndexGen(index, storeState.value.rectHolder),
    add: (circleIn: TypeVars<Rectangle>) => addGen(circleIn, storeState.value.rectHolder),
    addMany: (circlesIn: TypeVars<Rectangle>[]) => addManyGen(circlesIn, storeState.value.rectHolder),
    update: (el: Rectangle, vars: PossibleVars<Rectangle>) => updateGen(el, vars, storeState.value.rectHolder),
    updateByIndex: (index: number, vars: PossibleVars<Rectangle>) =>
      updateByIndexGen(index, vars, storeState.value.rectHolder),
    removeIndex: (index: number) => removeIndexGen(index, storeState.value.rectHolder),
    removeLast: () => removeLastGen(storeState.value.rectHolder),
    reset: () => resetGen(storeState.value.rectHolder),
  };

  const edgeFuncs = {
    getByIndex: (index: number) => getByIndexGen(index, storeState.value.edgeHolder),
    add: (circleIn: TypeVars<Edge>) => addGen(circleIn, storeState.value.edgeHolder),
    addMany: (circlesIn: TypeVars<Edge>[]) => addManyGen(circlesIn, storeState.value.edgeHolder),
    update: (el: Edge, vars: PossibleVars<Edge>) => updateGen(el, vars, storeState.value.edgeHolder),
    updateByIndex: (index: number, vars: PossibleVars<Edge>) =>
      updateByIndexGen(index, vars, storeState.value.edgeHolder),
    removeIndex: (index: number) => removeIndexGen(index, storeState.value.edgeHolder),
    removeLast: () => removeLastGen(storeState.value.edgeHolder),
    reset: () => resetGen(storeState.value.edgeHolder),
  };

  const t = toRef(storeState, 'value');
  //const { circleHolder, edgeHolder, rectHolder } = t(storeState);

  const printState = () => {
    console.log(storeState.value);
  };
  const circles = computed(() => {
    return storeState.value.circleHolder.elems;
  });
  const rects = computed(() => {
    return storeState.value.rectHolder.elems;
  });
  const edges = computed(() => {
    return storeState.value.edgeHolder.elems;
  });

  return {
    circleFuncs,
    rectsFuncs,
    edgeFuncs,
    history,
    state: storeState,
    undo,
    redo,
    printState,
    circles,
    rects,
    edges,
  };
});
