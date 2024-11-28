import { createRouter, createWebHistory } from 'vue-router';
import EquipmentPage from '../views/EquipmentPage.vue';


const routes = [
  { path: '/', redirect: '/equipment' },
  { path: '/equipment', component: EquipmentPage },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
