<template>
  <div class="container flex tems-center justify-center">
    <div class="container max-w-md ">
      <h5 class="text-xl text-center font-bold text-white mb-4">Montierung</h5>
      <div v-if="!isConnected" class="text-red-500 ">
        <p>Bitte Montierung verbinden</p>
      </div>
      <div v-else>
        <infoMount v-model="isConnected" />
        <div class="mb-5 ">
          <p class="text-white mb-2 "></p>

        </div>
       

        <!-- Integration von TppaPage -->
        <div class="mt-10 border border-gray-600 rounded-b-lg bg-gray-800/10">

          <div class="text-sm">
            <button class="border-2 border-gray-500 rounded-b-md  w-24 h-10" :class="{
              'bg-gray-600': showMount,
              'bg-gray-800': !showMount,
            }" @click="toggleShowMount">Montierung</button>
            <button class="border-2 border-gray-500 rounded-b-md w-24 h-10" :class="{
              'bg-gray-600': showSlew,
              'bg-gray-800': !showSlew,
            }" @click="toggleShowSlew">Schwenken</button>
            <button class="border-2 border-gray-500 rounded-b-md  w-24 h-10" :class="{
              'bg-gray-600': showTppa,
              'bg-gray-800': !showTppa,
            }" @click="toggleShowTppa">TPPA</button>
          </div>
          <div class="container pl-5 pb-5 pr-5">
            <div v-if="showMount" class="mt-5">
              <controlMount />
            </div>
            <div v-if="showTppa" class="mt-5">
              <TppaPage />
            </div>
            <div v-if="showSlew" class="mt-5">
              <TargetSearch />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import apiService from "@/services/apiService";
import TppaPage from '../components/TppaPage.vue';

import TargetSearch from '../components/TargetSearch.vue';
import infoMount from '../components/infoMount.vue';
import controlMount from '../components/controlMount.vue';

export default {
  components: {
    TppaPage,
    TargetSearch,
    infoMount,
    controlMount,
  },
  data() {
    return {
      parkPosition: true, // Eingabeposition
      TrackingEnabled: false,
      Slewing: false,
      isConnected: false, // Verbindungsstatus
      showTppa: false,
      showSlew: false,
      showMount: true,

    };
  },
  async mounted() {
    // Hole die aktuelle Position beim Laden der Komponente
    await this.fetchMountInfo();
    // Starte das regelmäßige Abrufen der Informationen
    this.startFetchingInfo();
  },
  beforeUnmount() {
    // Stoppe den Intervall, wenn die Komponente zerstört wird
    this.stopFetchingInfo();
  },
  methods: {
    toggleShowMount() {
      this.showMount = !this.showMount;
      if (this.showMount) {
        this.showSlew = false; 
        this.showTppa = false; 
      }
    },
    toggleShowSlew() {
      this.showSlew = !this.showSlew;
      if (this.showSlew) {
        this.showTppa = false; 
        this.showMount = false;
      }
    },
    toggleShowTppa() {
      this.showTppa = !this.showTppa;
      if (this.showTppa) {
        this.showSlew = false; 
        this.showMount = false;
      }
    },
    async fetchMountInfo() {
      try {
        const response = await apiService.mountAction("info"); // API-Aufruf
        if (response.Success) {
          const data = response.Response;
          this.isConnected = data.Connected; // Verbindungsstatus setzen
        } else {
          console.error("Fehler in der API-Antwort:", response.Error);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Mount-Informationen:", error);
      }
    },
    startFetchingInfo() {
      // Starte das Intervall für regelmäßige Abrufe
      this.intervalId = setInterval(this.fetchMountInfo, 5000);
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
