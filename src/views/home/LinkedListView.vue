<script setup lang="ts">
import SvgCanvas from '@/components/SvgCanvas.vue';
import IconClose from '@/components/icons/IconClose.vue';

import { useLListStore } from '@/stores/linkedlist';
import type { Circle, Rectangle } from '@/utility/classes';
import { getRandomItemArray, injectStrict, triggerWithEase } from '@/utility/functions';
import { ScreenInfoKey } from '@/utility/symbols';
import type { Point, ValidObjects } from '@/utility/types';
import { useThrottleFn, useIntervalFn, useMouse } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import gsap from 'gsap';
import { onMounted, ref, toRefs, watch } from 'vue';
import { usePiniaHistory } from '@/stores/history';
//import { useI18n } from 'vue-i18n';

const { rem } = toRefs(injectStrict(ScreenInfoKey));

const { circles, rects, edges } = storeToRefs(useLListStore());

//const circles = toRef(circleHolder.value, 'elems');
//const rects = toRef(rectHolder.value, 'elems');
//const edges = toRef(edgeHolder.value, 'elems');

// undo, redo
const { circleFuncs, rectsFuncs, edgeFuncs, printState } = useLListStore();

//const { t } = useI18n({ useScope: 'local' });

//let xCur = 4 * rem.value;
usePiniaHistory();
const { x: xMouse, y: yMouse } = useMouse();

const getRandomPos = () => {
  const newX = 4 * rem.value + Math.random() * 48 * rem.value;
  const newY = 4 * rem.value + Math.random() * 24 * rem.value;
  return { x: newX, y: newY };
};

const changePos = () => {
  const newX = Math.random() * 10 - 5;
  const newY = Math.random() * 10 - 5;

  if (Math.random() > 0.5) {
    const circle = getRandomItemArray(circles.value);
    circleFuncs.update(circle, {
      x: circle.x + newX,
      y: circle.y + newY,
      caption: circle.caption === 'tail' ? 'test string' : 'tail',
      fillColor: circle.fillColor === '#333' ? '#eee' : '#333',
    });
  } else {
    const rect = getRandomItemArray(rects.value);
    rectsFuncs.update(rect, {
      x: rect.x + newX,
      y: rect.y + newY,
      caption: rect.caption === 'tail' ? 'test string' : 'tail',
      fillColor: rect.fillColor === '#333' ? '#eee' : '#333',
    });
  }
};

const switchEdge = () => {
  const edge = getRandomItemArray(edges.value);
  const newb = Math.random() > 0.5 ? getRandomItemArray(circles.value) : getRandomItemArray(rects.value);
  if (edge?.b) {
    if (edge.a !== newb) {
      edgeFuncs.update(edge, {
        b: newb,
      });
    } else {
      switchEdge();
    }
  }
};

const switchCircle = () => {
  const circle = getRandomItemArray(circles.value);
  circleFuncs.update(circle, {
    ...getRandomPos(),
  });
};

const switchRectangle = () => {
  const rect = getRandomItemArray(rects.value);
  rectsFuncs.update(rect, {
    ...getRandomPos(),
  });
};

const createEdge = (a: Point, b: Point) => {
  const edge = {
    objType: 'Edge' as ValidObjects,
    a: a,
    b: b,
  };

  edgeFuncs.add(edge);
};
const colors = ['#333', 'red', 'blue', 'green', '#636363'];

const addRandomHead = (caption: string) => {
  const newCircleVal = Math.floor(Math.random() * 101).toString();

  const newRad = 8 + Math.random() * 25;
  const { x, y } = getRandomPos();

  const circle = {
    objType: 'Circle' as ValidObjects,
    x: x,
    y: y,
    text: newCircleVal,
    caption: caption,
    radius: newRad,
    textColor: getRandomItemArray(colors),
    captionColor: getRandomItemArray(colors),
  };

  const newCircle = circleFuncs.add(circle);
  //xCur += 64;
  return newCircle;
};
const addRandomRect = (caption: string) => {
  const newVal = Math.floor(Math.random() * 101).toString();

  const newWidth = 16 + Math.random() * 25;
  const newHeigth = 16 + Math.random() * 25;

  const { x, y } = getRandomPos();

  const rect = {
    objType: 'Rectangle' as ValidObjects,
    x: x,
    y: y,
    width: newWidth,
    height: newHeigth,
    text: newVal,
    caption: caption,
  };

  const newCircle = rectsFuncs.add(rect);
  //xCur += 64;
  return newCircle;
};

const creatRandomList = () => {
  const max = 5 + Math.floor(Math.random() * 11);

  let prevCircle: Circle | Rectangle | null = null;
  for (let i = 0; i < max; i++) {
    setTimeout(() => {
      if (i === 0) {
        prevCircle = addRandomHead('head');
      }
      const caption = i === max - 1 ? 'tail' : 'body';
      const curCircle = Math.random() > 0.5 ? addRandomHead(caption) : addRandomRect(caption);
      createEdge(prevCircle!, curCircle);
      prevCircle = curCircle;
    }, 200 * i);
  }
};
const creatRandomListThr = useThrottleFn(creatRandomList, 400);

