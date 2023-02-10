<script setup lang="ts">
import IconBack from '@/components/icons/IconBack.vue';
import { useShapesStore } from '@/stores/shapes';
import { delay, injectStrict } from '@/utility/functions';
import { ScreenInfoKey } from '@/utility/symbols';
import type { Point, ValidObjects } from '@/utility/types';
import { onMounted, ref, toRefs } from 'vue';
import { useMouseScrollable } from '../useMouseScrollable';
import { useShapesHistory } from '@/stores/shapesHistory';
import { storeToRefs } from 'pinia';
import type { Circle } from '@/utility/classes';
import { useTimelineStore } from '@/stores/timeline';

const { mouseDownHandler } = useMouseScrollable();

const { circles, rects, edges } = storeToRefs(useShapesStore());
const state = useTimelineStore();

const { circleFuncs, rectsFuncs, edgeFuncs } = useShapesStore();
const { commit, history, reset, undo, redo, clear, toFirstHistory } = useShapesHistory();

const { rem } = toRefs(injectStrict(ScreenInfoKey));
const container = ref<HTMLDivElement | null>(null);
const closeRef = ref<HTMLSpanElement | null>(null);

const searchValue = ref(1);

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

onMounted(() => {
  close();
});

const findEdge = (a: Circle, b: Circle) => {
  return edges.value.findIndex((el) => {
    return (el.a?.id === a.id && el.b?.id === b.id) || (el.a?.id === b.id && el.b?.id === a.id);
  });
};

const setActive = (index: number) => {
  circleFuncs.updateByIndex(index, {
    fillColor: 'var(--active-color)',
    textColor: 'var(--text-color-inverted)',
    borderColor: 'var(--active-color)',
  });

  if (index > 0) {
    edgeFuncs.updateByIndex(findEdge(circles.value[index - 1], circles.value[index]), { color: 'var(--active-color)' });
  }
  commit();

  circleFuncs.updateByIndex(index, {
    fillColor: 'var(--circle-fill)',
    textColor: 'var(--active-color)',
  });
  commit();
};
const search = async () => {
  toFirstHistory();
  if (circles.value.length === 0) {
    return;
  }
  let index = 0;
  let temp = circles.value[index];

  setActive(index);
  while (temp.text !== searchValue.value.toString()) {
    index += 1;
    temp = circles.value[index];

    if (!temp) {
      console.log('no value');
      break;
    }

    setActive(index);
  }

  circleFuncs.updateByIndex(index, {
    fillColor: 'var(--success-color)',
    borderColor: 'var(--success-color)',
    textColor: 'var(--text-color-inverted)',
  });
  commit();
  console.log(`value ${searchValue.value} found`);
  console.log(history.value);

  for (let i = 0; i < history.value.length; i++) {
    setTimeout(() => {
      state.currentHistory--;
      console.log(state.currentHistory);
    }, 1000 * (i + 1));
  }
};
</script>

<template>
  <div
    ref="container"
    class="create-container"
    @mousedown="mouseDownHandler"
  >
    <span>
      <button @click="(ev) => open(ev, '.js-search')">Search Value</button>
    </span>
    <span class="js-search">
      <input
        v-model="searchValue"
        type="number"
      />
    </span>
    <span class="js-search">
      <button @click="search">Find</button>
    </span>

    <span>
      <button @click="undo">Undo</button>
    </span>
    <span>
      <button @click="redo">Redo</button>
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
