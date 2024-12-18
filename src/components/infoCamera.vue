<template>
    <div v-if="!isConnected" class="text-red-500">
      <p>Bitte Kamera verbinden</p>
    </div>
    <div v-else-if="showAllInfo" class="gap-2">
      <StatusString :isEnabled="Name" Name="Name:" :Value="Name" />
      <StatusString :isEnabled="Gain" Name="Gain:" :Value="Gain" />
      <StatusString :isEnabled="Offset" Name="Offset:" :Value="Offset" />
      <StatusString :isEnabled="XSize" Name="X-Size:" :Value="XSize" />
      <StatusString :isEnabled="YSize" Name="Y-Size:" :Value="YSize" />
      <StatusString :isEnabled="PixelSize" Name="Pixel-Size:" :Value="PixelSize" />
      <StatusString :isEnabled="CanSetTemperature" Name="Aktuelle Temperatur:" :Value="Temperature" />
      <StatusBool class="col-start-1" :isEnabled="IsExposing" enabledText="Aufnahme läuft" disabledText="Kamera standby" />
      <StatusBool v-if="CanSetTemperature" :isEnabled="CoolerOn" enabledText="Kühler aktiv" disabledText="Kühler aus" />
      <StatusBool v-if="CanSetTemperature" :isEnabled="DewHeaterOn" enabledText="Tauheizung aktiv" disabledText="Tauheizung aus" />
    </div>
    <div v-else-if="showOnlyExposing" class="gap-2">
      <StatusBool :isEnabled="IsExposing" enabledText="Aufnahme läuft" disabledText="Kamera standby" />
    </div>
  </template>
  
  <script setup>
  /* eslint-disable */
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
  import apiService from "@/services/apiService";
  import StatusBool from '../components/StatusBool.vue';
  import StatusString from '../components/StatusString.vue';
  
  const { modelValue, showAllInfo, showOnlyExposing } = defineProps({
    modelValue: Boolean,
    showAllInfo: Boolean,
    showOnlyExposing: Boolean,
  })
  
  const emit = defineEmits(['update:modelValue']);
  
  const isConnected = ref(false);
  const CanSetTemperature = ref(false);
  const CoolerOn = ref(false);
  const DewHeaterOn = ref(false);
  const IsExposing = ref(false);
  const Temperature = ref(null);
  const Gain = ref(null);
  const Offset = ref(null);
  const XSize = ref(null);
  const YSize = ref(null);
  const PixelSize = ref(null);
  const TemperatureSetPoint = ref(null);
  const ExposureEndTime = ref(null);
  const Name = ref(null);
  
  let intervalId = null;
  
  async function fetchInfo() {
    try {
      const response = await apiService.cameraAction("info");
      if (response.Success) {
        const data = response.Response;
        isConnected.value = data.Connected;
        CanSetTemperature.value = data.CanSetTemperature;
        CoolerOn.value = data.CoolerOn;
        DewHeaterOn.value = data.DewHeaterOn;
        IsExposing.value = data.IsExposing;
        Temperature.value = data.Temperature;
        Gain.value = data.Gain;
        Offset.value = data.Offset;
        XSize.value = data.XSize;
        YSize.value = data.YSize;
        PixelSize.value = data.PixelSize;
        TemperatureSetPoint.value = data.TemperatureSetPoint;
        ExposureEndTime.value = data.ExposureEndTime;
        Name.value = data.Name;
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
  