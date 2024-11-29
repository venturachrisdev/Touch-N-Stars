import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'; // Importiert Tailwind CSS
import { createHead } from '@unhead/vue';
const head = createHead()
createApp(App).use(head).use(router).mount('#app')
