<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md">
      <div v-if="!isConnected" class="text-gray-600">
        TPPA nicht verfügbar
      </div>
      <div v-else>
        <h5 class="text-xl text-center font-bold text-white mb-4">
          Three Point Polar Alignment
        </h5>
        <div v-if="!store.cameraInfo.Connected | store.mountInfo.AtPark">
          <p class=" text-red-800">Kamera muss verbunden sein und die Montierung muss ausgeparkt sein</p>
        </div>
        <div v-else class="flex space-x-4">
          <button class="default-button-cyan" @click="startAlignment">
            Start Alignment
          </button>
          <button class="default-button-cyan" @click="stopAlignment">
            Stop Alignment
          </button>
        </div>
        <div v-if="tppaStore.currentMessage" class="mt-10">
          <div v-if="startStop">
            <p>{{ formatMessage(tppaStore.currentMessage.message) }}</p>
          </div>
          <div v-else class="space-y-4">
            <div class="flex space-x-4">
              <p class="w-52"><strong>Altitude Fehler:</strong></p>
              <p>{{ showAltitudeError }}</p>
              <div v-if="showAltitudeError">
                <div v-if="altitudeCorDirectionTop" class="flex flex-row space-x-2">
                  <ArrowUpIcon  class="size-6 text-blue-500" />
                  <p>Up</p>
                </div>
                <div v-else  class="flex flex-row space-x-2"> 
                <ArrowDownIcon class="size-6 text-blue-500" />
                <p>Down</p>
              </div>
              </div>
            </div>
            <div class="flex space-x-4">
              <p class="w-52"><strong>Azimuth Fehler:</strong> </p>
              <p>{{ showAzimuthError }}</p>
              <div v-if="showAzimuthError">
                <div v-if="azimuthCorDirectionLeft" class="flex flex-row space-x-2">
                  <ArrowLeftIcon class="size-6 text-blue-500 " />
                  <p>West</p>
                </div>
                <div v-else class="flex flex-row space-x-2">
                  <ArrowRightIcon class="size-6 text-blue-500" />
                  <p>Ost</p>
                </div>
              </div>
            </div>
            <div class="flex space-x-4">
              <p class="w-52"><strong>Gesamtfehler: </strong></p>
              <p>{{ showTotalError }}</p>
            </div>
            <div v-if="tppaStore.currentMessage" class="mt-20">
              <p style="white-space: pre-wrap;">
                {{ formatMessage(tppaStore.currentMessage.message) }}
              </p>
              <p class="text-xs">
                <strong>Letzte Aktualisierung:</strong> {{ tppaStore.currentMessage.time }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import websocketService from "@/services/websocketTppa";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline';
import { apiStore } from '@/store/store';
import { useTppaStore } from '@/store/tppaStore'; 

const tppaStore = useTppaStore();
const store = apiStore();
const startStop = ref(false);
const isConnected = ref(false);
const showAzimuthError = ref("");
const showAltitudeError = ref("");
const showTotalError = ref("");
const azimuthCorDirectionLeft = ref(false);
const altitudeCorDirectionTop = ref(false);

function decimalToDMS(value) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let degrees = Math.floor(absValue);
  let minutesDecimal = (absValue - degrees) * 60;
  let minutes = Math.floor(minutesDecimal);
  let seconds = Math.round((minutesDecimal - minutes) * 60);

  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }

  if (minutes === 60) {
    minutes = 0;
    degrees++;
  }

  const degreesStr = degrees.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");

  const sign = isNegative ? "-" : "";
  return `${sign}${degreesStr}° ${minutesStr}' ${secondsStr}''`;
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString();
}

function formatMessage(message) {
  if (message.Response) {
    if (typeof message.Response === "string") {
      if (message.Response === "started procedure") {
        console.log("Start TPPA");
        return message.Response;
      }
      startStop.value = true;
      return message.Response;
    } else if (typeof message.Response === "object") {
      startStop.value = false;
      const { AzimuthError, AltitudeError, TotalError } = message.Response;
      if (
        AzimuthError !== undefined &&
        AltitudeError !== undefined &&
        TotalError !== undefined
      ) {
        const azimuthErrorDMS = decimalToDMS(AzimuthError);
        const altitudeErrorDMS = decimalToDMS(AltitudeError);
        const totalErrorDMS = decimalToDMS(TotalError);

        showAzimuthError.value = azimuthErrorDMS;
        showAltitudeError.value = altitudeErrorDMS;
        showTotalError.value = totalErrorDMS;

        azimuthCorDirectionLeft.value = AzimuthError > 0 ? true : false;
        altitudeCorDirectionTop.value = AltitudeError < 0 ? true : false;
      } else {
        return "Fehlerwerte nicht vorhanden.";
      }
    } else {
      return "Unbekanntes Response-Format.";
    }
  } else {
    return JSON.stringify(message, null, 2);
  }
}

function startAlignment() {
  console.log("Sende 'start-alignment' an den Server");
  websocketService.sendMessage("start-alignment");
}

function stopAlignment() {
  console.log("Sende 'stop-alignment' an den Server");
  websocketService.sendMessage("stop-alignment");
}

onMounted(() => {
  websocketService.setStatusCallback((status) => {
    console.log("Status aktualisiert:", status);
    isConnected.value = (status === "Verbunden");
    tppaStore.isConnected = isConnected.value;
  });

  websocketService.setMessageCallback((message) => {
    console.log("Neue Nachricht erhalten:", message);
    tppaStore.currentMessage = {
      message: message,
      time: getCurrentTime(),
    };
  });

  websocketService.connect();
});

onBeforeUnmount(() => {
  websocketService.setStatusCallback(null);
  websocketService.setMessageCallback(null);
});
</script>

<style scoped></style>
