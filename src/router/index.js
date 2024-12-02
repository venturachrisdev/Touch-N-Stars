import { createRouter, createWebHistory } from 'vue-router';
import EquipmentPage from '../views/EquipmentPage.vue';
import CameraPage from '../views/CameraPage.vue';
import FocusPage from '../views/FocusPage.vue';


const routes = [
 
  { path: '/equipment', component: EquipmentPage },
  { path: '/camera', component: CameraPage },
  { path: '/autofocus', component: FocusPage },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
