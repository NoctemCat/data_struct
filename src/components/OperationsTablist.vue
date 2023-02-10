<script setup lang="ts">
import IconClose from '@/components/icons/IconClose.vue';
import { ref, toRef, toRefs } from 'vue';
import gsap from 'gsap';
import { injectStrict } from '@/utility/functions';
import { ScreenInfoKey } from '@/utility/symbols';
import { useMouse } from '@vueuse/core';
import { useMouseScrollable } from './useMouseScrollable';

const { mouseDownHandler } = useMouseScrollable();
const props = defineProps<{ buttons: string[]; components: {}[] }>();
const buttonNames = toRef(props, 'buttons');
const tabs = toRef(props, 'components');

const operations = ref<HTMLDivElement | null>(null);
const { rem } = toRefs(injectStrict(ScreenInfoKey));
const { x: xMouse, y: yMouse } = useMouse();

const currentTab = ref<number | undefined>();

const mouseMove = (el: MouseEvent | TouchEvent) => {
  const elem = el.currentTarget as HTMLDivElement;
  if (!elem) return;

  const { x, y, width, height } = elem.getBoundingClientRect();

  const xIn = xMouse.value - x;
  const yIn = yMouse.value - y;

  const constraint = 0.24;
  let xPercent = (xIn / width) * constraint - constraint / 2;
  let yPercent = (yIn / height) * constraint - constraint / 2;

  const scrollRem = elem.scrollLeft / rem.value;

  elem.setAttribute('style', `--top-val: ${yPercent}rem; --left-val: ${xPercent + scrollRem}rem`);
};

const mouseLeave = (el: MouseEvent | TouchEvent) => {
  const elem = el.currentTarget as HTMLDivElement;

  const scrollRem = elem.scrollLeft / rem.value;
  gsap.to(elem, {
    '--top-val': '0.125rem',
    '--left-val': `${scrollRem - 0.125}rem`,
    duration: 0.2,
  });
};

const controlsSelected = ref<HTMLButtonElement | null>(null);
const topControlEnter = (el: MouseEvent | TouchEvent | FocusEvent) => {
  const current = el.currentTarget as HTMLButtonElement;
  if (controlsSelected.value && !current.classList.contains('hidden')) {
    const box = current.getBoundingClientRect();
    const parent = current.parentElement!.getBoundingClientRect();

    // add scroll only if direct child
    const scroll = operations.value === current.parentElement ? operations.value?.scrollLeft ?? 0 : 0;
    const newLeft = box.x - parent.x + scroll;

    gsap.to(controlsSelected.value, {
      left: newLeft,
      width: box.width,
      duration: 0.2,
    });

    const arrayChildren = Array.from(current.parentElement?.children ?? []);
    arrayChildren.forEach((el) => {
      (el as HTMLButtonElement).tabIndex = -1;
    });
    current.tabIndex = 0;
  }
};

const closeControls = ref<HTMLButtonElement | null>(null);
const controlsContent = ref<HTMLDivElement | null>(null);
const selectCategory = (index: number) => {
  if (!controlsContent.value) {
    return;
  }
  closeControls.value?.classList.remove('hidden');
  closeControls.value?.classList.add('shown');
  closeControls.value?.removeAttribute('hidden');

  controlsContent.value.style.maxHeight = controlsContent.value.scrollHeight + 'px';
  currentTab.value = index;
};

const closeControlsFun = (_ev: MouseEvent | TouchEvent) => {
  closeControls.value?.classList.remove('shown');
  closeControls.value?.classList.add('hidden');

  if (controlsContent.value) {
    controlsContent.value.style.maxHeight = '';
  }
  gsap.to(controlsSelected.value, {
    width: 0,
    duration: 0.2,
  });
};

const tabKeyPress = (ev: KeyboardEvent) => {
  const activeTabElem = document.activeElement as HTMLButtonElement;
  if (activeTabElem?.role !== 'tab') {
    return;
  }

  if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
    let activeTab = parseInt(activeTabElem.id.split('-')[2]);
    if (ev.key === 'ArrowRight') {
      activeTab++;
      if (activeTab >= buttonNames.value.length) {
        activeTab = 0;
      }
    } else if (ev.key === 'ArrowLeft') {
      activeTab--;
      if (activeTab < 0) {
        activeTab = buttonNames.value.length - 1;
      }
    }

    const newTab = document.getElementById(`button-tab-${activeTab}`) as HTMLButtonElement;
    newTab.focus();
  }
};
const elemScroll = (e: Event) => {
  const elem = e.currentTarget as HTMLDivElement;
  const scrollRem = elem.scrollLeft / rem.value;
  gsap.to(elem, {
    '--top-val': '0.125rem',
    '--left-val': `${scrollRem - 0.125}rem`,
    duration: 0.2,
  });
};
</script>

