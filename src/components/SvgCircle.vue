<script setup lang="ts">
import { onBeforeUnmount, onMounted, toRef, toRefs, watch } from 'vue';
import gsap from 'gsap';
import type { Circle } from '@/utility/classes';
import { ScreenInfoKey } from '@/utility/symbols';
import { injectStrict } from '@/utility/functions';

const { rem } = toRefs(injectStrict(ScreenInfoKey));

const props = defineProps<{ circle: Circle }>();
const circle = toRef(props, 'circle');
const copyId: string = circle.value.id;

const duration = 1;

onMounted(() => {
  gsap.fromTo(
    `#group${copyId} > *`,
    { scale: 0, transformOrigin: '50% 50%' },
    { scale: 1, transformOrigin: '50% 50%', duration: duration, ease: 'elastic' },
  );
  gsap.fromTo(
    `#group${copyId} > .circle`,
    {
      attr: {
        cx: circle.value.x,
        cy: circle.value.y,
        r: circle.value.radius,
        fill: circle.value.fillColor,
        stroke: circle.value.borderColor,
      },
    },
    {
      attr: {
        cx: circle.value.x,
        cy: circle.value.y,
        r: circle.value.radius,
        fill: circle.value.fillColor,
        stroke: circle.value.borderColor,
      },

      duration: duration,
    },
  );

  gsap.fromTo(
    `#group${copyId} > .circle-text`,
    {
      attr: {
        x: circle.value.x,
        y: circle.value.y,
        fill: circle.value.textColor,
      },
    },
    {
      attr: {
        x: circle.value.x,
        y: circle.value.y + (rem.value * 2) / 6,
        fill: circle.value.textColor,
      },

      duration: duration,
    },
  );

  gsap.fromTo(
    `#group${copyId} > .circle-caption`,
    {
      attr: {
        x: circle.value.x,
        y: circle.value.y,
        fill: circle.value.captionColor,
      },
    },
    {
      attr: {
        x: circle.value.x,
        y: circle.value.y + circle.value.radius + rem.value,
        fill: circle.value.captionColor,
      },

      duration: duration,
    },
  );
});

onBeforeUnmount(() => {
  gsap.to(`#group${copyId} > *`, { scale: 0, transformOrigin: '50% 50%', duration: duration });
});

watch(circle.value, (_newCircle) => {
  gsap.to(`#group${copyId} > circle`, {
    attr: {
      cx: circle.value.x,
      cy: circle.value.y,
      r: circle.value.radius,
      fill: circle.value.fillColor,
      stroke: circle.value.borderColor,
    },
    duration: duration,
    ease: 'elastic',
  });

  gsap.to(`#group${copyId} > .circle-text`, {
    attr: {
      x: circle.value.x,
      y: circle.value.y + (rem.value * 2) / 6,
      fill: circle.value.textColor,
    },

    duration: duration,
    ease: 'elastic',
  });

  gsap.to(`#group${copyId} > .circle-caption`, {
    attr: {
      x: circle.value.x,
      y: circle.value.y + circle.value.radius + rem.value,
      fill: circle.value.captionColor,
    },

    duration: duration,
    ease: 'elastic',
  });
});
</script>

<template>
  <g :id="`group${copyId}`">
    <circle
      class="circle"
      cx="0"
      cy="0"
      r="0"
      stroke-width="2"
    />
    <text
      class="circle-text"
      x="0"
      y="0"
      fill="#333"
    >
      {{ circle.text }}
    </text>
    <text
      class="circle-caption"
      x="0"
      y="0"
      fill="#333"
    >
      {{ circle.caption }}
    </text>
  </g>
</template>

<style lang="scss"></style>
