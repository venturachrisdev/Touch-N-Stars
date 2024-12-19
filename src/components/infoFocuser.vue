<template>
  <div v-if="!store.focuserInfo.Connected" class="text-red-500">
    <p>Bitte Fokusierer verbinden</p>
  </div>
  <div v-else class="gap-2">
    <StatusString :isEnabled="store.focuserInfo.Position" Name="Aktuelle Position:" :Value="store.focuserInfo.Position" />
    <StatusString :isEnabled="isTemperatureEnabled" Name="Temperatur:" :Value="formattedTemperature" />
    <StatusBool :isEnabled="store.focuserInfo.IsMoving" enabledText="Bewegt sich" disabledText="Steht" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import StatusBool from '../components/StatusBool.vue';
import StatusString from '../components/StatusString.vue';

import { apiStore } from '@/store/store';
const store = apiStore();

// Computed properties für die Temperatur
const isTemperatureEnabled = computed(() => {
  const temp = store.focuserInfo.Temperature;
  if (temp == null || isNaN(temp)) {
    return false; // Temperatur ist nicht gültig
  }
  return true; // Temperatur ist gültig
});
const formattedTemperature = computed(() => {
  const temp = store.focuserInfo.Temperature;
  if (temp == null || isNaN(temp)) {
    return 'N/A'; // Fallback zu 'N/A' bei ungültigen Werten
  }
  return temp.toFixed(2); // Formatierte Temperatur
});




</script>
