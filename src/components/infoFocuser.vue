<template>
  <div v-if="!isConnected" class="text-red-500">
    <p>Bitte Fokusierer verbinden</p>
  </div>
  <div v-else class="gap-2">
    <StatusString :isEnabled="currentPosition" Name="Aktuelle Position:" :Value="currentPosition" />
    <StatusString :isEnabled="temperature" Name="Temperatur:" :Value="temperature" />
    <StatusBool class="col-start-1" :isEnabled="!isMoving" enabledText="Bewegt sich" disabledText="Steht" />
    <StatusBool :isEnabled="isSettling" enabledText="Backlash Korrektur" disabledText="Backlash Korrektur" />
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import apiService from "@/services/apiService";
import StatusBool from '../components/StatusBool.vue';
import StatusString from '../components/StatusString.vue';

const { modelValue } = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const currentPosition = ref(null);
const temperature = ref(null);
const isMoving = ref(false);
const isSettling = ref(false);
const isConnected = ref(false);

let intervalId = null;

async function fetchInfo() {
  try {
    const response = await apiService.focusAction("info");
    if (response.Success) {
      const data = response.Response;
      isConnected.value = data.Connected;
      currentPosition.value = data.Position;
      temperature.value = data.Temperature.toFixed(2);
      isMoving.value = data.IsMoving;
      isSettling.value = data.IsSettling;
      emit("update:modelValue", isConnected.value);
    } else {
      console.error("Fehler in der API-Antwort:", response.Error);
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Fokussierer-Informationen:", error);
  }
}

function startFetchingInfo() {
  intervalId = setInterval(fetchInfo, 1000);
}

function stopFetchingInfo() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

watch(isConnected, (newVal) => {
  emit("update:modelValue", newVal);
});

onMounted(async () => {
  await fetchInfo();
  startFetchingInfo();
});

onBeforeUnmount(() => {
  stopFetchingInfo();
});
</script>
