import { createRouter, createWebHistory } from 'vue-router';
import EquipmentPage from '../views/EquipmentPage.vue';
import CameraPage from '../views/CameraPage.vue';
import FocusPage from '../views/FocusPage.vue';
import TppaPage from '../views/TppaPage.vue';


const routes = [
 
  { path: '/equipment', component: EquipmentPage },
  { path: '/camera', component: CameraPage },
  { path: '/autofocus', component: FocusPage },
  { path: '/tppa', component: TppaPage },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
