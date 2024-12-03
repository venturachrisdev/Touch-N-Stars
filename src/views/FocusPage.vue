<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-4">Fokusierer</h5>
    <div>
      <label for="position" class="text-sm">Position:</label>
      <input
        id="position"
        v-model.number="position"
        type="number"
        class="text-black px-4 h-10 max-w-15 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
        placeholder="1"
      />
      <button
        class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
        @click="moveFocuser"
        :disabled="loading"
      >
        Bewegen
      </button>
    </div>
    <div class="mt-4">
      <p class="text-white">Aktuelle Position: {{ currentPosition }}</p>
      <p class="text-white">Temperatur: {{ temperature }}°C</p>
      <p class="text-white">Bewegt sich: {{ isMoving ? 'Ja' : 'Nein' }}</p>
      <p class="text-white">Wird eingestellt: {{ isSettling ? 'Ja' : 'Nein' }}</p>
    </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";

export default {
  data() {
    return {
      position: 2000, // Position für Eingabe
      currentPosition: null, // Aktuelle Position vom Server
      temperature: null, // Aktuelle Temperatur
      isMoving: false, // Status: Bewegt sich
      isSettling: false, // Status: Wird eingestellt
      loading: false, // Status des Buttons
      intervalId: null, // ID für setInterval
    };
  },
  mounted() {
    // Starte das regelmäßige Abrufen der Informationen
    this.startFetchingInfo();
  },
  beforeUnmount() {
    // Stoppe den Intervall, wenn die Komponente zerstört wird
    this.stopFetchingInfo();
  },
  methods: {
    async moveFocuser() {
      try {
        this.loading = true;
        await apiService.moveFocuser(this.position); // Fokussierer bewegen
        this.loading = false;
      } catch (error) {
        console.error("Fehler beim Bewegen des Fokussierers:", error);
        this.loading = false;
      }
    },
    async fetchFocuserInfo() {
      try {
        const response = await apiService.getFocuserInfo(); // API-Aufruf
        if (response.Success) {
          const data = response.Response;
          this.currentPosition = data.Position; // Setze aktuelle Position
          this.temperature = data.Temperature; // Setze Temperatur
          this.isMoving = data.IsMoving; // Setze Bewegung-Status
          this.isSettling = data.IsSettling; // Setze Einstellungs-Status
        } else {
          console.error("Fehler in der API-Antwort:", response.Error);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Fokussierer-Informationen:", error);
      }
    },
    startFetchingInfo() {
      // Starte das Intervall für regelmäßige Abrufe
      this.intervalId = setInterval(this.fetchFocuserInfo, 1000);
    },
    stopFetchingInfo() {
      // Stoppe das Intervall
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
  },
};
</script>
