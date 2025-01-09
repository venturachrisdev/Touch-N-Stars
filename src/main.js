import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import './assets/tailwind.css'; // Importiert Tailwind CSS
import { createHead } from '@unhead/vue';
import i18n from './i18n';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
const head = createHead();

createApp(App).use(pinia).use(head).use(i18n).use(router).mount('#app');
