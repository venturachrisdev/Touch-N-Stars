<template>
  <div class="container">
    <h1 class="text-xl text-center font-bold mb-5">{{ $t('components.sequence.title') }}</h1>
    <div v-if="wshvAktiv" class="container flex flex-col w-full">
      <!-- Weiße Linie -->
      <div class="w-full h-[2px] bg-gray-300 mb-0"></div>
      <!-- Buttons links ausrichten -->
      <div class="flex justify-start mb-3">
        <button class="border-2 border-gray-500 rounded-b-md w-24 h-10"
          :class="{ 'bg-gray-600': showSequenz, 'bg-gray-800': !showSequenz }" @click="toggleShowSequenz">
          {{ $t('components.sequence.title') }}
        </button>
        <button class="border-2 border-gray-500 rounded-b-md w-24 h-10"
          :class="{ 'bg-gray-600': showWshv, 'bg-gray-800': !showWshv }" @click="toggleShowWshv">
          {{ $t('components.sequence.wshv') }}
        </button>
      </div>
    </div>
    <div v-show="showSequenz">
      <controlSequence />
      <infoSequence />
    </div>
    <wshvFrame v-if="wshvAktiv" v-show="showWshv" :src="wshvUrl" />
  </div>
</template>


<script setup>
import infoSequence from '@/components/sequence/infoSequence.vue';
import controlSequence from '@/components/sequence/controlSequence.vue';
import wshvFrame from '@/components/sequence/wshvFrame.vue';
import apiService from '@/services/apiService';
import { onBeforeMount, ref } from 'vue';

// Reaktiver Zustand
const wshvAktiv = ref(false);
const wshvUrl = ref("http://localhost:80/dist");
const showSequenz = ref(true);
const showWshv = ref(false);

function toggleShowSequenz() {
  showSequenz.value = !showSequenz.value;
  if (showSequenz.value) {
    showSequenz.value = true;
    showWshv.value = false;
  }
}
function toggleShowWshv() {
  showWshv.value = !showWshv.value;
  if (showWshv.value) {
    showSequenz.value = false;
    showWshv.value = true;
  }
}

// API-Daten abrufen
onBeforeMount(async () => {
  try {
    const data = await apiService.getWshv();
    wshvAktiv.value = data.wshvAktiv;
    wshvUrl.value = `http://${window.location.hostname}:${data.wshvPort}/dist`;
    //console.log(wshvUrl.value);
  } catch (error) {
    console.error('Fehler beim Abrufen von WSHV-Daten:', error);
  }
});
</script>
