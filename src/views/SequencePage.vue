<template>
  <div v-if="!store.sequenceIsLoaded" class="text-red-500">
        <p>{{ $t('components.sequence.noSequenceLoaded') }}</p>
    </div>
  <div v-else class="container">
    <h1 class="text-xl text-center font-bold mb-5">{{ $t('components.sequence.title') }}</h1>
    <div v-if="true" class="container flex flex-col w-full">
      <!-- Weiße Linie -->
      <div class="w-full h-[2px] bg-gray-300 mb-0"></div>
      <!-- Buttons links ausrichten -->
      <div class="text-sm flex justify-between space-x-2 p-1 pb-3">
        <button class="border-2 border-gray-500 rounded-md h-10 flex-1"
          :class="{ 'bg-gray-600': showSequenz, 'bg-gray-800': !showSequenz }" @click="toggleShowSequenz">
          {{ $t('components.sequence.title') }}
        </button>
        <button class="border-2 border-gray-500 rounded-md h-10 flex-1"
          :class="{ 'bg-gray-600': showSeqStats, 'bg-gray-800': !showSeqStats }" @click="toggleShowSeqStats">
          {{ $t('components.sequence.stats') }}
        </button>
      </div>
    </div>
    <div v-show="showSequenz">
      <controlSequence />
      <infoSequence />
    </div>
    <sequenceStats v-show="showSeqStats" />
  </div>
</template>


<script setup>
import infoSequence from '@/components/sequence/infoSequence.vue';
import controlSequence from '@/components/sequence/controlSequence.vue';
import sequenceStats from '@/components/sequence/sequenceStats.vue';
import apiService from '@/services/apiService';
import { onBeforeMount, ref } from 'vue';
import { apiStore } from '@/store/store';

const store = apiStore();

// Reaktiver Zustand
const wshvAktiv = ref(false);
const wshvUrl = ref("http://localhost:80/dist");
const showSequenz = ref(true);
const showSeqStats = ref(false);

function toggleShowSequenz() {
  showSequenz.value = !showSequenz.value;
  if (showSequenz.value) {
    showSequenz.value = true;
    showSeqStats.value = false;
  }
}
function toggleShowSeqStats() {
  showSeqStats.value = !showSeqStats.value;
  if (showSeqStats.value) {
    showSequenz.value = false;
    showSeqStats.value = true;
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
