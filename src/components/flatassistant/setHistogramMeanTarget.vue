<template>
  <div
    class="flex flex-row w-full items-center min-w-28 border border-gray-500 p-1 rounded-lg"
  >
    <label for="count" class="text-sm mr-3 mb-1 text-gray-400">
      {{ $t('components.flatassistant.histogram_mean_target') }}
    </label>
    <input
      id="count"
      v-model.number="histogramMeanPercentage"
      type="number"
      class="ml-auto text-black px-3 h-8 w-28 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
    />
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue';
import { apiStore } from '@/store/store';
import { useFlatassistantStore } from '@/store/flatassistantStore';

const store = apiStore();
const flatsStore = useFlatassistantStore();

// Computed Property für Prozentwerte
const histogramMeanPercentage = computed({
  get: () => Math.round(flatsStore.histogramMean * 100), // Umwandlung in Prozent
  set: (value) => {
    flatsStore.histogramMean = value / 100; // Rückumwandlung in Dezimalzahl
  },
});

onMounted(() => {
  flatsStore.histogramMean = store.profileInfo.FlatWizardSettings.HistogramMeanTarget;
});
</script>
