<template>
  <div class="container flex tems-center justify-center">
    <div class="container max-w-md ">
      <h5 class="text-xl text-center font-bold text-white mb-4">Guiding</h5>
        <div> <!-- für die Abfrage ob Verbunden-->
        </div>
        <div><!-- Wenn verbunden dann hier der Inhalt-->
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

        </div>
      </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";

export default {
  components: {

  },
  data() {
    return {
      StatusRun:false,
    };
  },
  async mounted() {
    
  },
  methods: {
    async guiderStartStop(befehl) {
        try{
          await apiService.guiderAction(befehl);
          console.log("Guider starten");
        }
        catch (error) {
          console.error("Fehler :", error.response?.data || error);
          this.mountStatus = "Fehler ";
        }
     },
  },
  
};
</script>
