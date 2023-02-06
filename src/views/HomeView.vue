<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { RouterView } from 'vue-router';
const { t } = useI18n({ useScope: 'local' });
</script>

<template>
  <main>
    <div class="content-wrapper">
      <div class="content-header">
        {{ t('appMenu.linkedList') }}
      </div>
      <RouterView />
    </div>
  </main>
</template>

<style lang="scss">
main {
  display: flex;
}

.content-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0.25rem;
  border-radius: 0.25rem;

  transition: color var(--theme-switch-time), background-color var(--theme-switch-time);
  background-color: var(--bg-color);
}
</style>

<i18n lang="json5" locale="en">
{
  appMenu: {
    linkedList: 'Linked List',
  },
}
</i18n>
<i18n lang="json5" locale="ru">
{
  appMenu: {
    linkedList: 'Связный Список',
  },
}
</i18n>