const addRandom = () => {
  if (edges.value.length > 0) {
    const last = edges.value[edges.value.length - 1];
    const prevEl = last.b;

    prevEl!.caption = '';

    const curCircle = Math.random() > 0.5 ? addRandomHead('tail') : addRandomRect('tail');
    createEdge(prevEl!, curCircle);
  } else {
    Math.random() > 0.5 ? addRandomHead('head') : addRandomRect('head');
  }
};

const deleteLast = () => {
  //circleFuncs.removeLast();
  if (edges.value.length > 0) {
    //xCur -= 64;
    const lastEdge = edges.value[edges.value.length - 1];

    lastEdge.a!.caption = 'tail';
    edgeFuncs.removeLast();

    if (lastEdge.b!.objType === 'Circle') circleFuncs.removeLast();
    else rectsFuncs.removeLast();
  } else {
    if (circles.value.length > 0) {
      circleFuncs.removeLast();
    } else if (rects.value.length > 0) {
      rectsFuncs.removeLast();
    }
  }
};

const reset = async (done: () => void) => {
  //deleteLast

  triggerWithEase.inQuad(5000, circles.value.length + edges.value.length, deleteLast, done);
};
const resetThr = useThrottleFn(reset, 400);

const closeControls = ref<HTMLButtonElement | null>(null);
const controlsContent = ref<HTMLDivElement | null>(null);
const selectCategory = () => {
  //console.log(edges.value);
  closeControls.value?.classList.remove('hidden');
  closeControls.value?.classList.add('shown');

  if (controlsContent.value) {
    controlsContent.value.style.maxHeight = controlsContent.value.scrollHeight + 'px';
  }
};

const {
  pause,
  resume,
  isActive: _,
} = useIntervalFn(() => {
  switchEdge();
  Math.random() > 0.5 ? switchCircle() : switchRectangle();
}, 100);

const test = ref<HTMLDivElement | null>(null);
// All keys must be doubled
const currentlyHovering = ref({
  test: false,
});
const menuRefs = {
  test: test,
};

const mouseEnter = (el: MouseEvent | TouchEvent) => {
  //console.log(el);
  const menuId = (el.currentTarget as HTMLDivElement).getAttribute('data-menu-id');

  if (menuId && Object.hasOwn(currentlyHovering.value, menuId)) {
    currentlyHovering.value[menuId as keyof typeof currentlyHovering.value] = true;
  }
};
const mouseLeave = (el: MouseEvent | TouchEvent) => {
  const menuId = (el.currentTarget as HTMLDivElement).getAttribute('data-menu-id');

  if (menuId && Object.hasOwn(currentlyHovering.value, menuId)) {
    currentlyHovering.value[menuId as keyof typeof currentlyHovering.value] = false;
    gsap.to(menuRefs[menuId as keyof typeof menuRefs].value, {
      '--top-val': '0.125rem',
      '--left-val': '-0.125rem',
      duration: 0.2,
    });
  }
};

onMounted(() => {
  creatRandomList();

  pause();
});

const controlsSelected = ref<HTMLButtonElement | null>(null);
const topControlEnter = (el: MouseEvent | TouchEvent | FocusEvent) => {
  const current = el.currentTarget as HTMLButtonElement;
  if (controlsSelected.value && !current.classList.contains('hidden')) {
    const box = current.getBoundingClientRect();
    const buttonStyle = getComputedStyle(current);

    const padding = buttonStyle.padding.substring(0, buttonStyle.padding.indexOf('px'));
    const appMargin = rem.value / 4;
    const newLeft = box.x - parseFloat(padding) / 2 + appMargin;

    gsap.to(controlsSelected.value, {
      left: newLeft,
      width: box.width,
      duration: 0.2,
    });
  }
};

watch([xMouse, yMouse], (_) => {
  for (const [key, value] of Object.entries(currentlyHovering.value)) {
    if (value) {
      const elRef = menuRefs[key as keyof typeof menuRefs].value;

      if (!elRef) return;

      const { x, y, width, height } = elRef.getBoundingClientRect();

      const xIn = xMouse.value - x;
      const yIn = yMouse.value - y;

      //* 20 - 10
      const constraint = 0.24;
      let xPercent = (xIn / width) * constraint - constraint / 2;
      let yPercent = (yIn / height) * constraint - constraint / 2;

      xPercent = xPercent >= -constraint / 2 ? xPercent : -constraint / 2;
      xPercent = xPercent <= constraint / 2 ? xPercent : constraint / 2;

      yPercent = yPercent >= -constraint / 2 ? yPercent : -constraint / 2;
      yPercent = yPercent <= constraint / 2 ? yPercent : constraint / 2;

      elRef.setAttribute('style', `--top-val: ${yPercent}rem; --left-val: ${xPercent}rem`);
    }
  }
});

