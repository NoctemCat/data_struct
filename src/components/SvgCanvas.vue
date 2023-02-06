<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { toRefs, TransitionGroup } from 'vue';
import SvgCircle from '@/components/SvgCircle.vue';
import SvgEdge from '@/components/SvgEdge.vue';
import type { Circle, Rectangle, Edge } from '@/utility/classes';
import SvgRectangle from '@/components/SvgRectangle.vue';

const props = defineProps<{
  circles: Circle[];
  rects: Rectangle[];
  edges: Edge[];
}>();

const { circles, rects, edges } = toRefs(props);

const animDuration = 1;

const animOnLeave = (_el: Element, done: () => void) => {
  setTimeout(() => {
    done();
  }, animDuration * 1000);
};
</script>

<template>
  <svg id="maingraph">
    <g
      id="edge"
      ref="edgeGroup"
    >
      <TransitionGroup
        :css="false"
        @leave="animOnLeave"
      >
        <SvgEdge
          v-for="edge in edges"
          :key="edge.id"
          :edge="edge"
        />
      </TransitionGroup>
    </g>
    <g id="vertex">
      <TransitionGroup
        :css="false"
        @leave="animOnLeave"
      >
        <SvgCircle
          v-for="circle in circles"
          :key="circle.id"
          :circle="circle"
        />
      </TransitionGroup>
    </g>
    <g id="rects">
      <TransitionGroup
        :css="false"
        @leave="animOnLeave"
      >
        <SvgRectangle
          v-for="rect in rects"
          :key="rect.id"
          :rectangle="rect"
        />
      </TransitionGroup>
    </g>
    <g id="marker">
      <marker
        id="arrow"
        viewBox="-10 -5 10 10"
        refX="-9"
        markerWidth="3"
        markerHeight="3"
        orient="auto"
      >
        <path
          d="M0,-5 L-10,0 L0,5"
          fill="#333"
        />
      </marker>
      <marker
        id="backwardArrow"
        viewBox="0 -5 10 10"
        refX="9"
        markerWidth="3"
        markerHeight="3"
        orient="auto"
      >
        <path
          d="M0,-5 L10,0 L0,5"
          fill="#333"
        />
      </marker>
    </g>
  </svg>
</template>

<style lang="scss">
#maingraph {
  display: block;
  width: 100%;
  height: 100%;

  text {
    font-size: 1rem;
    line-height: 1rem;
    font-weight: 700;
    text-anchor: middle;
  }
}
</style>
