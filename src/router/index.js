import { createRouter, createWebHistory } from 'vue-router';
import EquipmentPage from '../views/EquipmentPage.vue';
import CameraPage from '../views/CameraPage.vue';
import FocusPage from '../components/FocusPage.vue';
import MountPage from '../views/MountPage.vue';
import GuidingPage from '../views/GuidingPage.vue';


const routes = [
 
  { path: '/equipment', component: EquipmentPage },
  { path: '/camera', component: CameraPage },
  { path: '/autofocus', component: FocusPage },
  { path: '/mount', component: MountPage },
  { path: '/guider', component: GuidingPage },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
