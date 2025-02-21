<template>
  <div class="text-md text-gray-400 pb-2">{{ $t('components.tppa.last_messages') }}:</div>
  <ul>
    <li
      v-for="(msg, index) in lastSolveMessages.slice().reverse()"
      :key="index"
      :style="{
        color: msg.line === '56' ? 'red' : msg.line === '54' ? 'green' : 'inherit',
      }"
    >
      <template v-if="index === 0">
        <span class="spinner"></span>
      </template>
      <template v-else> {{ formatTime(msg.timestamp) }} - </template>
      {{ msg.message }}
    </li>
  </ul>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useLogStore } from '@/store/logStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const logStore = useLogStore();
let lastProcessedTimestamp = null;
const lastSolveMessages = ref([]);

// Funktion zum Formatieren der Uhrzeit
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Beobachte Log-Änderungen:
watch(
  () => logStore.LogsInfo.logs,
  (newLogs) => {
    if (!newLogs || newLogs.length === 0) return;

    // Sortiere aufsteigend nach Timestamp:
    const sortedLogs = [...newLogs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (const entry of sortedLogs) {
      // Nur neue Einträge
      if (lastProcessedTimestamp && new Date(entry.timestamp) <= new Date(lastProcessedTimestamp)) {
        continue;
      }
      let message;
      if (entry.message.includes('Platesolving with parameters:')) {
        //41
        message = t('components.tppa.plate_solve_start');
      } else if (entry.message.includes('Platesolve successful:')) {
        //54
        message = t('components.tppa.plate_solve_ok');
      } else if (entry.message.includes('Platesolve failed')) {
        //56
        message = t('components.tppa.plate_solve_error');
      } else if (entry.message.includes('Slewing to initial position')) {
        //417
        message = t('components.tppa.slewing_first_position');
      } else if (entry.message.includes('Moving Primary Telescope Axis')) {
        //475
        message = t('components.tppa.slewing_next_position');
      } else if (entry.message.includes('Starting Exposure')) {
        //737
        message = t('components.tppa.capture_running');
      } else {
        // Nicht relevante Logs überspringen
        continue;
      }
      // Speichere Einträge (max. 3)
      lastSolveMessages.value.push({
        timestamp: entry.timestamp,
        message,
        line: entry.line,
      });

      if (lastSolveMessages.value.length > 3) {
        lastSolveMessages.value.shift();
      }
      lastProcessedTimestamp = entry.timestamp;
    }
  },
  { deep: true }
);
</script>

<style scoped>
.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid #bbb;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
