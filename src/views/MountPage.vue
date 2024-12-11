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

       
        <div class="mt-10 border border-gray-600 rounded-b-lg bg-gray-800/10">
          
          
        <div class="text-sm">
          <button 
          class="border-2 border-gray-500 rounded-b-md w-24 h-10"
          :class="{'bg-gray-600': showSlew, 
                    'bg-gray-800': !showSlew,
          }"
          @click="toggleShowSlew">Schwenken</button>
          <button 
          class="border-2 border-gray-500 rounded-b-md  w-24 h-10"
          :class="{'bg-gray-600': showTppa, 
                    'bg-gray-800': !showTppa, 
                }"
          @click="toggleShowTppa">TPPA</button>
        </div>
        <div class="container pl-5 pb-5 pr-5">
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
      showTppa:false,
      showSlew:true,

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
    toggleShowSlew(){
      this.showSlew = !this.showSlew;
      if (this.showSlew) {
        this.showTppa = false; // Setzt showSlew auf false, wenn showTppa aktiviert wird
      }
    },
    toggleShowTppa(){
      this.showTppa = !this.showTppa;
      if (this.showTppa) {
        this.showSlew = false; // Setzt showSlew auf false, wenn showTppa aktiviert wird
      }
    },
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
