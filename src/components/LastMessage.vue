<template>
  <div>
    <div v-if="isLoading">{{ $t('components.loading') }}</div>
    <div v-else>

      <div v-for="(entry, index) in firstLog" :key="index"
        class="grid grid-cols-10 border-r border-gray-900 rounded-t-md bg-gray-800 shadow-md text-sm" :class="{
          'text-green-600': entry.level === 'INFO',
          'text-red-600': entry.level === 'ERROR',
          'text-yellow-600': entry.level === 'WARNING',
        }">
        <div v-if="store.safetyInfo.Connected" class="mr-2  border-r  border-gray-900 col-span-1 flex justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            :class="store.safetyInfo.IsSafe ? 'text-green-600' : 'text-red-600'">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
            <path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M12 12l0 2.5" />
          </svg>
        </div>
        <p class="px-4 border-r border-gray-900 py-2 col-span-3 truncate overflow-hidden">{{
          formatTimestamp(entry.timestamp) }}</p>
        <p class="px-4 py-2 col-span-6 truncate overflow-hidden">{{ entry.message }}</p>

      </div>
    </div>
  </div>
</template>

<script setup>
import { apiStore } from '@/store/store';
import { ref, computed, onMounted, watch } from 'vue';

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
watch(
  () => store.LogsInfo,
  (newVal, oldVal) => {
    if (!oldVal || newVal.length > oldVal.length) {
      isLoading.value = false;
      console.log("ja")
    }
  },
  { immediate: false }
);

</script>

<style scoped></style>
