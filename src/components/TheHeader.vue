<script setup lang="ts">
import IconSun from '@/components/icons/IconSun.vue';
import IconMoon from '@/components/icons/IconMoon.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { onMounted, Transition } from 'vue';
import { RouterLink } from 'vue-router';

import { useDark, useToggle, useStorage, usePreferredLanguages } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const isDark = useDark();
const toggleDark = useToggle(isDark);

const languages = usePreferredLanguages();
const lang = useStorage<string | {}>('stored-lang', {});

const { locale } = useI18n({ useScope: 'global' });
const { t } = useI18n({ useScope: 'local' });

onMounted(() => {
  if (typeof lang.value === 'object') {
    const isRu = languages.value.length > 0 && (languages.value[0] === 'ru-RU' || languages.value[0] === 'ru');
    lang.value = isRu ? 'ru' : 'en';
  }
  locale.value = lang.value;
});
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">
          {{ t('headerMenu.home') }}
        </RouterLink>
        <RouterLink to="/about">
          {{ t('headerMenu.about') }}
        </RouterLink>
      </nav>
    </div>

    <div class="settings">
      <button
        class="button-svg"
        @click="toggleDark()"
      >
        <span>
          <Transition name="slide-up">
            <IconMoon v-if="isDark" />
            <IconSun v-else />
          </Transition>
        </span>
      </button>
      <select
        v-model="locale"
        class="lang-select"
        @change="lang = locale"
      >
        <option value="ru">ru</option>
        <option value="en">en</option>
      </select>
    </div>
  </header>
</template>

<style lang="scss">
header {
  display: flex;
  flex-direction: row;
  //border-bottom: 1px solid var(--border-color);
  transition: background-color var(--theme-switch-time);
  background-color: var(--app-bg-color);

  @media (min-width: 1024px) {
  }
}

.wrapper {
  margin-left: auto;
}

nav {
  width: 100%;
  text-align: center;

  a {
    font-weight: 300;
    text-decoration: none;
    transition: color 0.25s, background-color 0.25s;

    position: relative;
    display: inline-block;

    font-size: 1.25rem;
    line-height: 3rem;
    padding: 0 1rem;

    &:focus,
    &:hover {
      background: var(--hover-color);
    }
  }

  a:first-of-type {
    border: 0;
  }

  .router-link-active {
    color: var(--border-color);
  }
}

.settings {
  display: flex;
  flex-direction: row;
}

.button-svg {
  border: 0;
  background: transparent;
  width: 3rem;
  height: 3rem;
  transition: background-color 0.25s;

  &:focus,
  &:hover {
    background: var(--hover-color);
  }

  span {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    padding: 0.75rem;

    circle,
    path {
      transition: stroke 0.25s;

      stroke: var(--text-color);
      stroke-width: 1;
    }
  }
}

.lang-select {
  font-size: 1.25rem;
  font-family: inherit;
  font-weight: 300;

  color: var(--text-color);
  padding: 0 0.25rem;
  height: 3rem;
  border: 0;
  outline: 0;
  background: transparent;
  transition: color var(--theme-switch-time), background-color 0.25s;

  &:focus,
  &:hover {
    background: var(--hover-color);
  }
}
</style>

<i18n lang="json5" locale="en">
{
  headerMenu: {
    home: 'Home',
    about: 'About',
  },
}
</i18n>
<i18n lang="json5" locale="ru">
{
  headerMenu: {
    home: 'Главная',
    about: 'О проекте',
  },
}
</i18n>
