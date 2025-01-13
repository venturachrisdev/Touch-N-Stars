<template>
  <div class="top-0 h-16 bg-gray-800 shadow-md">
    <div class="flex inset-x-0 mx-auto max-w-md h-16 items-center justify-around">

      <!-- Buttons mit Sub-Navigation -->
      <div class="relative">
        <router-link 
          to="/equipment" class="nav-button" 
          active-class="active-nav-button"
          :title="$t('components.navigation.equipment')" 
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
            <g fill="none" stroke="black" stroke-width="2">
              <!-- Schraubenschlüssel -->
              <path d="M20 10a6 6 0 1 1 8.5 8.5l-8.5 8.5-6.5-6.5 8.5-8.5z" />
              <rect x="12" y="24" width="6" height="20" rx="3" transform="rotate(45 15 34)" />
            </g>
          </svg>
        </router-link>
      </div>

      <!-- Buttons mit Sub-Navigation -->
      <div class="relative">
        <router-link 
          to="/equipment" 
          class="nav-button" 
          active-class="active-nav-button"
          :title="$t('components.navigation.equipment')" 
          @click="toggleSubNav('equipment')"
          >
          <LinkIcon class="icon" />
        </router-link>
        <div v-if="activeSubNav === 'equipment'" class="subnav">
          <router-link @click="closeSubNav" to="/equipment/item1">Item 1</router-link>
          <router-link @click="closeSubNav" to="/equipment/item2">Item 2</router-link>
          <router-link @click="closeSubNav" to="/equipment/item3">Item 3</router-link>
        </div>
      </div>

      <div class="relative">
        <router-link to="/camera" class="nav-button" active-class="active-nav-button"
          :title="$t('components.navigation.camera')" @click="toggleSubNav('camera')">
          <CameraIcon class="icon" />
        </router-link>
        <div v-if="activeSubNav === 'camera'" class="subnav">
          <router-link @click="closeSubNav" to="/camera/settings">Settings</router-link>
          <router-link @click="closeSubNav" to="/camera/modes">Modes</router-link>
        </div>
      </div>

      <!-- Weitere Buttons mit Sub-Navigation -->
    </div>
  </div>
</template>

<script setup>
import {
  LinkIcon,
  CameraIcon,
  //EyeIcon,
  //ListBulletIcon,
  //Cog6ToothIcon,
} from '@heroicons/vue/24/outline';
import { ref } from 'vue';

const activeSubNav = ref(null);

// Toggle Sub-Navigation
function toggleSubNav(nav) {
  activeSubNav.value = activeSubNav.value === nav ? null : nav;
}

// Sub-Navigation schließen
function closeSubNav() {
  activeSubNav.value = null;
}
</script>

<style scoped>
.nav-button {
  @apply w-12 h-12 border border-cyan-500/20 bg-gray-700 text-white rounded-full hover:bg-gray-600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
  transition: border-radius 0.2s ease, background-color 0.2s ease;
}

.active-nav-button {
  @apply border border-cyan-300/30 bg-cyan-700 rounded-lg;
}

.icon {
  @apply w-6 h-6;
}

.subnav {
  @apply absolute top-full mt-2 bg-gray-700 rounded-lg shadow-md p-2 w-48;
  display: flex;
  flex-direction: column;
}

.subnav a {
  @apply text-white py-1 px-2 hover:bg-gray-600 rounded;
}
</style>
