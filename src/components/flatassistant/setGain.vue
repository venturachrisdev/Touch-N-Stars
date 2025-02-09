<template>
  <div
    class="flex flex-row  w-full items-center min-w-28 border border-gray-500 p-1 rounded-lg"
  >
    <label for="count" class="text-sm  mr-3 mb-1 text-gray-400">
      {{ $t('components.camera.gain_iso') }}
    </label>
    <input
      id="count"
      v-model.number="settingsStore.camera.gain"
      type="number"
      class="ml-auto text-black px-3 h-8 w-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
    />
  </div>
</template>
<script setup>
import { useSettingsStore } from '@/store/settingsStore';

const settingsStore = useSettingsStore();
</script>
