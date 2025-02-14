<template>
  <toggleButton
    @click="toggleSolve"
    :status-value="settingsStore.camera.useSolve"
    class="pr-5 pl-5 justify-center"
  />
</template>
<script setup>
import { useSettingsStore } from '@/store/settingsStore';
import toggleButton from '@/components/helpers/toggleButton.vue';

const settingsStore = useSettingsStore();

function toggleSolve() {
  if (settingsStore.camera.useSolve) {
    ssettingsStore.camera.useSolve = false;
    console.log('Platesolve off');
  } else {
    settingsStore.camera.useSolve = true;
    console.log('Platesolve on');
  }
}
</script>
