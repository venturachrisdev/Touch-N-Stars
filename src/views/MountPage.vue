<template>
  <div class="container text-center">
    <h5 class="text-xl  font-bold text-white mb-4">Montierung</h5>
    <div v-if="!isConnected" class="text-red-500">
      <p>Bitte Montierung verbinden</p>
    </div>
    <div v-else>
      <div>
      <p class="text-white mb-2 "></p>
      <button
        @click="toggleParkUnpark"
        class="min-w-64 min-h-10 rounded-md text-white font-medium transition-colors"
        :class="parkPosition ? 'bg-cyan-900' : 'bg-red-700'"
      >
        {{ parkPosition ? "Ausparken" : "Parken" }}
      </button>
    </div>

     <!-- Integration von TppaPage -->
     <TppaPage />
    </div>
  </div>
</template>

<script>

import apiService from "@/services/apiService";
import TppaPage from '../components/TppaPage.vue';
export default {
  components: {
    TppaPage,
  },
  data() {
    return {
      parkPosition: null, // Eingabeposition
      currentPosition: null, // Aktuelle Position vom Server
      isMoving: false, // Status: Bewegt sich
      isConnected: false, // Verbindungsstatus
      loading: false, // Status des Buttons
    };
  },
  async mounted() {
    // Hole die aktuelle Position beim Laden der Komponente
    await this.fetchMountInfo(true);
    // Starte das regelmäßige Abrufen der Informationen
    this.startFetchingInfo();
  },
  methods: {
    async toggleParkUnpark() {
      try {
        //console.log(this.parkPosition);
        if (this.parkPosition) {
          await apiService.mountAction("unpark");
          console.log("Montierung ausparken");
        } else {
          await apiService.mountAction("park");
          console.log("Montierung parken");
        }
        const mountInfo = await apiService.mountAction("info");
        this.parkPosition = mountInfo?.Response?.AtPark || false;
        //console.log(mountInfo);
      } catch (error) {
        console.error("Fehler :", error.response?.data || error);
        this.mountStatus = "Fehler ";
      }
    },
    async fetchMountInfo(initialFetch = false) {
      try {
        const response = await apiService.mountAction("info"); // API-Aufruf
        if (response.Success) {
          const data = response.Response;
          this.isConnected = data.Connected; // Verbindungsstatus setzen
          this.parkPosition = data.AtPark; // Setze aktuelle Position
          
          this.isMoving = data.IsMoving; // Setze Bewegung-Status
         

          // Setze die Eingabeposition nur beim ersten Aufruf
          if (initialFetch && this.isConnected) {
            this.parkPosition = data.AtPark;
          }
        } else {
          console.error("Fehler in der API-Antwort:", response.Error);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Mount-Informationen:", error);
      }
    },
    startFetchingInfo() {
      // Starte das Intervall für regelmäßige Abrufe
      this.intervalId = setInterval(this.fetchMountInfo, 1000);
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
