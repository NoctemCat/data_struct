import { createApp, reactive, watch } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import router from './router';
import type { ScreenInfo } from './utility/types';
import { ScreenInfoKey } from './utility/symbols';
import { convertRemToPixels } from './utility/functions';
import { usePiniaHistory } from './stores/history';

const screen = reactive<ScreenInfo>({
  width: window.innerWidth,
  height: window.innerHeight,
  rem: convertRemToPixels(1),
});

window.addEventListener('resize', () => {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  screen.rem = convertRemToPixels(1);
});

const i18n = createI18n({
  locale: 'ru',
  fallbackLocale: 'en',
});

const app = createApp(App);

const store = createPinia();

app.use(store);
app.use(router);
app.use(i18n);

app.mount('#app');

app.provide(ScreenInfoKey, screen);

const emp = usePiniaHistory();
