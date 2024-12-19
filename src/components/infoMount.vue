<template>
    <div v-if="!store.mountInfo.Connected" class="text-red-500">
      <p>Bitte Montierung verbinden</p>
    </div>
    <div v-else class="gap-2">
      <StatusBool :isEnabled="!store.mountInfo.AtPark" enabledText="Ausgeparkt" disabledText="Geparkt" />
      <StatusBool :isEnabled="store.mountInfo.TrackingEnabled" enabledText="Tracking ist aktiv" disabledText="Tracking deaktiviert" />
      <StatusBool :isEnabled="store.mountInfo.Slewing" enabledText="Montierung schwenkt" disabledText="Schwenkt nicht" />
    </div>
  </template>
  
  <script setup>
  import StatusBool from '../components/StatusBool.vue';
  import { apiStore } from '@/store/store';

  const store = apiStore();

  defineProps({
    modelValue: Boolean,
  });

  
  </script>
  