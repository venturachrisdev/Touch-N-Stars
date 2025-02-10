<template>
  <!-- Fortschrittsbalken -->
  <div class="w-full rounded-lg overflow-hidden">
    <div
      v-if="cameraStore.exposureProgress > 0"
      class="bg-gradient-to-r from-blue-800 to-blue-200"
      :style="{
        width: cameraStore.exposureProgress + '%',
        height: '1px',
        transition: cameraStore.exposureProgress > 0 ? 'width 0.5s linear' : 'none' // Animiert nur, wenn > 0
      }"
    ></div>
  </div>
</template>

<script setup>
import { watch, onMounted, nextTick } from 'vue';
import { apiStore } from '@/store/store';
import { useCameraStore } from '@/store/cameraStore';

const store = apiStore();
const cameraStore = useCameraStore();

watch(
  () => store.cameraInfo.ExposureEndTime,
  async (newVal) => {
    if (newVal && store.cameraInfo.IsExposing) {
      cameraStore.updateCountdown();
    } else {
      // Warte einen Tick, damit die Animation nicht beeinflusst wird
      await nextTick();
      cameraStore.exposureProgress = 0;
    }
  }
);

onMounted(() => {
  if (store.cameraInfo.ExposureEndTime) {
    cameraStore.updateCountdown();
  }
});
</script>
