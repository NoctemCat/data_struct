<script setup lang="ts">
import SvgCanvas from '@/components/SvgCanvas.vue';
import ContentControls from '@/components/ContentControls.vue';

import { useShapesStore } from '@/stores/linkedlist';
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
import CreateTab from './CreateTab.vue';
import InsertTab from './InsertTab.vue';
import SearchTab from './SearchTab.vue';
import { useI18n } from 'vue-i18n';

const { rem } = toRefs(injectStrict(ScreenInfoKey));
const { t } = useI18n({ useScope: 'local' });

const { circles, rects, edges } = storeToRefs(useShapesStore());

//const circles = toRef(circleHolder.value, 'elems');
//const rects = toRef(rectHolder.value, 'elems');
//const edges = toRef(edgeHolder.value, 'elems');

// undo, redo
const { circleFuncs, rectsFuncs, edgeFuncs, printState } = useShapesStore();

//const { t } = useI18n({ useScope: 'local' });

//let xCur = 4 * rem.value;
const { undo, redo } = usePiniaHistory();
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
  if (edges.value.length > 0) {
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
  triggerWithEase.inQuad(5000, circles.value.length + edges.value.length, deleteLast, done);
};
const resetThr = useThrottleFn(reset, 400);

const closeControls = ref<HTMLButtonElement | null>(null);
const controlsContent = ref<HTMLDivElement | null>(null);
const selectCategory = () => {
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

onMounted(() => {
  creatRandomList();

  pause();
});

const printHistory = () => {
  //console.log(history.value);
};

const te = typeof SearchTab;
</script>

<template>
  <div class="content-body">
    <SvgCanvas
      :circles="circles"
      :rects="rects"
      :edges="edges"
    />
  </div>
  <ContentControls
    :buttons="[
      t('linkedList.create'),
      t('linkedList.search'),
      t('linkedList.insert'),
      t('linkedList.remove'),
      t('linkedList.random'),
    ]"
    :components="[CreateTab, SearchTab, InsertTab]"
  >
  </ContentControls>
  <!--<button @click="creatRandomListThr()">random</button>
<button @click="addRandom()">add random</button>
<button @click="deleteLast()">delete tail</button>

<button @click="changePos()">update pos</button>
<button @click="switchEdge()">switch edge</button>

<button @click="resetThr(creatRandomList)">reset</button>

<button @click="resume()">start</button>
<button @click="pause()">stop</button>

<button @click="undo()">undo</button>
<button @click="redo()">redo</button>
<button @click="printState()">print state</button>
<button @click="printHistory()">print history</button>-->
</template>

<style lang="scss" scoped>
.content-body {
  flex: 1;
}
</style>

<i18n lang="json5" locale="en">
{
  linkedList: {
    create: 'Create',
    search: 'Search',
    insert: 'Insert',
    remove: 'Remove',
    random: 'Random',
  },
}
</i18n>
<i18n lang="json5" locale="ru">
{
  linkedList: {
    create: 'Создать',
    search: 'Найти',
    insert: 'Вставить',
  },
}
</i18n>
