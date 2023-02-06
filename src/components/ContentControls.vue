<script setup lang="ts">
import IconClose from '@/components/icons/IconClose.vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { computed, nextTick, ref, toRef, toRefs, Transition, watch } from 'vue';
import gsap from 'gsap';
import { injectStrict } from '@/utility/functions';
import { ScreenInfoKey } from '@/utility/symbols';
import { useMouse } from '@vueuse/core';

const props = defineProps<{ buttons: string[]; componentNames: {}[] }>();
const buttonNames = toRef(props, 'buttons');
const tabs = toRef(props, 'componentNames');

const { rem } = toRefs(injectStrict(ScreenInfoKey));
const { x: xMouse, y: yMouse } = useMouse();

const currentTab = ref<number | undefined>();

const operations = ref<HTMLDivElement | null>(null);
// All keys must be doubled
const currentlyHovering = ref({
  operations: false,
});
const menuRefs = {
  operations: operations,
};

const mouseEnter = (el: MouseEvent | TouchEvent) => {
  const menuId = (el.currentTarget as HTMLDivElement).getAttribute('data-menu-id');

  if (menuId && Object.hasOwn(currentlyHovering.value, menuId)) {
    currentlyHovering.value[menuId as keyof typeof currentlyHovering.value] = true;
  }
};
const mouseLeave = (el: MouseEvent | TouchEvent) => {
  const menuId = (el.currentTarget as HTMLDivElement).getAttribute('data-menu-id');

  if (menuId && Object.hasOwn(currentlyHovering.value, menuId)) {
    currentlyHovering.value[menuId as keyof typeof currentlyHovering.value] = false;
    gsap.to(menuRefs[menuId as keyof typeof menuRefs].value, {
      '--top-val': '0.125rem',
      '--left-val': '-0.125rem',
      duration: 0.2,
    });
  }
};

const controlsSelected = ref<HTMLButtonElement | null>(null);
const topControlEnter = (el: MouseEvent | TouchEvent | FocusEvent) => {
  const current = el.currentTarget as HTMLButtonElement;
  if (controlsSelected.value && !current.classList.contains('hidden')) {
    const box = current.getBoundingClientRect();
    const buttonStyle = getComputedStyle(current);

    const padding = buttonStyle.padding.substring(0, buttonStyle.padding.indexOf('px'));
    const appMargin = rem.value / 4;
    const newLeft = box.x - parseFloat(padding) / 2 + appMargin;

    gsap.to(controlsSelected.value, {
      left: newLeft,
      width: box.width,
      duration: 0.2,
    });
  }
};

const closeControls = ref<HTMLButtonElement | null>(null);
const controlsContent = ref<HTMLDivElement | null>(null);
const selectCategory = (index: number) => {
  closeControls.value?.classList.remove('hidden');
  closeControls.value?.classList.add('shown');
  closeControls.value?.removeAttribute('hidden');

  if (controlsContent.value) {
    //const arrayChildren = Array.from(controlsContent.value.children);
    //arrayChildren.forEach((el) => {
    //  //el.setAttribute('style', 'display: gone;');
    //  el.setAttribute('hidden', '');
    //});
    //const showTab = arrayChildren[index];

    //console.log(showTab);
    //showTab.removeAttribute('style');
    //showTab.removeAttribute('hidden');
    currentTab.value = index;
    console.log(currentTab.value);
    nextTick(() => {
      controlsContent.value!.style.maxHeight = controlsContent.value!.scrollHeight + 'px';
    });
  }
};

const closeControlsFun = (_el: MouseEvent | TouchEvent) => {
  closeControls.value?.classList.remove('shown');
  closeControls.value?.classList.add('hidden');

  if (controlsContent.value) {
    controlsContent.value.style.maxHeight = '';
  }
};

watch([xMouse, yMouse], (_) => {
  for (const [key, value] of Object.entries(currentlyHovering.value)) {
    if (value) {
      const elRef = menuRefs[key as keyof typeof menuRefs].value;

      if (!elRef) return;

      const { x, y, width, height } = elRef.getBoundingClientRect();

      const xIn = xMouse.value - x;
      const yIn = yMouse.value - y;

      //* 20 - 10
      const constraint = 0.24;
      let xPercent = (xIn / width) * constraint - constraint / 2;
      let yPercent = (yIn / height) * constraint - constraint / 2;

      xPercent = xPercent >= -constraint / 2 ? xPercent : -constraint / 2;
      xPercent = xPercent <= constraint / 2 ? xPercent : constraint / 2;

      yPercent = yPercent >= -constraint / 2 ? yPercent : -constraint / 2;
      yPercent = yPercent <= constraint / 2 ? yPercent : constraint / 2;

      elRef.setAttribute('style', `--top-val: ${yPercent}rem; --left-val: ${xPercent}rem`);
    }
  }
});

