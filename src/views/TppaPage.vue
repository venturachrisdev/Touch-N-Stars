<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-4">TPPA</h5>
    <p class="mb-4">TPPA Modul {{ Nachricht }}</p>

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
          <div class="flex space-x-4 justify-center">
            <p><strong>Altitude Fehler:</strong></p> <p> {{   showAltitudeError }}</p>
            <ArrowUpIcon v-if="altitudeCorDirectionTop" class="size-6 text-blue-500" />
            <ArrowDownIcon v-else class="size-6 text-blue-500" />
          </div>
          <div class="flex space-x-4 justify-center">
            <p><strong>Azimuth Fehler:</strong> </p><p> {{ showAzimuthError }}</p>
            <div v-if="azimuthCorDirectionLeft"> 
              <ArrowLeftIcon  class="size-6 text-blue-500 " />
            </div>
            <div v-else class="flex space-x-4 justify-center"> 
              <ArrowRightIcon class="size-6 text-blue-500" />
            </div>
          </div>
          <div class="flex space-x-4 justify-center">
            <p><strong>Gesamtfehler: </strong> </p><p> {{ showTotalError }}</p>
          </div>
          <div v-if="currentMessage" class="mt-4">
            <p style="white-space: pre-wrap;">
            
              {{ formatMessage(currentMessage.message) }} <br>
              <strong>Letzte Aktualisierung:</strong> {{ currentMessage.time }}<br>
            </p>
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
    decimalToDMS(value) {
      const degrees = Math.floor(value);
      const minutesDecimal = (value - degrees) * 60;
      const minutes = Math.floor(minutesDecimal);
      const seconds = ((minutesDecimal - minutes) * 60).toFixed(0);

      // Formatierung mit führenden Nullen
      const degreesStr = degrees.toString().padStart(2, "0");
      const minutesStr = minutes.toString().padStart(2, "0");
      const secondsStr = seconds.toString().padStart(2, "0");

      return `${degreesStr}° ${minutesStr}' ${secondsStr}''`;
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
           

            // Verwendung von \n für Zeilenumbrüche
            
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
