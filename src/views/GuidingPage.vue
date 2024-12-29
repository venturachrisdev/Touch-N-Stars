<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md">
      <h5 class="text-xl text-center font-bold text-white mb-4">Guiding</h5>
      <div v-if="!store.guiderInfo.Connected" class="text-red-500">
        <p>Bitte Guider verbinden</p>
      </div>
      <div v-else>
        <!-- Wenn verbunden dann hier der Inhalt -->
        <div class="flex space-x-4">
          <button
            class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
            @click="guiderStartStop('start')"
          >
            Start
          </button>
          <button
            class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
            @click="guiderStartStop('stop')"
          >
            Stop
          </button>
        </div>
        <div class="mt-5">
          <p class="">RMS Fehler in Arcseconds</p>
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
import apiService from "@/services/apiService";
import rmsGraph from '@/components/guider/GuiderGraph.vue';
import { apiStore } from '@/store/store';

const store = apiStore();


async function guiderStartStop(befehl) {
  try {
    await apiService.guiderAction(befehl);
    console.log("Guider Command:", befehl);
  } catch (error) {
    console.error("Fehler:", error.response?.data || error);
  }
}


</script>

<style scoped></style>
