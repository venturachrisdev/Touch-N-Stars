<template>
  <div class="flex flex-col sm:flex-row items-center gap-2">
    <div
      class="flex flex-row sm:flex-col items-center w-full min-w-28 border border-gray-500 p-1 rounded-lg"
    >
      <label for="exposure" class="text-sm sm:text-xs mr-3 mb-1 text-gray-400">
        {{ $t('components.camera.exposure_time') }}
      </label>
      <input
        id="exposure"
        v-model.number="cameraStore.exposureTime"
        type="number"
        class="ml-auto text-black px-3 h-8 w-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
        placeholder="sek"
      />
    </div>

    <div
      class="flex flex-row sm:flex-col items-center w-full min-w-28 border border-gray-500 p-1 rounded-lg"
    >
      <label for="gain" class="text-sm sm:text-xs mr-3 mb-1 text-gray-400">
        {{ $t('components.camera.gain_iso') }}
      </label>
      <select
        v-if="store.cameraInfo.Gains && store.cameraInfo.Gains.length > 0"
        id="gain"
        v-model.number="cameraStore.gain"
        class="ml-auto text-black px-3 h-8 w-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
      >
        <option v-for="(value, key) in store.cameraInfo.Gains" :key="key" :value="key">
          {{ value }}
        </option>
      </select>
      <input
        v-else
        id="gain"
        v-model.number="cameraStore.gain"
        type="number"
        class="ml-auto text-black px-3 h-8 w-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
        placeholder="1"
      />
    </div>

    <div
      v-if="store.cameraInfo.CanSetOffset"
      class="flex flex-row sm:flex-col items-center w-full min-w-28 border border-gray-500 p-1 rounded-lg"
    >
      <label for="offset" class="text-sm sm:text-xs mr-3 mb-1 text-gray-400">
        {{ $t('components.camera.offset') }}
      </label>
      <select
        v-if="store.cameraInfo.Offset && store.cameraInfo.Offset.length > 0"
        id="offset"
        v-model.number="cameraStore.offset"
        @change="setOffset"
        class="ml-auto text-black px-3 h-8 w-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
      >
        <option v-for="(value, key) in store.cameraInfo.Offset" :key="key" :value="key">
          {{ value }}
        </option>
      </select>
      <input
        v-else
        id="offset"
        v-model.number="cameraStore.offset"
        type="number"
        @blur="setOffset"
        :min="store.cameraInfo.OffsetMin"
        :max="store.cameraInfo.OffsetMax"
        class="ml-auto text-black px-3 h-8 w-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
        placeholder="0"
      />
    </div>
    <setBinning />
  </div>
</template>

<script setup>
import { apiStore } from '@/store/store';
import { useCameraStore } from '@/store/cameraStore';
import apiService from '@/services/apiService';
import setBinning from '@/components/camera/setBinning.vue';

const store = apiStore();
const cameraStore = useCameraStore();

async function setOffset() {
  console.log(cameraStore.offset);
  if (store.cameraInfo.OffsetMin > cameraStore.offset) {
    cameraStore.offset = store.cameraInfo.OffsetMin;
    console.log('Offset zu klein min: ', store.cameraInfo.OffsetMin);
  }
  if (store.cameraInfo.OffsetMax < cameraStore.offset) {
    cameraStore.offset = store.cameraInfo.OffsetMax;
    console.log('Offset zu groß, Max: ', store.cameraInfo.OffsetMax);
  }
  try {
    const data = await apiService.profileChangeValue('CameraSettings-Offset', cameraStore.offset);
    console.log(data);
  } catch (error) {
    console.log('Fehler beim setzten des Offset');
  }
}
</script>