const closeControlsFun = (_el: MouseEvent | TouchEvent) => {
  closeControls.value?.classList.remove('shown');
  closeControls.value?.classList.add('hidden');

  if (controlsContent.value) {
    controlsContent.value.style.maxHeight = '';
  }
};

const printHistory = () => {
  //console.log(history.value);
};
</script>

<template>
  <div class="content-body">
    <SvgCanvas
      :circles="circles"
      :rects="rects"
      :edges="edges"
    />
  </div>
  <div class="content-controls">
    <!--<div class="sphere">
      <div class="circle">s</div>
    </div>-->
    <div class="operations">
      <div
        ref="test"
        class="white-grad"
        data-menu-id="test"
        style="--top-val: 0.125rem; --left-val: -0.125rem"
        @mouseenter="mouseEnter"
        @mouseleave="mouseLeave"
        @touchstart="mouseEnter"
        @touchend="mouseLeave"
      >
        <ul class="controls-buttons">
          <li>
            <button
              @mouseenter="topControlEnter"
              @focus="topControlEnter"
              @click="selectCategory"
            >
              <span>create</span>
            </button>
          </li>
          <li>
            <button
              @mouseenter="topControlEnter"
              @focus="topControlEnter"
              @click="selectCategory"
            >
              <span>search</span>
            </button>
          </li>
          <li>
            <button
              @mouseenter="topControlEnter"
              @focus="topControlEnter"
              @click="selectCategory"
            >
              <span>insert</span>
            </button>
          </li>
          <li>
            <button
              @mouseenter="topControlEnter"
              @focus="topControlEnter"
              @click="selectCategory"
            >
              <span>remove</span>
            </button>
          </li>
          <li>
            <button
              @mouseenter="topControlEnter"
              @focus="topControlEnter"
              @click="selectCategory"
            >
              <span>random</span>
            </button>
          </li>
        </ul>

        <button
          id="closeCotrols"
          ref="closeControls"
          class=""
          @mouseenter="topControlEnter"
          @focus="topControlEnter"
          @click="closeControlsFun"
        >
          <IconClose />
        </button>
        <div
          id="controlsSelected"
          ref="controlsSelected"
        ></div>
      </div>

      <!--@mouseenter="passEvent"-->
      <div
        ref="controlsContent"
        class="cotrols-content"
      >
        <button @click="creatRandomListThr()">random</button>
        <button @click="addRandom()">add random</button>
        <button @click="deleteLast()">delete tail</button>

        <button @click="changePos()">update pos</button>
        <button @click="switchEdge()">switch edge</button>

        <button @click="resetThr(creatRandomList)">reset</button>

        <button @click="resume()">start</button>
        <button @click="pause()">stop</button>

        <!--<button @click="undo()">undo</button>
        <button @click="redo()">redo</button>-->
        <button @click="printState()">print state</button>
        <button @click="printHistory()">print history</button>
      </div>
    </div>
    <div>
      <div>Circles {{ circles.length }}</div>
      <div>Rectsangles {{ rects.length }}</div>
      <div>Edges {{ edges.length }}</div>
    </div>
    <!--<div class="timeline"></div>-->
  </div>
</template>

<style lang="scss" scoped>
.content-body {
  flex: 1;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
.content-controls {
  position: relative;
  display: grid;
  //grid-template-columns: 3fr 1fr;
  max-width: 64rem;

  .sphere {
    top: -17.5rem;
    left: 5rem;
    position: absolute;

    .circle {
      width: 200px;
      height: 100px; /* as the half of the width */
      border-top-left-radius: 100px;
      border-top-right-radius: 100px;
      border: 10px solid gray;
      border-bottom: 0;

      &:hover {
        border: 10px solid orange;
        border-bottom: 0;
      }
    }
  }
  .white-grad {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--border-color);
    background: var(--bg-color);
    border-radius: 2.5% / 50% 0 50% 0;
    border-radius: 0;
    //width: 134px;
    //aspect-ratio: 1;
    //padding: 1rem 2rem;
    position: relative;
    z-index: 0;
    transition: background-color var(--theme-switch-time);
    overflow: hidden;

    &::before {
      //top: 0;
      //left: 0;
      //right: 0;
      transition: background-color var(--theme-switch-time);
      background-color: var(--app-bg-color);
      content: '';
      position: absolute;
      width: calc(100% - 0.25rem);
      height: calc(100% - 0.25rem);
      border-radius: 2.5% / 50% 0 50% 0;
      pointer-events: none;
      translate: var(--left-val) var(--top-val);
    }

    &:hover {
      transition: 0.25s;
      //background-color: antiquewhite;
    }
  }
  #controlsSelected {
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

    //gap: 2rem;

    button {
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
}

.accordion {
  outline: none;
  cursor: pointer;
}

#closeCotrols {
  position: absolute;
  top: 0;
  right: 0;
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
  max-height: 0;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  background: var(--bg-color);
}
</style>

<i18n lang="json5" locale="en">
{
  linkedList: {
    test: 's',
  },
}
</i18n>
<i18n lang="json5" locale="ru">
{
  linkedList: {
    test: 's',
  },
}
</i18n>
