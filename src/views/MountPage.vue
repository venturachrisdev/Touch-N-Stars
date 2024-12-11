<template>
  <div class="container flex tems-center justify-center">
    <div class="container max-w-md ">
      <h5 class="text-xl text-center font-bold text-white mb-4">Montierung</h5>
      <div v-if="!isConnected" class="text-red-500 ">
        <p>Bitte Montierung verbinden</p>
      </div>
      <div v-else>
        <div class="mb-5 ">
          <p class="text-white mb-2 "></p>
          <button @click="toggleParkUnpark"
            class="min-w-64 min-h-10 rounded-md text-white font-medium transition-colors w-full"
            :class="parkPosition ? 'bg-cyan-900' : 'bg-red-700'">
            {{ parkPosition ? "Ausparken" : "Parken" }}
          </button>
        </div>
        <div class="text-left">
          <StatusBool :isEnabled="TrackingEnabled" enabledText="Tracking ist aktiv" disabledText="Tracking deaktiviert"/>
          <StatusBool :isEnabled="Slewing" enabledText="Montierung Schwenkt" disabledText="Schwenkt nicht"/>
        </div>

     
        <!-- Integration von TppaPage -->
        <div class="mt-10">
          <hr class="border-t border-gray-300">
        </div>
        <div class="mt-5">
          <TppaPage />
        </div>
        <div>
        <!--  <TargetSearch /> -->
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import apiService from "@/services/apiService";
import TppaPage from '../components/TppaPage.vue';
import StatusBool from '../components/StatusBool.vue';
// eslint-disable-next-line
import TargetSearch from '../components/TargetSearch.vue';

export default {
  components: {
    TppaPage,
    StatusBool,
    // eslint-disable-next-line
    TargetSearch,
  },
  data() {
    return {
      parkPosition: true, // Eingabeposition
      TrackingEnabled: false,
      Slewing: false,
      isConnected: false, // Verbindungsstatus
    };
  },
  async mounted() {
    // Hole die aktuelle Position beim Laden der Komponente
    await this.fetchMountInfo(true);
    // Starte das regelmäßige Abrufen der Informationen
    this.startFetchingInfo();
  },
  beforeUnmount() {
    // Stoppe den Intervall, wenn die Komponente zerstört wird
    this.stopFetchingInfo();
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
          this.TrackingEnabled = data.TrackingEnabled;
          this.Slewing = data.Slewing;

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
