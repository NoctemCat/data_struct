<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'local' });
</script>

<template>
  <div class="about">
    <h1>{{ t('about') }}</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "about": "This is an about page"
  },
  "ru": {
    "about": "Это страница о нас"
  }
}
</i18n>
