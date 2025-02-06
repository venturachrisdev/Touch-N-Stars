<template>
  <div class="flex flex-col border border-gray-500 p-1 pb-2 rounded-lg">
    <label for="gain" class="text-xs mb-1 text-gray-400">Binning</label>
    <select
      @change="setBinnig"
      id="binning"
      v-model="binningStore.binningMode"
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
import { useCameraStore } from '@/store/cameraStore';
import apiService from '@/services/apiService';

const store = apiStore();
const binningStore = useCameraStore();

onMounted(() => {
  initializeBinningMode();
});

// Setzt den initialen Binning Mode aus BinX und BinY
const initializeBinningMode = () => {
  if (!store.cameraInfo) {
    console.warn("Kamera-Info nicht geladen");
    return;
  }

  const binX = store.cameraInfo.BinX ?? 1; // Falls undefined -> Standardwert 1
  const binY = store.cameraInfo.BinY ?? 1;
  const binningMode = `${binX}x${binY}`;

  // Überprüfen, ob dieser Binning-Mode in den verfügbaren Optionen existiert
  const availableModes = store.cameraInfo.BinningModes.map(mode => mode.Name);
  binningStore.binningMode = availableModes.includes(binningMode) ? binningMode : "1x1";
};

// Wird aufgerufen, wenn der Benutzer einen neuen Binning Mode auswählt
const setBinning = (event) => {
  console.log("Binning Mode geändert:", event.target.value);
  binningStore.binningMode = event.target.value;
};

async function setBinnig() {
  console.log('Set binning to: ', binningStore.binningMode);
  try {
    const data = await apiService.setBinningMode(binningStore.binningMode);
    console.log(data);
  } catch (error) {
    console.log('Fehler beim setzten des binning');
  }
}
</script>
