<template>
  <div v-if="!store.sequenceIsLoaded" class="text-red-500">
    <p>{{ $t('components.sequence.noSequenceLoaded') }}</p>
  </div>
  <div v-else class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Title -->
      <h1 class="text-3xl text-center font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        {{ $t('components.sequence.title') }}
      </h1>

      <!-- Toggle Buttons -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 mb-8">
        <div class="flex gap-2">
          <button 
            @click="toggleShowSequenz"
            class="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-300"
            :class="{
              'bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-500/20': showSequenz,
              'bg-gray-700/50 hover:bg-gray-700/70': !showSequenz
            }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clip-rule="evenodd" />
              <path d="M6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 10a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM6 13a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
            </svg>
            {{ $t('components.sequence.title') }}
          </button>
          
          <button 
            @click="toggleShowSeqStats"
            class="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-300"
            :class="{
              'bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-500/20': showSeqStats,
              'bg-gray-700/50 hover:bg-gray-700/70': !showSeqStats
            }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            {{ $t('components.sequence.stats') }}
          </button>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="space-y-8">
        <transition name="fade">
          <div v-show="showSequenz" class="space-y-8">
            <controlSequence />
            <infoSequence />
          </div>
        </transition>

        <transition name="fade">
          <sequenceStats v-show="showSeqStats" />
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

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
  } catch (error) {
    console.error('Fehler beim Abrufen von WSHV-Daten:', error);
  }
});
</script>
