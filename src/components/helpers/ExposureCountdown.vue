<template>
    <div class="flex flex-col items-center justify-center p-4 w-full">
      <p class="text-xl font-semibold">Exposure Countdown:</p>
      <p class="text-3xl font-bold text-red-600">{{ cameraStore.exposureCountdown }}s</p>
      
      <!-- Fortschrittsbalken -->
      <div class="w-full max-w-md mt-4 bg-gray-300 rounded-lg overflow-hidden">
        <div 
          class="h-4 transition-all duration-500 ease-linear"
          :class="progressColor"
          :style="{ width: cameraStore.exposureProgress + '%' }"
        ></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed, onMounted } from 'vue';
  import { apiStore } from '@/store/store';
  import { useCameraStore} from '@/store/cameraStore';
  
  const store = apiStore();
  const cameraStore = useCameraStore();
  const countdown = ref(0);

 
  const progressColor = computed(() => {
    if (cameraStore.exposureProgress > 50) return "bg-green-500";
    if (cameraStore.exposureProgress > 20) return "bg-yellow-500";
    return "bg-red-500";
  });
  
  watch(
    () => store.cameraInfo.ExposureEndTime,
    (newVal) => {
      if (newVal && !cameraStore.countdownRunning) {
        cameraStore.updateCountdown();
      }
    }
  );
  
  onMounted(() => {
    if (store.cameraInfo.ExposureEndTime) {
        cameraStore.updateCountdown();
    }
  });
  </script>
  