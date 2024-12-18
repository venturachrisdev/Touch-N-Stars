<template>
    <div v-if="!isConnected" class="text-red-500">
      <p>Bitte Montierung verbinden</p>
    </div>
    <div v-else class="gap-2">
      <StatusBool :isEnabled="!parkPosition" enabledText="Ausgeparkt" disabledText="Geparkt" />
      <StatusBool :isEnabled="TrackingEnabled" enabledText="Tracking ist aktiv" disabledText="Tracking deaktiviert" />
      <StatusBool :isEnabled="Slewing" enabledText="Montierung schwenkt" disabledText="Schwenkt nicht" />
    </div>
  </template>
  
  <script setup>
  /* eslint-disable */
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
  import apiService from "@/services/apiService";
  import StatusBool from '../components/StatusBool.vue';
  
  const { modelValue } = defineProps({
    modelValue: Boolean,
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const parkPosition = ref(true);
  const TrackingEnabled = ref(false);
  const Slewing = ref(false);
  const isConnected = ref(false);
  
  let intervalId = null;
  
  async function fetchInfo() {
    try {
      const response = await apiService.mountAction("info");
      if (response.Success) {
        const data = response.Response;
        isConnected.value = data.Connected;
        parkPosition.value = data.AtPark;
        TrackingEnabled.value = data.TrackingEnabled;
        Slewing.value = data.Slewing;
      } else {
        isConnected.value = false;
        console.error("Fehler in der API-Antwort:", response.Error);
      }
    } catch (error) {
      isConnected.value = false;
      console.error("Fehler beim Abrufen der Mount-Informationen:", error);
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
    isConnected.value = true;
    await fetchInfo();
    startFetchingInfo();
  });
  
  onBeforeUnmount(() => {
    stopFetchingInfo();
  });
  </script>
  