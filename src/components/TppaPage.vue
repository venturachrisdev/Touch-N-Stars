<template>
  <div class="container flex tems-center justify-center">
    <div class="container max-w-md ">
      <div v-if="!isConnected" class="text-gray-600 ">
        TPPA nicht verfügbar
      </div>
      <div v-else>
    <h5 class="text-xl text-center font-bold text-white mb-4">
      Three Point Polar Alignment
    </h5>
  
    <!-- Neue Buttons -->
    <div class="flex space-x-4">
      <button
        class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
        @click="startAlignment"
        :disabled="!isConnected"
      >
        Start Alignment
      </button>
      <button
        class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
        @click="stopAlignment"
        :disabled="!isConnected"
      >
        Stop Alignment
      </button>
    </div>
    <div v-if="currentMessage" class="mt-10">
      <div v-if="startStop">
      <p>{{  formatMessage(currentMessage.message)  }}</p>
      </div>
      <div v-else class=" space-y-4">
          <div class="flex space-x-4 ">
            <p class=" w-52"><strong>Altitude Fehler:</strong></p> <p> {{   showAltitudeError }}</p>
            <ArrowUpIcon v-if="altitudeCorDirectionTop" class="size-6 text-blue-500" />
            <ArrowDownIcon v-else class="size-6 text-blue-500" />
          </div>
          <div class="flex space-x-4 ">
            <p class=" w-52"><strong>Azimuth Fehler:</strong> </p><p> {{ showAzimuthError }}</p>
            <div v-if="azimuthCorDirectionLeft"> 
              <ArrowLeftIcon  class="size-6 text-blue-500 " />
            </div>
            <div v-else class="flex space-x-4 j"> 
              <ArrowRightIcon class="size-6 text-blue-500" />
            </div>
          </div>
          <div class="flex space-x-4 ">
            <p class=" w-52"><strong>Gesamtfehler: </strong> </p><p> {{ showTotalError }}</p>
          </div>
          <div v-if="currentMessage" class=" mt-20">
            <p style="white-space: pre-wrap;">
            
              {{ formatMessage(currentMessage.message) }}         </p>
              <p class=" text-xs"><strong>Letzte Aktualisierung:</strong> {{ currentMessage.time }}</p>
   
          </div>
        </div>
    </div>
  </div>
</div>
</div>

</template>

<script>
import websocketService from "@/services/websocketTppa";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
    } from '@heroicons/vue/24/outline';

export default {
  name: "TppaPage",
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
  },
  data() {
    return {
      Nachricht: "",
      currentMessage: null,
      startStop:false,
      isConnected: false,
      showAzimuthError:"",
      showAltitudeError:"",
      showTotalError:"",
      azimuthCorDirectionLeft:false,
      altitudeCorDirectionTop:false,

    };
  },
  mounted() {
    websocketService.setStatusCallback((status) => {
      console.log("Status aktualisiert:", status);
      this.Nachricht = status;
      this.isConnected = status === "Verbunden";
    });

    websocketService.setMessageCallback((message) => {
      console.log("Neue Nachricht erhalten:", message);
      // Speichere die Nachricht zusammen mit der Empfangszeit
      this.currentMessage = {
        message: message,
        time: this.getCurrentTime(),
      };
    });

    websocketService.connect();
  },
  beforeUnmount() {
    websocketService.setStatusCallback(null);
    websocketService.setMessageCallback(null);
  },
  methods: {
    // Hilfsfunktion zum Umwandeln eines Dezimalgrads in DMS
    decimalToDMS(value){
    // Vorzeichen prüfen
    const isNegative = value < 0;
    const absValue = Math.abs(value);

    // Berechnung der Grad, Minuten und Sekunden
    let degrees = Math.floor(absValue);
    let minutesDecimal = (absValue - degrees) * 60;
    let minutes = Math.floor(minutesDecimal);
    let seconds = Math.round((minutesDecimal - minutes) * 60);

    // Rundungsproblematik: 60 Sekunden in die nächste Minute umwandeln
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    // Rundungsproblematik: 60 Minuten in den nächsten Grad umwandeln
    if (minutes === 60) {
        minutes = 0;
        degrees++;
    }

    // Formatierung mit führenden Nullen
    const degreesStr = degrees.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");

    // Negative Werte korrekt darstellen
    const sign = isNegative ? "-" : "";
    return `${sign}${degreesStr}° ${minutesStr}' ${secondsStr}''`;
},


    // Hilfsfunktion zum Abrufen der aktuellen Uhrzeit
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString(); // Format: HH:MM:SS
    },

    formatMessage(message) {
      if (message.Response) {
        if (typeof message.Response === "string") {
          // Wenn Response ein String ist (z.B. "started procedure")
          if(message.Response === "started procedure"){
            console.log("Start TPPA");
            return message.Response;
          }
          this.startStop = true;
          return message.Response;
        } else if (typeof message.Response === "object") {
          this.startStop = false;
          const { AzimuthError, AltitudeError, TotalError } = message.Response;
          if (
            AzimuthError !== undefined &&
            AltitudeError !== undefined &&
            TotalError !== undefined
          ) {
            // Konvertieren der Werte in DMS-Format
            const azimuthErrorDMS = this.decimalToDMS(AzimuthError);
            const altitudeErrorDMS = this.decimalToDMS(AltitudeError);
            const totalErrorDMS = this.decimalToDMS(TotalError);

            this.showAzimuthError = azimuthErrorDMS;
            this.showAltitudeError = altitudeErrorDMS;
            this.showTotalError = totalErrorDMS;

            // Bestimmen, ob der AltitudeError negativ ist
            this.azimuthCorDirectionLeft = AzimuthError > 0 ? true : false;
            this.altitudeCorDirectionTop = AltitudeError < 0 ? true : false;
            
          } else {
            return "Fehlerwerte nicht vorhanden.";
          }
        } else {
          return "Unbekanntes Response-Format.";
        }
      } else {
        return JSON.stringify(message, null, 2);
      }
    },


    // Senden von "start-alignment"
    startAlignment() {
      console.log("Sende 'start-alignment' an den Server");
      const message = "start-alignment";
      websocketService.sendMessage(message);
    },

    // Senden von "stop-alignment"
    stopAlignment() {
      console.log("Sende 'stop-alignment' an den Server");
      const message = "stop-alignment";
      websocketService.sendMessage(message);
    },
  },
};
</script>

<style scoped>

</style>
