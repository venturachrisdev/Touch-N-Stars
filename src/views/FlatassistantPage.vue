<template>
  <div class="flex flex-col items-center justify-center max-w-md mx-auto">
    <AutoExposure />
    <AutoBrightness v-if="false" />
    <SkyFlat v-if="false" />
    <div
      v-show="flatsStore.status.CompletedIterations > -1"
      class="flex flex-col w-full max-w-md space-y-2 mt-4 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg p-5"
    >
      <div
        class="flex justify-center items-center p-2 border border-gray-500 rounded-lg bg-gray-800"
      >
        <getStatus />
      </div>
      <LastImage />
    </div>
  </div>
  <div class="p-10"></div>
</template>

<script setup>
import AutoExposure from '@/components/flatassistant/AutoExposure.vue';
import AutoBrightness from '@/components/flatassistant/AutoBrightness.vue';
import SkyFlat from '@/components/flatassistant/SkyFlat.vue';
import getStatus from '@/components/flatassistant/getStatus.vue';
import LastImage from '@/components/flatassistant/LastImage.vue';
import { useFlatassistantStore } from '@/store/flatassistantStore';

const flatsStore = useFlatassistantStore();
</script>
