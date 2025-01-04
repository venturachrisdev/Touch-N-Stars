<template>
  <div>
    <div v-if="isLoading">{{ $t('components.loading') }}</div>
    <div v-else>
      <div v-for="(entry, index) in firstLog" :key="index" 
        class="grid grid-cols-4 border-r border-gray-900 rounded-t-md bg-gray-800 shadow-md text-sm" :class="{
        'text-green-600': entry.level === 'INFO',
        'text-red-600': entry.level === 'ERROR',
        'text-yellow-600': entry.level === 'WARNING',
      }">
        <p class="px-4 border-r border-gray-900 py-2 col-span-1 truncate overflow-hidden">{{ formatTimestamp(entry.timestamp) }}</p>
        <p class="px-4 py-2 col-span-3 truncate overflow-hidden">{{ entry.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { apiStore } from '@/store/store';
import { ref, computed, onMounted } from 'vue';

const store = apiStore();
const isLoading = ref(true);

// Funktion zum Formatieren des Timestamps
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const timeString = date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const dateString = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  return `${timeString}, ${dateString}`;
}

// Computed-Eigenschaft für den ersten Log-Eintrag
const firstLog = computed(() => {
  return store.LogsInfo.logs.slice(0, 1);
});

// Überwachen, wann die Logs geladen sind
onMounted(() => {
  const unwatch = store.$subscribe((mutation, state) => {
    if (state.LogsInfo.logs.length > 0) {
      isLoading.value = false;
      unwatch(); // Stop watching once the data is loaded
    }
  });
});
</script>

<style scoped></style>