//const CreateTab = defineAsyncComponent(() => import(`@/views/home/${componentNames.value[0]}.vue`));
//CreateTab
//const children = componentNames.value.map((name) => resolveComponent(name));
const activeTab = computed(() => (typeof currentTab.value === 'number' ? tabs.value[currentTab.value] : undefined));
</script>

<template>
  <div class="content-controls">
    <div
      class="operations"
      role="tablist"
      aria-label="Operations Tabs"
    >
      <div
        ref="operations"
        class="white-grad"
        data-menu-id="operations"
        style="--top-val: 0.125rem; --left-val: -0.125rem"
        @mouseenter="mouseEnter"
        @mouseleave="mouseLeave"
        @touchstart="mouseEnter"
        @touchend="mouseLeave"
      >
        <ul class="controls-buttons">
          <li
            v-for="(name, index) in buttonNames"
            :key="name"
          >
            <button
              :id="`button-tab-${index}`"
              role="tab"
              aria-selected="false"
              :aria-controls="`control-tab-${index}`"
              tabindex="-1"
              @mouseenter="topControlEnter"
              @focus="topControlEnter"
              @click="selectCategory(index)"
            >
              <span>{{ name }}</span>
            </button>
          </li>
        </ul>

        <button
          id="closeCotrols"
          ref="closeControls"
          class=""
          hidden
          @mouseenter="topControlEnter"
          @focus="topControlEnter"
          @click="closeControlsFun"
        >
          <IconClose />
        </button>
        <div
          id="controlsSelected"
          ref="controlsSelected"
        ></div>
      </div>

      <div
        ref="controlsContent"
        class="cotrols-content"
      >
        <Transition
          name="controls-content"
          mode="out-in"
        >
          <template v-if="activeTab">
            <component
              :is="activeTab"
              :id="`control-tab-${currentTab}`"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="`button-tab-${currentTab}`"
            ></component>
          </template>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-controls {
  position: relative;
  display: grid;
  //grid-template-columns: 3fr 1fr;
  max-width: 64rem;

  .white-grad {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background: var(--app-border-color);
    border-radius: 2.5% / 50% 0 50% 0;
    border-radius: 0;
    position: relative;
    z-index: 0;
    transition: background-color var(--theme-switch-time);
    overflow: hidden;

    &::before {
      transition: background-color var(--theme-switch-time);
      background-color: var(--bg-color);
      content: '';
      position: absolute;
      width: calc(100% - 0.25rem);
      height: calc(100% - 0.25rem);
      border-radius: 2.5% / 50% 0 50% 0;
      pointer-events: none;
      translate: var(--left-val) var(--top-val);
    }

    &:hover {
      transition: 0.25s;
    }
  }
  #controlsSelected {
    position: absolute;
    width: 4rem;
    height: 100%;

    top: 0;
    left: -150%;
    content: '';
    backdrop-filter: invert(1);
    pointer-events: none;
  }

  .controls-buttons {
    display: flex;
    flex-direction: row;

    button {
      background: transparent;
      font-family: inherit;
      box-sizing: content-box;
      border: 0;
      margin: 0;
      padding: 0.75rem 2rem;
      color: var(--text-color);

      font-size: 1.25rem;
    }
  }
}

.accordion {
  outline: none;
  cursor: pointer;
}

#closeCotrols {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  aspect-ratio: 1;
  background: transparent;
  border: 0;
  padding: 0.75rem;

  :deep(svg) {
    path {
      fill: transparent;
      stroke: var(--text-color);
      stroke-width: 1.5;

      stroke-dasharray: 100;
      stroke-dashoffset: 100;
    }
  }
}
.hidden {
  :deep(svg) {
    path {
      animation: hide 1s var(--power3-out) forwards;
    }

    @keyframes hide {
      from {
        stroke-dashoffset: 0;
      }
      to {
        stroke-dashoffset: 100;
      }
    }
  }
}

.shown {
  :deep(svg) {
    path {
      animation: show 1s var(--power3-in) forwards;
    }

    @keyframes show {
      from {
        stroke-dashoffset: 100;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  }
}

.cotrols-content {
  max-height: 0;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  background: var(--bg-color);
}

.controls-content-enter-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.controls-content-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.controls-content-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.controls-content-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
