import { createApp } from 'vue'
import App from './App.vue'
import store from './store';
import router from './router'
import './assets/tailwind.css'; // Importiert Tailwind CSS
import { createHead } from '@unhead/vue';
const head = createHead()
createApp(App).use(store).use(head).use(router).mount('#app')
