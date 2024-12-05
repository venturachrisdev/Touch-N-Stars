<template>
  <div class="container flex tems-center justify-center">
    <div class="container max-w-md ">
    <h5 class="text-xl font-bold text-center text-white mb-4">Fokusierer</h5>
    <div v-if="!isConnected" class="text-red-500">
      <p>Bitte Focuser verbinden</p>
    </div>
    <div v-else class="text-left">
      <div class="flex space-x-3 items-center">
        <label for="position" class=" w-52">Neue Position:</label>
        <input
          id="position"
          v-model.number="position"
          type="number"
          class="text-black px-4 h-10 w-40 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
          placeholder="1"
          step="50"
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
        <button
          class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
          @click="startAutofocus"
          :disabled="loading"
        >
          Starte Autofokus
        </button>
      </div>
      <div class="mt-4">
        <p class="text-white">Aktuelle Position: {{ currentPosition }}</p>
        <!-- Temperatur anzeigen, nur wenn gültig -->
        <p class="text-white" v-if="!isNaN(temperature)">Temperatur: {{ (temperature) }}°C</p>
        <StatusBool :isEnabled="isMoving" enabledText="OAZ bewegt sich" disabledText="OAZ steht"/>
        <StatusBool :isEnabled="isSettling" enabledText="Backlash bereinigen" disabledText=""/>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import apiService from "@/services/apiService";
import StatusBool from '../components/StatusBool.vue';

export default {
  components: {
    StatusBool,
  },
  data() {
    return {
      position: null, // Eingabeposition
      currentPosition: null, // Aktuelle Position vom Server
      temperature: null, // Aktuelle Temperatur
      isMoving: false, // Status: Bewegt sich
      isSettling: false, // Status: Wird eingestellt
      isConnected: false, // Verbindungsstatus
      loading: false, // Status des Buttons
      intervalId: null, // ID für setInterval
    };
  },
  async mounted() {
    // Hole die aktuelle Position beim Laden der Komponente
    await this.fetchFocuserInfo(true);
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
    async startAutofocus() {
      try {
        await apiService.focusAction("auto-focus"); // Fokussierer bewegen
      } catch (error) {
        console.error("Fehler beim Autofokus", error);
      }
    },
    async fetchFocuserInfo(initialFetch = false) {
      try {
        const response = await apiService.focusAction("info"); // API-Aufruf
        if (response.Success) {
          const data = response.Response;
          this.isConnected = data.Connected; // Verbindungsstatus setzen
          this.currentPosition = data.Position; // Setze aktuelle Position
          this.temperature = data.Temperature.toFixed(2); // Setze Temperatur
          this.isMoving = data.IsMoving; // Setze Bewegung-Status
          this.isSettling = data.IsSettling; // Setze Einstellungs-Status

          // Setze die Eingabeposition nur beim ersten Aufruf
          if (initialFetch && this.isConnected) {
            this.position = data.Position;
          }
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
