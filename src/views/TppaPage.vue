<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-4">TPPA</h5>
    <p>Status: {{ Nachricht }}</p>

    <!-- Neue Buttons -->
    <div class="buttons">
      <button @click="startAlignment" :disabled="!isConnected">Start Alignment</button>
      <button @click="stopAlignment" :disabled="!isConnected">Stop Alignment</button>
    </div>

    <div v-if="currentMessage" class="message">
      <p>{{ formatMessage(currentMessage) }}</p>
    </div>
  </div>
</template>

<script>
import websocketService from "@/services/websocketTppa";

export default {
  data() {
    return {
      Nachricht: "",
      currentMessage: null,
      isConnected: false,
    };
  },
  mounted() {
    websocketService.setStatusCallback((status) => {
      console.log("Status aktualisiert:", status);
      this.Nachricht = status;
      this.isConnected = (status === "Verbunden");
    });

    websocketService.setMessageCallback((message) => {
      console.log("Neue Nachricht erhalten:", message);
      this.currentMessage = message;
    });

    websocketService.connect();
  },
  beforeUnmounts() {
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
      const degreesStr = degrees.toString().padStart(2, '0');
      const minutesStr = minutes.toString().padStart(2, '0');
      const secondsStr = seconds.toString().padStart(2, '0');

      return `${degreesStr}° ${minutesStr}' ${secondsStr}''`;
    },

    formatMessage(message) {
      if (message.Response) {
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

          return `AzimuthError: ${azimuthErrorDMS} AltitudeError: ${altitudeErrorDMS} TotalError: ${totalErrorDMS}`;
        } else {
          return "Fehlerwerte nicht vorhanden.";
        }
      } else {
        return JSON.stringify(message, null, 2);
      }
    },

    // Methode zum Senden von "start-alignment" als einfacher String
    startAlignment() {
      console.log("Sende 'start-alignment' an den Server");
      const message = "start-alignment";
      websocketService.sendMessage(message);
    },

    // Methode zum Senden von "stop-alignment" als einfacher String
    stopAlignment() {
      console.log("Sende 'stop-alignment' an den Server");
      const message = "stop-alignment";
      websocketService.sendMessage(message);
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}

.buttons {
  margin: 20px 0;
}

.buttons button {
  margin: 0 10px;
  padding: 10px 20px;
}

.message {
  background-color: #0f0f0f;
  padding: 10px;
  margin-top: 10px;
  text-align: left;
}
</style>