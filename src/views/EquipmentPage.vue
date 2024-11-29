<template>
  <div class="container ">
    <h5 class="text-xl font-bold text-white mb-4">Ausrüstungs-Steuerung</h5>
    <!-- Kamera-Steuerung -->
    <div class="">
      <p class="text-white">Kamera-Status: {{ cameraStatus }}</p>
      <button
        @click="toggleCameraConnection"
        class=" py-2 px-4 rounded-md text-white font-medium transition-colors"
        :class="cameraConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
      >
        {{ cameraConnected ? "Kamera trennen" : "Kamera verbinden" }}
      </button>
    </div>

    <!-- Montierungs-Steuerung -->
    <div>
      <p class="text-white mb-2">Montierungs-Status: {{ mountStatus }}</p>
      <button
        @click="toggleMountConnection"
        class=" py-2 px-4 rounded-md text-white font-medium transition-colors"
        :class="mountConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
      >
        {{ mountConnected ? "Montierung trennen" : "Montierung verbinden" }}
      </button>
    </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";

export default {
  data() {
    return {
      cameraConnected: false,
      cameraStatus: "Nicht verbunden",
      mountConnected: false,
      mountStatus: "Nicht verbunden",
    };
  },
  async mounted() {
    await this.fetchInitialStatus();
  },
  methods: {
    async toggleCameraConnection() {
      try {
        if (this.cameraConnected) {
          await apiService.cameraAction("disconnect");
        } else {
          await apiService.cameraAction("connect");
        }
        const cameraInfo = await apiService.cameraAction("info");
        this.cameraConnected = cameraInfo?.Response?.Connected || false;
        this.cameraStatus = this.cameraConnected ? "Verbunden" : "Nicht verbunden";
      } catch (error) {
        console.error("Fehler bei der Kamera-Steuerung:", error.response?.data || error);
        this.cameraStatus = "Fehler bei der Verbindung";
      }
    },
    async toggleMountConnection() {
      try {
        if (this.mountConnected) {
          await apiService.mountAction("disconnect");
        } else {
          await apiService.mountAction("connect");
        }
        const mountInfo = await apiService.mountAction("info");
        this.mountConnected = mountInfo?.Response?.Connected || false;
        this.mountStatus = this.mountConnected ? "Verbunden" : "Nicht verbunden";
      } catch (error) {
        console.error("Fehler bei der Montierungs-Steuerung:", error.response?.data || error);
        this.mountStatus = "Fehler bei der Verbindung";
      }
    },
    async fetchInitialStatus() {
      try {
        const cameraInfo = await apiService.cameraAction("info");
        this.cameraConnected = cameraInfo?.Response?.Connected || false;
        this.cameraStatus = this.cameraConnected ? "Verbunden" : "Nicht verbunden";

        const mountInfo = await apiService.mountAction("info");
        this.mountConnected = mountInfo?.Response?.Connected || false;
        this.mountStatus = this.mountConnected ? "Verbunden" : "Nicht verbunden";
      } catch (error) {
        console.error("Fehler beim Abrufen des Status:", error.response?.data || error);
      }
    },
  },
};
</script>
