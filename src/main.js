import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import './assets/tailwind.css'; // Importiert Tailwind CSS
import { createHead } from '@unhead/vue';

const pinia = createPinia();
const head = createHead();

createApp(App).use(pinia).use(head).use(router).mount('#app');