<template>
  <div
    class="operations"
    role="tablist"
    aria-label="Operations Tabs"
  >
    <div
      ref="operations"
      class="white-grad"
      data-menu-id="operations"
      style="--top-val: 0.125rem; --left-val: -0.125rem"
      @mouseleave="mouseLeave"
      @touchend="mouseLeave"
      @mousemove="mouseMove"
      @touchmove="mouseMove"
      @scroll="elemScroll"
      @keydown="tabKeyPress"
      @mousedown="mouseDownHandler"
    >
      <div class="controls-buttons">
        <button
          v-for="(name, index) in buttonNames"
          :id="`button-tab-${index}`"
          :key="name"
          role="tab"
          :aria-selected="index === currentTab"
          :aria-controls="`control-tab-${index}`"
          :tabindex="index === 0 ? 0 : -1"
          @mouseenter="topControlEnter"
          @focus="topControlEnter"
          @click="selectCategory(index)"
        >
          <span>{{ name }}</span>
        </button>
      </div>

      <button
        ref="closeControls"
        class="close-controls"
        @click="closeControlsFun"
        @mouseenter="topControlEnter"
        @focus="topControlEnter"
      >
        <IconClose />
      </button>
      <div
        ref="controlsSelected"
        class="controls-selected"
      ></div>
    </div>

    <div
      ref="controlsContent"
      class="cotrols-content"
    >
      <template
        v-for="(tab, index) in tabs"
        :key="index"
      >
        <div
          :id="`control-tab-${index}`"
          class="tab-wrapper"
          :style="`transform: translateX(-${100 * (currentTab ?? 0)}%);`"
          role="tabpanel"
          tabindex="0"
          :aria-labelledby="`button-tab-${index}`"
          :aria-hidden="index === currentTab ? false : true"
        >
          <component :is="tab"></component>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.operations {
  display: grid;
}

.white-grad {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--app-border-color);
  border-radius: 2.5% / 50% 0 50% 0;
  border-radius: 0;
  position: relative;
  z-index: 0;
  transition: background-color var(--theme-switch-time);
  overflow-x: auto;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    background: transparent;
    width: 0;
    height: 0;
  }

  &::before {
    transition: background-color var(--theme-switch-time);
    background-color: var(--bg-color);
    content: '';
    position: absolute;
    width: calc(100% - 0.125rem);
    height: calc(100% - 0.25rem);
    border-radius: 2.5% / 50% 0 50% 0;
    pointer-events: none;
    translate: var(--left-val) var(--top-val);
  }

  &:hover {
    transition: 0.25s;
  }
}
.controls-selected {
  position: absolute;
  width: 4rem;
  height: 100%;

  top: 0;
  left: -150%;
  content: '';
  backdrop-filter: invert(1);
  pointer-events: none;
}

.controls-buttons {
  display: flex;
  flex-direction: row;

  button {
    cursor: pointer;
    background: transparent;
    font-family: inherit;
    box-sizing: content-box;
    border: 0;
    margin: 0;
    padding: 0.75rem 2rem;
    color: var(--text-color);

    font-size: 1.25rem;
  }
}

.close-controls {
  cursor: pointer;
  height: 100%;
  aspect-ratio: 1;
  background: transparent;
  border: 0;
  padding: 0.75rem;

  :deep(svg) {
    path {
      fill: transparent;
      stroke: var(--text-color);
      stroke-width: 1.5;

      stroke-dasharray: 100;
      stroke-dashoffset: 100;
    }
  }
}
.hidden {
  :deep(svg) {
    path {
      animation: hide 1s var(--power3-out) forwards;
    }

    @keyframes hide {
      from {
        stroke-dashoffset: 0;
      }
      to {
        stroke-dashoffset: 100;
      }
    }
  }
}

.shown {
  :deep(svg) {
    path {
      animation: show 1s var(--power3-in) forwards;
    }

    @keyframes show {
      from {
        stroke-dashoffset: 100;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  }
}

.cotrols-content {
  display: flex;
  flex-direction: row;
  max-height: 0;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  background: var(--bg-color);
  border-right: 0.25rem solid var(--app-border-color);
  //gap: 0.25rem;
  transition: all 0.2s ease-in-out, color var(--theme-switch-time), background-color var(--theme-switch-time),
    border var(--theme-switch-time);
}

.tab-wrapper {
  flex-shrink: 0;
  width: 100%;

  transition: transform 0.25s ease-in;
}
</style>
