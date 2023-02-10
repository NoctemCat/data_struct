<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, ref, toRaw, toRef, toRefs, watch } from 'vue';
import gsap from 'gsap';
import type { Rectangle } from '@/utility/classes';
import { ScreenInfoKey } from '@/utility/symbols';
import { injectStrict } from '@/utility/functions';

const { rem } = toRefs(injectStrict(ScreenInfoKey));

const props = defineProps<{ rectangle: Rectangle }>();
const rectangle = toRef(props, 'rectangle');
const copy: Rectangle = structuredClone(toRaw(rectangle.value));

const duration = 0.75;
const ease = 'power3';

const adjusted = () => {
  return { x: copy.x - copy.width / 2, y: copy.y - copy.height / 2 };
};

const groupRef = ref<SVGGElement | null>(null);
const rectRef = ref<SVGRectElement | null>(null);

let xTo: gsap.QuickToFunc | undefined;
let yTo: gsap.QuickToFunc | undefined;
let widthTo: gsap.QuickToFunc | undefined;
let heigthTo: gsap.QuickToFunc | undefined;

onMounted(() => {
  xTo = gsap.quickTo(groupRef.value, 'x', { duration, ease });
  yTo = gsap.quickTo(groupRef.value, 'y', { duration, ease });

  widthTo = gsap.quickTo(rectRef.value, 'width', { duration, ease });
  heigthTo = gsap.quickTo(rectRef.value, 'height', { duration, ease });

  gsap.fromTo(
    groupRef.value,
    { scale: 0, transformOrigin: '50% 50%' },
    { scale: 1, transformOrigin: '50% 50%', duration, ease },
  );
});

onUpdated(() => {
  if (widthTo) {
    xTo!(rectangle.value.x - copy.x);
    yTo!(rectangle.value.y - copy.y);
    widthTo(rectangle.value.width);
    heigthTo!(rectangle.value.height);
  }
});

onBeforeUnmount(() => {
  gsap.to(groupRef.value, { scale: 0, transformOrigin: '50% 50%', duration, ease });
});
</script>

<template>
  <g
    :id="`group${copy.id}`"
    class="js-scale-group"
    :style="`--circle-dur: ${duration}s`"
  >
    <g ref="groupRef">
      <rect
        ref="rectRef"
        :x="adjusted().x"
        :y="adjusted().y"
        :bx="rectangle.borderRadius"
        :by="rectangle.borderRadius"
        :width="copy.width"
        :height="copy.height"
        :stroke="rectangle.borderColor"
        :fill="rectangle.fillColor"
        stroke-width="2"
      />
      <text
        :x="copy.x"
        :y="copy.y + (rem * 2) / 6"
        :fill="rectangle.textColor"
      >
        {{ rectangle.text }}
      </text>
      <text
        :x="copy.x"
        :y="copy.y + copy.height / 2 + 1.25 * rem"
        :fill="rectangle.captionColor"
      >
        {{ rectangle.caption }}
      </text>
      <text class="for-updating">{{ `${rectangle.x}${rectangle.y}${rectangle.width}${rectangle.height}` }}</text>
    </g>
  </g>
</template>

<style lang="scss" scoped>
.js-scale-group rect,
.js-scale-group text {
  transition: fill calc(var(--circle-dur) * 0.5) ease-in, stroke calc(var(--circle-dur) * 0.5) ease-in,
    bx var(--circle-dur) var(--power3-in), by var(--circle-dur) var(--power3-in);
}

.for-updating {
  display: none;
}
</style>
