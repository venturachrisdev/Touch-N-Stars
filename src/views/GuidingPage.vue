<template>
  <div class="container flex tems-center justify-center">
    <div class="container max-w-md ">
      <h5 class="text-xl text-center font-bold text-white mb-4">Guiding</h5>
      <div v-if="!isConnected" class="text-red-500 ">
        <p>Bitte Guider verbinden</p>
      </div>
        <div v-else><!-- Wenn verbunden dann hier der Inhalt-->
          <div class="flex space-x-4">
            <button
              class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
              @click="guiderStartStop('start')"
            >
              Start 
            </button>
            <button
              class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
              @click="guiderStartStop('stop')"
            >
              Stop 
            </button>
          </div>
          <div class="mt-5">
            <p class="">RMS Fehler in Arcseconds</p>
            <p> RA:{{ RmsErrorRaArcseconds }} </p>
            <p> DEC:  {{ RmsErrorDecArcseconds }} </p>
            <p> Total: {{ RmsErrorTotalArcseconds }} </p>
     
          </div>
          <div class="mt-5">
            <rmsGraph />
          </div>

        </div>
      </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";
import rmsGraph from '../components/rmsGraph.vue';

export default {
  components: {
    rmsGraph,
  },
  data() {
    return {
      StatusRun:false,
      isConnected:false,
      RmsErrorRaArcseconds:null,
      RmsErrorDecArcseconds:null,
      RmsErrorTotalArcseconds:null,

    };
  },
  async mounted() {
    this.startFetchingInfo();
  },
  methods: {
    async guiderStartStop(befehl) {
        try{
          await apiService.guiderAction(befehl);
          console.log("Guider stopt");
        }
        catch (error) {
          console.error("Fehler :", error.response?.data || error);
          this.mountStatus = "Fehler ";
        }
     },
  
    async fetchGuiderInfo(initialFetch = false) {
      try {
        const response = await apiService.guiderAction("info"); // API-Aufruf
        if (response.Success) {
          const data = response.Response;
          this.isConnected = data.Connected; // Verbindungsstatus setzen
          if (this.isConnected){
          this.RmsErrorRaArcseconds = parseFloat(data.RMSError.RA.Arcseconds.toFixed(2));
          this.RmsErrorDecArcseconds = parseFloat(data.RMSError.Dec.Arcseconds.toFixed(2));
          this.RmsErrorTotalArcseconds = parseFloat(data.RMSError.Total.Arcseconds.toFixed(2));
        }
          //console.log(data.RMSError.Dec.Arcseconds);

          // Setze die Eingabeposition nur beim ersten Aufruf
          if (initialFetch && this.isConnected) {
            console.log("init");
          }
        } else {
          console.error("Fehler in der API-Antwort:", response.Error);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Mount-Informationen:", error);
      }
    },
    startFetchingInfo() {
      this.fetchGuiderInfo(true); // Perform an initial fetch
      this.intervalId = setInterval(() => this.fetchGuiderInfo(false), 1000); // Set up the interval
    },
    stopFetchingInfo() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
  },
  beforeUnmount() {
    // Ensure interval is cleared when the component is destroyed
    this.stopFetchingInfo();
  },
};
</script>
