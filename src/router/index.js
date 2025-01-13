import { createRouter, createWebHistory } from 'vue-router';
import StartPage from '../views/StartPage.vue';
import EquipmentPage from '../views/EquipmentPage.vue';
import CameraPage from '../views/CameraPage.vue';
import FocusPage from '../views/FocusPage.vue';
import MountPage from '../views/MountPage.vue';
import GuidingPage from '../views/GuidingPage.vue';
import TargetPic from '../components/testTest.vue';
import LastLogs from '../components/LastLogs.vue';
import SequencePage from '../views/SequencePage.vue';
import DomePage from '../views/DomePage.vue';
import SettingsPage from '../views/SettingsPage.vue';

const routes = [
  { path: '/', component: StartPage },
  { path: '/equipment', component: EquipmentPage },
  { path: '/camera', component: CameraPage },
  { path: '/autofocus', component: FocusPage },
  { path: '/mount', component: MountPage },
  { path: '/guider', component: GuidingPage },
  { path: '/misc', component: TargetPic },
  { path: '/logs', component: LastLogs },
  { path: '/sequence', component: SequencePage },
  { path: '/dome', component: DomePage },
  { path: '/settings', component: SettingsPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
