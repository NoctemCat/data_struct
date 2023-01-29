<script setup lang="ts">
import { onBeforeUnmount, onMounted, toRef, toRefs, watch } from 'vue';
import gsap from 'gsap';
import type { Rectangle } from '@/utility/classes';
import { ScreenInfoKey } from '@/utility/symbols';
import { injectStrict } from '@/utility/functions';

const { rem } = toRefs(injectStrict(ScreenInfoKey));

const props = defineProps<{ rectangle: Rectangle }>();
const rectangle = toRef(props, 'rectangle');
const copyId: string = rectangle.value.id;

const duration = 1;

const adjusted = () => {
  return { x: rectangle.value.x - rectangle.value.width / 2, y: rectangle.value.y - rectangle.value.height / 2 };
};

onMounted(() => {
  gsap.fromTo(
    `#group${copyId} > *`,
    { scale: 0, transformOrigin: '50% 50%' },
    { scale: 1, transformOrigin: '50% 50%', duration: duration, ease: 'elastic' },
  );

  const { x, y } = adjusted();
  gsap.fromTo(
    `#group${copyId} > .rectangle`,
    {
      attr: {
        x: x,
        y: y,
        bx: rectangle.value.borderRadius,
        by: rectangle.value.borderRadius,
        width: rectangle.value.width,
        height: rectangle.value.height,
        fill: rectangle.value.fillColor,
        stroke: rectangle.value.borderColor,
      },
    },
    {
      attr: {
        x: x,
        y: y,
        bx: rectangle.value.borderRadius,
        by: rectangle.value.borderRadius,
        width: rectangle.value.width,
        height: rectangle.value.height,
        fill: rectangle.value.fillColor,
        stroke: rectangle.value.borderColor,
      },

      duration: duration,
      ease: 'elastic',
    },
  );

  gsap.fromTo(
    `#group${copyId} > .rect-text`,
    {
      attr: {
        x: rectangle.value.x,
        y: rectangle.value.y,
        fill: rectangle.value.textColor,
      },
    },
    {
      attr: {
        x: rectangle.value.x,
        y: rectangle.value.y + (rem.value * 2) / 6,
        fill: rectangle.value.textColor,
      },

      duration: duration,
      ease: 'elastic',
    },
  );

  gsap.fromTo(
    `#group${copyId} > .rect-caption`,
    {
      attr: {
        x: rectangle.value.x,
        y: rectangle.value.y,
        fill: rectangle.value.captionColor,
      },
    },
    {
      attr: {
        x: rectangle.value.x,
        y: rectangle.value.y + rectangle.value.height / 2 + 1.25 * rem.value,
        fill: rectangle.value.captionColor,
      },

      duration: duration,
      ease: 'elastic',
    },
  );
});

onBeforeUnmount(() => {
  gsap.to(`#group${copyId} > *`, {
    scale: 0,
    transformOrigin: '50% 50%',
    duration: duration,
  });
});

watch(rectangle.value, (_newRect) => {
  const { x, y } = adjusted();
  gsap.to(`#group${copyId} > .rectangle`, {
    attr: {
      x: x,
      y: y,
      bx: rectangle.value.borderRadius,
      by: rectangle.value.borderRadius,
      width: rectangle.value.width,
      height: rectangle.value.height,
      fill: rectangle.value.fillColor,
      stroke: rectangle.value.borderColor,
    },

    duration: duration,
    ease: 'elastic',
  });

  gsap.to(`#group${copyId} > .rect-text`, {
    attr: {
      x: rectangle.value.x,
      y: rectangle.value.y + (rem.value * 2) / 6,
      fill: rectangle.value.textColor,
    },

    duration: duration,
    ease: 'elastic',
  });

  gsap.to(`#group${copyId} > .rect-caption`, {
    attr: {
      x: rectangle.value.x,
      y: rectangle.value.y + rectangle.value.height / 2 + 1.25 * rem.value,
      fill: rectangle.value.captionColor,
    },

    duration: duration,
    ease: 'elastic',
  });
});
</script>

<template>
  <g :id="`group${copyId}`">
    <rect
      class="rectangle"
      x="0"
      y="0"
      width="0"
      height="0"
      fill="#333"
      stroke-width="2"
    />
    <text
      class="rect-text"
      x="0"
      y="0"
      fill="#333"
    >
      {{ rectangle.text }}
    </text>
    <text
      class="rect-caption"
      x="0"
      y="0"
      fill="#333"
    >
      {{ rectangle.caption }}
    </text>
  </g>
</template>

<style lang="scss" scoped>
text {
  font-size: 1rem;
  line-height: 1rem;
  font-weight: 700;
  text-anchor: middle;
}
</style>
