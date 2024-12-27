<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-4">Ausrüstungs-Steuerung</h5>
    <div class="flex flex-col items-center justify-center">
      <profilSelect v-show="!store.mountInfo.Connected && !store.cameraInfo.Connected && !store.filterInfo.Connected && !store.focuserInfo.Connected" class="mb-4" />
      <connectEquipment class="mb-4 space-y-2" />
    </div>
  </div>
</template>

<script setup>

import profilSelect from "@/components/profilSelect.vue";
import connectEquipment from '@/components/connectEquipment.vue';
import { apiStore } from '@/store/store';

const store = apiStore();

</script>

<style scoped></style>
