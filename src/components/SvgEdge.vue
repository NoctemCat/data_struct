<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, reactive, toRaw, toRef, watch } from 'vue';
import gsap from 'gsap';
import type { Circle, Edge, Rectangle } from '@/utility/classes';
import type { Point } from '@/utility/types';
import { pointOnCircle, pointOnRect } from '@/utility/math';

const props = defineProps<{ edge: Edge }>();
const edge = toRef(props, 'edge');

const copyId: string = structuredClone(toRaw(edge.value.id));
const edgeColor = reactive({ color: edge.value.color });
const duration = 1.2;
const easeFunc = 'power3';

const calculateDPath = (a?: Point, b?: Point) => {
  if (!a || !b) {
    return { firstDot: { x: 0, y: 0 }, secondDot: { x: 0, y: 0 } };
  }
  const firstDot = a.objType === 'Circle' ? pointOnCircle(a as Circle, b) : pointOnRect(a as Rectangle, b);
  const secondDot = b.objType === 'Circle' ? pointOnCircle(b as Circle, a) : pointOnRect(b as Rectangle, a);

  return {
    firstDot,
    secondDot,
  };
};

const { firstDot: first, secondDot: second } = calculateDPath(edge.value.a, edge.value.b);

const begPath = `M${first.x},${first.y}L${first.x},${first.y}`;
const endForwPath = `M${second.x},${second.y}L${first.x},${first.y}`;
const endBackPath = `M${first.x},${first.y}L${second.x},${second.y}`;

onMounted(() => {
  if (edge.value.forward) {
    gsap.fromTo(`#edgeForward${copyId}`, { attr: { d: begPath } }, { attr: { d: endForwPath }, duration: duration });
  }
  if (edge.value.backward) {
    gsap.fromTo(`#edgeBackward${copyId}`, { attr: { d: begPath } }, { attr: { d: endBackPath }, duration: duration });
  }
});

onBeforeUnmount(() => {
  const { firstDot } = calculateDPath(edge.value.a, edge.value.b);
  const begPathAdj = `M${firstDot.x},${firstDot.y}L${firstDot.x},${firstDot.y}`;

  if (edge.value.forward) {
    gsap.to(`#edgeForward${copyId}`, {
      attr: { d: begPathAdj },
      duration: duration,
      ease: easeFunc,
    });
  }
  if (edge.value.backward) {
    gsap.to(`#edgeBackward${copyId}`, {
      attr: { d: begPath },
      duration: duration,
      ease: easeFunc,
    });
  }
});

watch(props, (_) => {
  const { firstDot: first, secondDot: second } = calculateDPath(edge.value.a, edge.value.b);

  const newEndForwPath = `M${second.x},${second.y}L${first.x},${first.y}`;
  const newEndBackPath = `M${first.x},${first.y}L${second.x},${second.y}`;

  if (edge.value.forward) {
    gsap.to(`#edgeForward${copyId}`, {
      attr: { d: newEndForwPath },
      duration: duration,
      ease: easeFunc,
    });
  }
  if (edge.value.backward) {
    gsap.to(`#edgeBackward${copyId}`, {
      attr: { d: newEndBackPath },
      duration: duration,
      ease: easeFunc,
    });
  }

  gsap.to(edgeColor, { color: edge.value.color, duration: duration });
});
</script>

<template>
  <g>
    <path
      v-if="edge.forward"
      :id="`edgeForward${copyId}`"
      :stroke="edgeColor.color"
      stroke-width=".125rem"
      style="marker-start: url('#arrow')"
    />
    <path
      v-if="edge.backward"
      :id="`edgeBackward${copyId}`"
      :stroke="edgeColor.color"
      stroke-width=".125rem"
      style="marker-start: url('#arrow')"
    />
  </g>
</template>

<style lang="scss"></style>
