<script setup lang="ts">
import IconBack from '@/components/icons/IconBack.vue';
import { useShapesStore } from '@/stores/shapes';
import { injectStrict } from '@/utility/functions';
import { ScreenInfoKey } from '@/utility/symbols';
import type { Point, ValidObjects } from '@/utility/types';
import { onMounted, ref, toRefs } from 'vue';
import { useMouseScrollable } from '../useMouseScrollable';
import { useShapesHistory } from '@/stores/shapesHistory';
import { storeToRefs } from 'pinia';

const { mouseDownHandler } = useMouseScrollable();

const { circles, rects, edges } = storeToRefs(useShapesStore());
const { circleFuncs, rectsFuncs, edgeFuncs } = useShapesStore();
const { commit, history, reset, undo, last, clear } = useShapesHistory();

const { rem } = toRefs(injectStrict(ScreenInfoKey));
const container = ref<HTMLDivElement | null>(null);
const closeRef = ref<HTMLSpanElement | null>(null);

const randomFixedSize = ref(1);
const userDefined = ref('');

const open = (ev: Event, className: string) => {
  const parent = (ev.currentTarget as HTMLElement).parentElement;
  const children = Array.from(container.value?.children ?? []) as HTMLElement[];
  const childrenOpen = Array.from(container.value?.querySelectorAll(className) ?? []) as HTMLElement[];

  children.forEach((el) => {
    if (el !== parent) {
      el.style.maxWidth = '0';
      el.ariaHidden = 'true';
    }
  });

  childrenOpen.forEach((el) => {
    el.style.maxWidth = el.scrollWidth + 'px';
  });

  closeRef.value?.setAttribute('style', 'max-width:' + (closeRef.value?.scrollWidth ?? 0) + 'px');
  closeRef.value?.setAttribute('aria-hidden', 'false');
};

const close = () => {
  const children = Array.from(container.value?.children ?? []) as HTMLElement[];
  children.forEach((el) => {
    if (el.classList.length === 0) {
      el.style.maxWidth = el.scrollWidth + 'px';
      el.ariaHidden = 'false';
    } else {
      el.style.maxWidth = '0';
      el.ariaHidden = 'true';
    }
  });
};

const randomNumber = (min = 1, max = 100) => min + Math.floor(Math.random() * (max - min));
const generateStringArray = (min = 4, max = 8) =>
  [...Array(randomNumber(min, max)).keys()].map((_) => randomNumber().toString()).join(', ');

onMounted(() => {
  close();

  randomFixedSize.value = 4 + Math.floor(Math.random() * 12);
  userDefined.value = generateStringArray();
});

const addEdge = (a: Point, b: Point) => {
  const edge = {
    objType: 'Edge' as ValidObjects,
    a: a,
    b: b,
  };

  edgeFuncs.add(edge);
};

const addCircle = (x: number, y: number, text: string, caption: string) => {
  const circle = {
    objType: 'Circle' as ValidObjects,
    x: x,
    y: y,
    text: text,
    caption: caption,
    radius: rem.value,
  };

  const newCircle = circleFuncs.add(circle);
  return newCircle;
};

const createArray = (newSize: number, numbers: string[]) => {
  let xPos = 64;

  for (let i = 0; i < newSize; i++) {
    addCircle(xPos * (i + 1), 100, numbers[i], '');
  }

  circleFuncs.updateByIndex(0, { caption: 'head' });
  circleFuncs.updateByIndex(circles.value.length - 1, { caption: 'tail' });

  for (let i = 1; i < circles.value.length; i++) {
    addEdge(circles.value[i - 1], circles.value[i]);
  }
  commit();
  clear();
};

const setEmpty = async () => {
  reset();
};

const createRandom = async () => {
  await setEmpty();
  const newSize = 4 + Math.floor(Math.random() * 12);
  const numbers = [...Array(newSize).keys()].map((_) => randomNumber().toString());

  createArray(newSize, numbers);
  console.log(history.value);
};

const createRandomSorted = async () => {
  await setEmpty();
  const newSize = 4 + Math.floor(Math.random() * 12);
  const numbers = [...Array(newSize).keys()]
    .map((_) => randomNumber())
    .sort((a, b) => a - b)
    .map((el) => el.toString());

  createArray(newSize, numbers);
};

const createRandomFixed = async () => {
  await setEmpty();
  let newSize = Math.floor(randomFixedSize.value);
  newSize = newSize < 1 ? 1 : newSize;
  newSize = newSize > 16 ? 16 : newSize;

  const numbers = [...Array(newSize).keys()].map((_) => randomNumber().toString());

  createArray(newSize, numbers);
  randomFixedSize.value = 4 + Math.floor(Math.random() * 12);
  commit();
};

const createUserDefined = async () => {
  await setEmpty();
  const numbers = userDefined.value
    .split(',')
    .map((el) => el.trim())
    .map((el) => parseInt(el))
    .filter((el) => !!el)
    .map((el) => el.toString());

  createArray(numbers.length, numbers);
  userDefined.value = generateStringArray();
};
</script>

<template>
  <div
    ref="container"
    class="create-container"
    @mousedown="mouseDownHandler"
  >
    <span>
      <button @click="setEmpty">Empty</button>
    </span>
    <span>
      <button @click="createRandom">Random</button>
    </span>
    <span>
      <button @click="createRandomSorted">Random Sorted</button>
    </span>
    <span>
      <button @click="(ev) => open(ev, '.js-fixed-size')">Random Fixed Size</button>
    </span>
    <span class="js-fixed-size">
      <input
        v-model="randomFixedSize"
        type="number"
        min="1"
        max="16"
      />
    </span>
    <span class="js-fixed-size">
      <button @click="createRandomFixed">Go</button>
    </span>
    <span>
      <button @click="(ev) => open(ev, '.js-user-defined')">User Defined List</button>
    </span>
    <span class="js-user-defined">
      <input
        v-model="userDefined"
        type="text"
      />
    </span>
    <span class="js-user-defined">
      <button @click="createUserDefined">Go</button>
    </span>
    <span
      ref="closeRef"
      class="js-close"
    >
      <button
        class="button-close"
        @click="close"
      >
        <span><IconBack /></span>
      </button>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.create-container {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  height: 3rem;

  > span {
    max-width: 0;
    overflow: hidden;
    padding: 0;
    transition: max-width 0.25s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  button {
    display: block;
    height: 100%;
    background: transparent;
    font-family: inherit;
    border: 0;
    margin: 0;
    padding: 0 2rem;
    color: var(--text-color);
    font-size: 1.125rem;
    transition: background-color 0.25s, color 0.25s;

    &:focus,
    &:hover {
      background: var(--hover-color);
    }
  }

  input {
    padding-left: 0.25rem;
    height: 100%;
    background: #7c7c7c0f;
  }

  .button-close {
    flex-shrink: 0;
    box-sizing: content-box;
    border: 0;
    padding: 0;
    background: transparent;
    width: 3rem;
    height: 3rem;

    border-right: 2px solid var(--app-border-color);
    transition: color var(--theme-switch-time), background-color var(--theme-switch-time),
      border var(--theme-switch-time);

    &:focus,
    &:hover {
      background: var(--hover-color);
    }

    span {
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
    }

    :deep(svg) {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      padding: 0.75rem;

      circle,
      path {
        transition: stroke 0.25s;

        stroke: var(--text-color);
        stroke-width: 1;
      }
    }
  }
}
</style>
