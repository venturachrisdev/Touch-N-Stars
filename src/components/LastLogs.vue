<template>
  <div class="p-4">
    <!-- Ladeanzeige -->
    <div v-if="isLoading" class="text-gray-500">Daten werden geladen...</div>

    <!-- Fehleranzeige -->
    <div v-else-if="error" class="text-red-500">
      Fehler beim Laden der Daten: {{ error.message }}
    </div>

    <!-- Tabelle anzeigen, wenn Daten verfügbar sind -->
    <div v-else class="w-full overflow-x-auto">
      <table class="w-full table-fixed border-collapse border border-gray-800 text-gray-300 text-sm">
        <thead>
          <tr class="bg-gray-800">
            <th class="border border-gray-300 px-4 py-2 text-left w-1/10">Timestamp</th>
            <th class="border border-gray-300 px-4 py-2 text-left w-1/10">Level</th>
            <th class="border border-gray-300 px-4 py-2 text-left w-2/5">Message</th>
            <th class="border border-gray-300 px-4 py-2 text-left hidden landscape:table-cell w-1/10">Member</th>
            <th class="border border-gray-300 px-4 py-2 text-left hidden landscape:table-cell w-1/10">Line</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in log.logs" :key="index" class="odd:bg-gray-900 even:bg-gray-600">
            <td class="border border-gray-300 px-4 py-2">{{ formatTimestamp(entry.timestamp) }}</td>
            <td class="border border-gray-300 px-4 py-2" :class="{
              'text-green-600': entry.level === 'INFO',
              'text-red-600': entry.level === 'ERROR',
              'text-yellow-600': entry.level === 'WARNING',
            }">
              {{ entry.level }}
            </td>
            <td class="border border-gray-300 px-4 py-2">{{ entry.message }}</td>
            <td class="border border-gray-300 px-4 py-2 hidden landscape:table-cell">{{ entry.member }}</td>
            <td class="border border-gray-300 px-4 py-2 hidden landscape:table-cell">{{ entry.line }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiService from "@/services/apiService";

// Initialisieren von log mit einer leeren logs-Array
const log = ref({ logs: [] });

// Zustände für Laden und Fehler
const isLoading = ref(true);
const error = ref(null);

// Funktion zum Formatieren des Timestamps (optional)
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Daten von der API abrufen
async function fetchLastLogs() {
  try {
    const response = await apiService.getLastLogs("10");

    // Überprüfen Sie die Struktur der API-Antwort
    // Angenommen, die Logs befinden sich direkt in response.logs
    if (response && Array.isArray(response.logs)) {
      log.value = response;
    } else if (response && response.data && Array.isArray(response.data.logs)) {
      // Falls die Logs in response.data.logs liegen
      log.value = response.data;
    } else {
      throw new Error("Unerwartete API-Antwortstruktur");
    }

    console.log("API Response:", log.value);
  } catch (err) {
    console.error("Fehler beim Abrufen der Daten:", err);
    error.value = err;
  } finally {
    isLoading.value = false;
  }
}

// Beim Mounten der Komponente die Daten abrufen
onMounted(() => {
  fetchLastLogs();
});
</script>

<style scoped>
/* Keine spezifischen Stile benötigt, da Tailwind verwendet wird */
</style>
