<template>
  <div
    class="flex flex-row items-center justify-between w-full border border-gray-300 p-2 rounded-xl transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-500 hover:shadow-lg"
  >
    <div>
      <p class="text-sm font-medium text-gray-500">
        {{ $t('components.framing.fovSettings.fov') }}
      </p>
    </div>
    <input
      class="text-black px-4 h-10 w-28 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
      type="number"
      v-model="framingStore.fov"
      min="0"
      max="10000"
    />
  </div>
  <div
    class="flex flex-row items-center justify-between w-full border border-gray-300 p-2 mt-1 rounded-xl transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-500 hover:shadow-lg"
  >
    <div>
      <p class="text-sm min-w-24 font-medium text-gray-500">
        {{ $t('components.framing.fovSettings.rotationAngle') }}
      </p>
    </div>
    <input
      class="w-full mr-10 ml-10"
      type="range"
      min="0"
      max="360"
      v-model="framingStore.rotationAngle"
    />
    <input
      class="text-black px-4 h-10 w-28 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
      type="number"
      v-model="framingStore.rotationAngle"
      min="0"
      max="360"
    />
  </div>
  <div>
    <getImageRotation />
  </div>
</template>
<script setup>
import { useFramingStore } from '@/store/framingStore';
import getImageRotation from '@/components/framing/getImageRotation.vue';
const framingStore = useFramingStore();
</script>
