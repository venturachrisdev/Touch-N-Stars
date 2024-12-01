<template>
  <div class="container text-center">
    <h5 class="text-xl  font-bold text-white mb-4">Ausrüstungs-Steuerung</h5>

    <!-- Kamera-Steuerung -->
    <ConnectionButton
      :isConnected="cameraConnected"
      connectText="Kamera verbinden"
      disconnectText="Kamera trennen"
      :onToggle="toggleCameraConnection"
    />

    <!-- Montierungs-Steuerung -->
    <ConnectionButton
      :isConnected="mountConnected"
      connectText="Montierung verbinden"
      disconnectText="Montierung trennen"
      :onToggle="toggleMountConnection"
    />

        <!-- Focuser-Steuerung -->
    <ConnectionButton
      :isConnected="focusConnected"
      connectText="Fokusierer verbinden"
      disconnectText="Fokusierer trennen"
      :onToggle="toggleFocuserConnection"
    />
  </div>
</template>

<script>
import ConnectionButton from "@/components/ConnectionButton.vue";
import apiService from "@/services/apiService";

export default {
  components: {
    ConnectionButton,
  },
  data() {
    return {
      cameraConnected: false,
      cameraStatus: "Nicht verbunden",
      mountConnected: false,
      mountStatus: "Nicht verbunden",
      focusConnected: false,
      focusStatus: "Nicht verbunden",
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
    async toggleFocuserConnection() {
      try {
        if (this.focusConnected) {
          await apiService.focusAction("disconnect");
        } else {
          await apiService.focusAction("connect");
        }
        const focusInfo = await apiService.focusAction("info");
        this.focusConnected = focusInfo?.Response?.Connected || false;
        this.focusStatus = this.focusConnected ? "Verbunden" : "Nicht verbunden";
      } catch (error) {
        console.error("Fehler bei der Focuser-Steuerung:", error.response?.data || error);
        this.focusStatus = "Fehler bei der Verbindung";
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

        const focusInfo = await apiService.focusAction("info");
        this.focusConnected = focusInfo?.Response?.Connected || false;
        this.focusStatus = this.focusConnected ? "Verbunden" : "Nicht verbunden";
      } catch (error) {
        console.error("Fehler beim Abrufen des Status:", error.response?.data || error);
      }
    },
  },
};
</script>
