<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue';
//import { watch } from "vue";
import { RouterView } from 'vue-router';
</script>

<template>
  <TheHeader />
  <RouterView />
</template>

<style lang="scss">
@import './assets/style.scss';

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

body {
  display: flex;
  background-color: var(--bg-color);
  justify-content: center;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0;
  flex: 1;

  background: var(--app-border-color);
  transition: background-color var(--theme-switch-time);
}

main {
  flex: 1;
}
</style>
