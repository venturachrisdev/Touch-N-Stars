<template>
  <button
    class="btn-primary bg-gradient-to-br w-full from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="store.guiderInfo.State == 'Guiding' || store.guiderInfo.State == 'Calibrating'"
    @click="guiderStartStop('start')"
  >
    {{ $t('components.guider.start') }}
  </button>
  <button
    class="btn-primary bg-gradient-to-br w-full from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="store.guiderInfo.State == 'Guiding' || store.guiderInfo.State == 'Calibrating'"
    @click="guiderStartWithCal()"
  >
    {{ $t('components.guider.startWithCal') }}
  </button>
  <button
    class="btn-primary bg-gradient-to-br w-full from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
    :disabled="store.guiderInfo.State !== 'Guiding' && store.guiderInfo.State !== 'Calibrating'"
    @click="guiderStartStop('stop')"
  >
    {{ $t('components.guider.stop') }}
  </button>
</template>
<script setup>
import apiService from '@/services/apiService';
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

async function guiderStartWithCal() {
  try {
    await apiService.guiderStart(true);
    console.log('Guider Command: Start with cal');
  } catch (error) {
    console.error('Fehler:', error.response?.data || error);
  }
}
</script>
