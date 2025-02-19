<template>
    <div>Letzte Messages (max. 3):</div>
    <ul>
      <li
        v-for="(msg, index) in lastSolveMessages.slice().reverse()"
        :key="index"
        :style="{
  color:
    msg.line === '56'
      ? 'red'
      : (msg.line === '54' ? 'green' : 'inherit')
}"

      >
        <!-- Wenn es der erste Eintrag (neuester) in der reversed-Liste ist, Spinner anzeigen -->
        <template v-if="index === 0">
          <span class="spinner"></span>
        </template>
        <template v-else>
          <!-- Ansonsten Uhrzeit ausgeben -->
          {{ formatTime(msg.timestamp) }} -
        </template>
         {{ msg.message }}
      </li>
    </ul>
  </template>

<script setup>
import { ref, watch } from 'vue';
import { useLogStore } from '@/store/logStore';

const logStore = useLogStore();
let lastProcessedTimestamp = null;
const lastSolveMessages = ref([]);

// Hilfsfunktion zum Formatieren der Uhrzeit
function formatTime(timestamp) {
  const date = new Date(timestamp);
  // Variante 1: Manuell zusammensetzen
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;

}

watch(
  () => logStore.LogsInfo.logs,
  (newLogs) => {
    if (!newLogs || newLogs.length === 0) return;

    const sortedLogs = [...newLogs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (const entry of sortedLogs) {
      if (lastProcessedTimestamp && new Date(entry.timestamp) <= new Date(lastProcessedTimestamp)) {
        continue;
      }

      let message;
      switch (entry.line) {
        case '41':
          message = 'Platesolve start';
          break;
        case '54':
          message = 'Platesolve erfolgreich';
          break;
        case '56':
          message = 'Platesolve Fehler'; 
          break;
        case '417':
          message = 'Slewing to initial position';
          break;
        case '475':
          message = 'Slewing to next position';
          break;
        case '737':
          message = 'Aufnahme läuft';
          break;
        default:
          continue;
      }

      // Hier speichern wir zusätzlich die "line", damit wir im Template darauf reagieren können
      lastSolveMessages.value.push({
        timestamp: entry.timestamp,
        message: message,
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
/* Beispielhafter CSS-Spinner */
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

/* Keyframe für die Rotation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>