<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md">
      <h5 class="text-xl text-center font-bold text-white mb-4">
        {{ $t('components.guider.title') }}
      </h5>
      <div
        v-if="!store.guiderInfo.Connected"
        class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
      >
        <p class="text-red-400 font-medium text-center">{{ $t('components.guider.connect') }}</p>
      </div>
      <div v-else>
        <!-- Wenn verbunden dann hier der Inhalt -->
        <div class="flex space-x-4">
          <button
            class="btn-primary bg-gradient-to-br w-full from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="store.guiderInfo.State == 'Guiding'"
            @click="guiderStartStop('start')"
          >
            {{ $t('components.guider.start') }}
          </button>
          <button
            class="btn-primary bg-gradient-to-br w-full from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="store.guiderInfo.State !== 'Guiding'"
            @click="guiderStartStop('stop')"
          >
            {{ $t('components.guider.stop') }}
          </button>
        </div>
        <div class="mt-5">
          <p class="">{{ $t('components.guider.rms_error') }}</p>
          <p>RA: {{ store.guiderInfo.RMSError.Dec.Arcseconds.toFixed(2) }}</p>
          <p>DEC: {{ store.guiderInfo.RMSError.RA.Arcseconds.toFixed(2) }}</p>
          <p>Total: {{ store.guiderInfo.RMSError.Total.Arcseconds.toFixed(2) }}</p>
        </div>
        <div class="mt-5">
          <rmsGraph />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import apiService from '@/services/apiService';
import rmsGraph from '@/components/guider/GuiderGraph.vue';
import { apiStore } from '@/store/store';

const store = apiStore();

async function guiderStartStop(befehl) {
  try {
    await apiService.guiderAction(befehl);
    console.log('Guider Command:', befehl);
  } catch (error) {
    console.error('Fehler:', error.response?.data || error);
  }
}
</script>

<style scoped></style>
