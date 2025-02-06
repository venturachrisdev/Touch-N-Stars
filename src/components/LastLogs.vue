<template>
  <div class="p-4">
    <!-- Tabelle anzeigen, wenn Daten verfügbar sind -->
    <div class="w-full overflow-x-auto relative">
      <button
        @click="downloadLogs"
        class="absolute top-0 right-0 p-2 hover:bg-gray-700 rounded-lg"
        :title="$t('components.lastLogs.download')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </button>
      <table
        class="w-full table-fixed border-collapse border border-gray-800 text-gray-300 text-sm"
      >
        <thead>
          <tr class="bg-gray-800">
            <th class="border border-gray-300 px-4 py-2 text-left w-1/10">
              {{ $t('components.lastLogs.timestamp') }}
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left w-1/10">
              {{ $t('components.lastLogs.level') }}
            </th>
            <th class="border border-gray-300 px-4 py-2 text-left w-2/5">
              {{ $t('components.lastLogs.message') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, index) in filteredLogs"
            :key="index"
            class="odd:bg-gray-900 even:bg-gray-600"
          >
            <td class="border border-gray-300 px-4 py-2">{{ formatTimestamp(entry.timestamp) }}</td>
            <td
              class="border border-gray-300 px-4 py-2"
              :class="{
                'text-green-600': entry.level === 'INFO',
                'text-red-600': entry.level === 'ERROR',
                'text-yellow-600': entry.level === 'WARNING',
              }"
            >
              {{ entry.level }}
            </td>
            <td class="border border-gray-300 px-4 py-2">{{ entry.message }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLogStore } from '@/store/logStore';
const logStore = useLogStore();

// Funktion zum Formatieren des Timestamps (optional)
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Computed Property für gefilterte Logs
const filteredLogs = computed(() =>
  logStore.LogsInfo.logs.filter((entry) => !entry.message.includes('EDS_ERR_INVALID_PARAMETER'))
);

function downloadLogs() {
  const logContent = filteredLogs.value
    .map((entry) => `[${formatTimestamp(entry.timestamp)}] ${entry.level}: ${entry.message}`)
    .join('\n');

  const blob = new Blob([logContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `logs-${new Date().toISOString().slice(0, 10)}.log`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

<style scoped></style>
