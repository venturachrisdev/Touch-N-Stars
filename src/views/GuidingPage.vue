<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md">
      <h5 class="text-xl text-center font-bold text-white mb-4">Guiding</h5>
      <div v-if="!isConnected" class="text-red-500">
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
          <p>RA: {{ RmsErrorRaArcseconds }}</p>
          <p>DEC: {{ RmsErrorDecArcseconds }}</p>
          <p>Total: {{ RmsErrorTotalArcseconds }}</p>
        </div>
        <div class="mt-5">
          <rmsGraph />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import apiService from "@/services/apiService";
import rmsGraph from '../components/GuiderGraph.vue';

const isConnected = ref(false);
const RmsErrorRaArcseconds = ref(null);
const RmsErrorDecArcseconds = ref(null);
const RmsErrorTotalArcseconds = ref(null);

let intervalId = null;

async function guiderStartStop(befehl) {
  try {
    await apiService.guiderAction(befehl);
    console.log("Guider Command:", befehl);
  } catch (error) {
    console.error("Fehler:", error.response?.data || error);
  }
}

async function fetchGuiderInfo(initialFetch = false) {
  try {
    const response = await apiService.guiderAction("info");
    if (response.Success) {
      const data = response.Response;
      isConnected.value = data.Connected;
      if (isConnected.value) {
        RmsErrorRaArcseconds.value = parseFloat(data.RMSError.RA.Arcseconds.toFixed(2));
        RmsErrorDecArcseconds.value = parseFloat(data.RMSError.Dec.Arcseconds.toFixed(2));
        RmsErrorTotalArcseconds.value = parseFloat(data.RMSError.Total.Arcseconds.toFixed(2));
      }

      if (initialFetch && isConnected.value) {
        console.log("Initial fetch done.");
      }
    } else {
      console.error("Fehler in der API-Antwort:", response.Error);
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Guider-Informationen:", error);
  }
}

function startFetchingInfo() {
  fetchGuiderInfo(true);
  intervalId = setInterval(() => fetchGuiderInfo(false), 1000);
}

function stopFetchingInfo() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

onMounted(() => {
  startFetchingInfo();
});

onBeforeUnmount(() => {
  stopFetchingInfo();
});
</script>

<style scoped></style>
