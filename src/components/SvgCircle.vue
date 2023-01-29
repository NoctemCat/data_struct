<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRaw, toRef, toRefs, watch } from 'vue';
import gsap from 'gsap';
import type { Circle } from '@/utility/classes';
import { ScreenInfoKey } from '@/utility/symbols';
import { injectStrict } from '@/utility/functions';

const { rem } = toRefs(injectStrict(ScreenInfoKey));

const props = defineProps<{ circle: Circle }>();
const circle = toRef(props, 'circle');
const copy: Circle = structuredClone(toRaw(circle.value));

const duration = 1;
const easing = 'power3';

const groupRef = ref<SVGGElement | null>(null);
const circleRef = ref<SVGCircleElement | null>(null);

let xTo: gsap.QuickToFunc | undefined;
let yTo: gsap.QuickToFunc | undefined;
let rTo: gsap.QuickToFunc | undefined;

onMounted(() => {
  xTo = gsap.quickTo(groupRef.value, 'x', { duration: duration, ease: easing });
  yTo = gsap.quickTo(groupRef.value, 'y', { duration: duration, ease: easing });
  rTo = gsap.quickTo(circleRef.value, 'r', { duration: duration, ease: easing });

  gsap.fromTo(
    groupRef.value,
    { scale: 0, transformOrigin: '50% 50%' },
    { scale: 1, transformOrigin: '50% 50%', duration: duration, ease: easing },
  );
});

watch(circle.value, (_) => {
  if (rTo) {
    xTo!(circle.value.x - copy.x);
    yTo!(circle.value.y - copy.y);
    rTo(circle.value.radius);
  }
});

onBeforeUnmount(() => {
  gsap.to(groupRef.value, { scale: 0, transformOrigin: '50% 50%', duration: duration, ease: easing });
});
</script>

<template>
  <g
    :id="`group${copy.id}`"
    class="js-scale-group"
    :style="`--circle-dur: ${duration}s`"
  >
    <g ref="groupRef">
      <circle
        ref="circleRef"
        :cx="copy.x"
        :cy="copy.y"
        :r="copy.radius"
        :fill="circle.fillColor"
        :stroke="circle.borderColor"
        stroke-width="2"
      />
      <text
        :x="copy.x"
        :y="copy.y + (rem * 2) / 6"
        :fill="circle.textColor"
      >
        {{ circle.text }}
      </text>
      <text
        :x="copy.x"
        :y="copy.y + copy.radius + rem"
        :fill="circle.captionColor"
      >
        {{ circle.caption }}
      </text>
    </g>
  </g>
</template>

<style lang="scss" scoped>
.js-scale-group circle,
.js-scale-group text {
  transition: fill var(--circle-dur) var(--power3), stroke var(--circle-dur) var(--power3);
}
</style>
