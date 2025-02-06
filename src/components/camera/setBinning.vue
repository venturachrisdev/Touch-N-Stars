<template>
    <div>
      <label for="binning" class="block text-sm font-medium text-gray-700">Binning Mode</label>
      <select
        id="binning"
        v-model="settingsStore.camera.binningMode"
        class="mt-1 text-black block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option v-for="mode in store.cameraInfo.BinningModes" :key="mode.Name" :value="mode.Name">
          {{ mode.Name }}
        </option>
      </select>
    </div>
  </template>
  
  <script setup>
  import { onMounted, watch } from 'vue';
  import { apiStore } from '@/store/store';
  import { useSettingsStore } from '@/store/settingsStore';
  
  const store = apiStore();
  const settingsStore = useSettingsStore();
  
  onMounted(() => {
    checkBinningMode();
  });
  
  const checkBinningMode = () => {
    if (!store.cameraInfo || !store.cameraInfo.BinningModes) {
    return; // Falls die Daten noch nicht geladen sind, nichts tun
  }
    const availableModes = store.cameraInfo.BinningModes.map(mode => mode.Name);
  
    if (!availableModes.includes(settingsStore.camera.binningMode)) {
      settingsStore.camera.binningMode = "1x1"; // Standardmodus setzen
    }
  };
  
  </script>
  