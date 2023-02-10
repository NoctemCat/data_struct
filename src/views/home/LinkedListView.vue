<script setup lang="ts">
import SvgCanvas from '@/components/SvgCanvas.vue';

import { useShapesStore } from '@/stores/shapes';
import { storeToRefs } from 'pinia';
import OperationsTablist from '@/components/OperationsTablist.vue';
import CreateTab from '@/components/linkedlisttabs/CreateTab.vue';
import InsertTab from '@/components/linkedlisttabs/InsertTab.vue';
import SearchTab from '@/components/linkedlisttabs/SearchTab.vue';
import RemoveTab from '@/components/linkedlisttabs/RemoveTab.vue';
import { useI18n } from 'vue-i18n';
import { useShapesHistory } from '@/stores/shapesHistory';
import { computed } from 'vue';
import { useTimelineStore } from '@/stores/timeline';

const { commit, history, reset, undo, redo, clear, parseHistory } = useShapesHistory();

const { t } = useI18n({ useScope: 'local' });

//const { circles, rects, edges } = storeToRefs(useShapesStore());
const { circles, rects, edges } = storeToRefs(useTimelineStore());
//const { circleFuncs, rectsFuncs, edgeFuncs, printState } = useShapesStore();

//console.log(history.value[0].snapshot);

//const parsedHistory = computed(() => parseHistory(history.value[0].snapshot as unknown as string));
//const circlesHistory = computed(() => parsedHistory.value.circles);
//const rectsHistory = computed(() => parsedHistory.value.rects);
//const edgesHistory = computed(() => parsedHistory.value.edges);
</script>

<template>
  <div class="content-body">
    <SvgCanvas
      :circles="circles"
      :rects="rects"
      :edges="edges"
    />
  </div>
  <div class="content-controls">
    <OperationsTablist
      :buttons="[t('linkedList.create'), t('linkedList.search'), t('linkedList.insert'), t('linkedList.remove')]"
      :components="[CreateTab, SearchTab, InsertTab, RemoveTab]"
    />
  </div>
</template>

<style lang="scss" scoped>
.content-body {
  flex: 1;
}

.content-controls {
  position: relative;
  display: grid;
  max-width: 64rem;
}
</style>

<i18n lang="json5" locale="en">
{
  linkedList: {
    create: 'Create',
    search: 'Search',
    insert: 'Insert',
    remove: 'Remove',
    random: 'Random',
  },
}
</i18n>
<i18n lang="json5" locale="ru">
{
  linkedList: {
    create: 'Создать',
    search: 'Найти',
    insert: 'Вставить',
  },
}
</i18n>
