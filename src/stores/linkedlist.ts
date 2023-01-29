import { ref, type Ref } from 'vue';
import { defineStore } from 'pinia';
import { Circle, Edge, Rectangle, type CircleVars, type EdgeVars, type RectangleVars } from '@/utility/classes';
import type { ValidObjects } from '@/utility/types';

type ValueOf<T> = T[keyof T];

type VarsCircleType = {
  [key in keyof Circle]?: ValueOf<Circle>;
};
type VarsRectangleType = {
  [key in keyof Rectangle]?: ValueOf<Rectangle>;
};
type VarsEdgeType = {
  [key in keyof Edge]?: ValueOf<Edge>;
};

type VarsCombType = {
  [key in keyof (Circle & Edge & Rectangle)]?: ValueOf<Circle & Edge & Rectangle>;
};

// I can't get string literal type support for intersecting of several classes
// Cirle[keyof Cirle] returns string instead of type
// but Cirle['objType'] gives me type ValidObjects
// So I will write them myself
//type VarsIntersType = {
//  [key in keyof (Circle | Edge | Rectangle)]: ValueOf<Circle | Edge | Rectangle>;
//};
type VarsIntersType = {
  objType: ValidObjects;
};

type CombType = Circle & Rectangle & Edge;
type IntersType = Circle | Rectangle | Edge;

type IntersArray = Ref<Array<Circle>> | Ref<Array<Rectangle>> | Ref<Array<Edge>>;

const setValueCircle = <K extends keyof Circle, V extends Circle[K]>(obj: Circle, prop: K, value: V) => {
  obj[prop] = value;
};
const setValueRectangle = <K extends keyof Rectangle, V extends Rectangle[K]>(obj: Rectangle, prop: K, value: V) => {
  obj[prop] = value;
};
const setValueEdge = <K extends keyof Edge, V extends Edge[K]>(obj: Edge, prop: K, value: V) => {
  obj[prop] = value;
};

const setValue = <K extends keyof CombType, V extends CombType[K]>(obj: IntersType, prop: K, value: V) => {
  switch (obj.objType) {
    case 'Circle':
      setValueCircle(obj as Circle, prop as keyof Circle, value as Circle[keyof Circle]);
      break;
    case 'Rectangle':
      setValueRectangle(obj as Rectangle, prop as keyof Rectangle, value as Rectangle[keyof Rectangle]);
      break;
    case 'Edge':
      setValueEdge(obj as Edge, prop as keyof Edge, value as Edge[keyof Edge]);
      break;
  }
};

const getByIndexGen = (index: number, holder: IntersArray) => {
  if (index >= 0 && index < holder.value.length) {
    return holder.value[index];
  }
};
const addGen = (elIn: VarsIntersType, holder: IntersArray) => {
  switch (elIn.objType) {
    case 'Circle':
      (holder as Ref<Array<Circle>>).value.push(new Circle(elIn as unknown as CircleVars));
      break;
    case 'Rectangle':
      (holder as Ref<Array<Rectangle>>).value.push(new Rectangle(elIn as unknown as RectangleVars));
      break;
    case 'Edge':
      (holder as Ref<Array<Edge>>).value.push(new Edge(elIn as unknown as EdgeVars));
      break;
  }
  return holder.value[holder.value.length - 1];
};
const addManyGen = (elsIn: VarsIntersType[], holder: IntersArray) => {
  const added: typeof elsIn = [];
  elsIn.forEach((el) => {
    added.push(addGen(el, holder));
  });
  return added;
};
const updateByIndexGen = (index: number, vars: VarsCombType, holder: IntersArray) => {
  if (index < 0 || index >= holder.value.length) {
    return;
  }

  Array.from(Object.keys(vars)).forEach((key) => {
    setValue(holder.value[index], key as keyof CombType, vars[key as keyof VarsCombType]!);
  });
};

const updateGen = (el: IntersType, vars: VarsCombType, holder: IntersArray) => {
  const index = holder.value.findIndex((x) => x.id === el.id);

  if (index > -1) {
    updateByIndexGen(index, vars, holder);
  }
};

const removeIndexGen = (index: number, holder: IntersArray) => {
  if (index >= 0 && index < holder.value.length) {
    holder.value.splice(index, 1);
  }
};
const removeLastGen = (holder: IntersArray) => {
  if (holder.value.length > 0) {
    holder.value.pop();
  }
};

export const useLListCircleStore = defineStore('linkedlist.circles', () => {
  const circles = ref<Circle[]>([]);

  const getByIndex = (index: number) => getByIndexGen(index, circles) as Circle | undefined;

  const add = (circleIn: CircleVars) => addGen(circleIn, circles) as Circle;
  const addMany = (circlesIn: CircleVars[]) => addManyGen(circlesIn, circles) as Circle[];

  const update = (el: Circle, vars: VarsCircleType) => updateGen(el, vars, circles);
  const updateByIndex = (index: number, vars: VarsCircleType) => updateByIndexGen(index, vars, circles);

  const removeIndex = (index: number) => removeIndexGen(index, circles);
  const removeLast = () => removeLastGen(circles);
  const reset = () => (circles.value = []);

  return {
    circles,
    circleFuncs: {
      getByIndex,
      add,
      addMany,
      update,
      updateByIndex,
      removeIndex,
      removeLast,
      reset,
    },
  };
});

export const useLListEdgesStore = defineStore('linkedlist.edges', () => {
  const edges = ref<Edge[]>([]);

  const getByIndex = (index: number) => getByIndexGen(index, edges) as Edge | undefined;

  const add = (edgeIn: EdgeVars) => addGen(edgeIn, edges) as Edge;
  const addMany = (edgeIn: EdgeVars[]) => addManyGen(edgeIn, edges) as Edge[];

  const update = (el: Edge, vars: VarsEdgeType) => updateGen(el, vars, edges);
  const updateByIndex = (index: number, vars: VarsEdgeType) => updateByIndexGen(index, vars, edges);

  const removeIndex = (index: number) => removeIndexGen(index, edges);
  const removeLast = () => removeLastGen(edges);
  const reset = () => (edges.value = []);

  return {
    edges,
    edgeFuncs: {
      getByIndex,
      add,
      addMany,
      update,
      updateByIndex,
      removeIndex,
      removeLast,
      reset,
    },
  };
});

export const useLListRectsStore = defineStore('linkedlist.rects', () => {
  const rects = ref<Rectangle[]>([]);

  const getByIndex = (index: number) => getByIndexGen(index, rects) as Rectangle | undefined;

  const add = (rectIn: RectangleVars) => addGen(rectIn, rects) as Rectangle;
  const addMany = (rectIn: RectangleVars[]) => addManyGen(rectIn, rects) as Rectangle[];

  const update = (el: Rectangle, vars: VarsRectangleType) => updateGen(el, vars, rects);
  const updateByIndex = (index: number, vars: VarsRectangleType) => updateByIndexGen(index, vars, rects);

  const removeIndex = (index: number) => removeIndexGen(index, rects);
  const removeLast = () => removeLastGen(rects);
  const reset = () => (rects.value = []);

  return {
    rects,
    rectsFuncs: {
      getByIndex,
      add,
      addMany,
      update,
      updateByIndex,
      removeIndex,
      removeLast,
      reset,
    },
  };
});
