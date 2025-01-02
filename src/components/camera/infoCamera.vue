<template>

  <div v-if="!store.cameraInfo.Connected" class="text-red-500">
    <p>{{ $t('components.camera.connect') }}</p>
  </div>
  <div v-else-if="showAllInfo" class="gap-2">
    <StatusString :isEnabled="store.cameraInfo.Name" :Name="$t('components.camera.name')" :Value="store.cameraInfo.Name" />
    <StatusString :isEnabled="true" :Name="$t('components.camera.gain')" :Value="store.cameraInfo.Gain" />
    <StatusString :isEnabled="store.cameraInfo.Offset" :Name="$t('components.camera.offset')" :Value="store.cameraInfo.Offset" />
    <StatusString :isEnabled="isTemperatureEnabled" :Name="$t('components.camera.temperature')" :Value="formattedTemperature" />
    <StatusBool class="col-start-1" :isEnabled="store.cameraInfo.IsExposing" :enabledText="$t('components.camera.capture_running')"
      :disabledText="$t('components.camera.standby')" />
    <StatusBool v-if="store.cameraInfo.CanSetTemperature" :isEnabled="store.cameraInfo.CoolerOn"
      :enabledText="$t('components.camera.cooler_on')" :disabledText="$t('components.camera.cooler_off')" />
    <StatusBool v-if="store.cameraInfo.HasDewHeater" :isEnabled="store.cameraInfo.DewHeaterOn"
      :enabledText="$t('components.camera.dew_heater_on')" :disabledText="$t('components.camera.dew_heater_off')" />
  </div>
  <div v-else-if="showOnlyExposing" class="gap-2">
    <StatusBool :isEnabled="store.cameraInfo.IsExposing" enabledText="Aufnahme läuft" disabledText="Kamera standby" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import StatusBool from '@/components/helpers/StatusBool.vue';
import StatusString from '@/components/helpers/StatusString.vue';
import { apiStore } from '@/store/store';

// Props deklarieren
defineProps({
  showAllInfo: Boolean,
  showOnlyExposing: Boolean,
});

const store = apiStore();

// Computed properties für die Temperatur
const isTemperatureEnabled = computed(() => {
  const temp = store.cameraInfo.Temperature;
  if (temp == null || isNaN(temp)) {
    return false; // Temperatur ist nicht gültig
  }
  return true; // Temperatur ist gültig
});
const formattedTemperature = computed(() => {
  const temp = store.cameraInfo.Temperature;
  if (temp == null || isNaN(temp)) {
    return 'N/A'; // Fallback zu 'N/A' bei ungültigen Werten
  }
  return temp.toFixed(2); // Formatierte Temperatur
});


</script>
