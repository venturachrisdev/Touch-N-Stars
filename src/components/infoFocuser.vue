<template>
  <div v-if="!store.focuserInfo.Connected" class="text-red-500">
    <p>Bitte Fokusierer verbinden</p>
  </div>
  <div v-else class="gap-2">
    <StatusString :isEnabled="store.focuserInfo.Position" Name="Aktuelle Position:" :Value="store.focuserInfo.Position" />
    <StatusString :isEnabled="store.focuserInfo.temperature" Name="Temperatur:" :Value="store.focuserInfo.temperature" />
    <StatusBool :isEnabled="store.focuserInfo.IsMoving" enabledText="Bewegt sich" disabledText="Steht" />
  </div>
</template>

<script setup>

import StatusBool from '../components/StatusBool.vue';
import StatusString from '../components/StatusString.vue';

import { apiStore } from '@/store/store';
const store = apiStore();

defineProps({
  modelValue: Boolean,
});




</script>
