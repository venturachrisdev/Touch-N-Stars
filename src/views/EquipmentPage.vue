<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-4">Ausrüstungs-Steuerung</h5>
    <div class="flex flex-col items-center justify-center">
      <profilSelect v-show="!cameraConnected && !mountConnected && !focusConnected" class="mb-4" />

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

      <!-- Guider-Steuerung -->
      <ConnectionButton
        :isConnected="guiderConnected"
        connectText="Guider verbinden"
        disconnectText="Guider trennen"
        :onToggle="toggleGuiderConnection"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ConnectionButton from "@/components/ConnectionButton.vue";
import apiService from "@/services/apiService";
import profilSelect from "@/components/profilSelect.vue";

const cameraConnected = ref(false);
const cameraStatus = ref("Nicht verbunden");
const mountConnected = ref(false);
const mountStatus = ref("Nicht verbunden");
const focusConnected = ref(false);
const focusStatus = ref("Nicht verbunden");
const guiderConnected = ref(false);
const guiderStatus = ref("Nicht verbunden");

async function toggleCameraConnection() {
  try {
    if (cameraConnected.value) {
      await apiService.cameraAction("disconnect");
    } else {
      await apiService.cameraAction("connect");
    }
    const cameraInfo = await apiService.cameraAction("info");
    cameraConnected.value = cameraInfo?.Response?.Connected || false;
    cameraStatus.value = cameraConnected.value ? "Verbunden" : "Nicht verbunden";
  } catch (error) {
    console.error("Fehler bei der Kamera-Steuerung:", error.response?.data || error);
    cameraStatus.value = "Fehler bei der Verbindung";
  }
}

async function toggleMountConnection() {
  try {
    if (mountConnected.value) {
      await apiService.mountAction("disconnect");
    } else {
      await apiService.mountAction("connect");
    }
    const mountInfo = await apiService.mountAction("info");
    mountConnected.value = mountInfo?.Response?.Connected || false;
    mountStatus.value = mountConnected.value ? "Verbunden" : "Nicht verbunden";
  } catch (error) {
    console.error("Fehler bei der Montierungs-Steuerung:", error.response?.data || error);
    mountStatus.value = "Fehler bei der Verbindung";
  }
}

async function toggleFocuserConnection() {
  try {
    if (focusConnected.value) {
      await apiService.focusAction("disconnect");
    } else {
      await apiService.focusAction("connect");
    }
    const focusInfo = await apiService.focusAction("info");
    focusConnected.value = focusInfo?.Response?.Connected || false;
    focusStatus.value = focusConnected.value ? "Verbunden" : "Nicht verbunden";
  } catch (error) {
    console.error("Fehler bei der Focuser-Steuerung:", error.response?.data || error);
    focusStatus.value = "Fehler bei der Verbindung";
  }
}

async function toggleGuiderConnection() {
  try {
    if (guiderConnected.value) {
      await apiService.guiderAction("disconnect");
    } else {
      await apiService.guiderAction("connect");
    }
    const guiderInfo = await apiService.guiderAction("info");
    guiderConnected.value = guiderInfo?.Response?.Connected || false;
    guiderStatus.value = guiderConnected.value ? "Verbunden" : "Nicht verbunden";
  } catch (error) {
    console.error("Fehler bei der Guider-Steuerung:", error.response?.data || error);
    guiderStatus.value = "Fehler bei der Verbindung";
  }
}

async function fetchInitialStatus() {
  try {
    const cameraInfo = await apiService.cameraAction("info");
    cameraConnected.value = cameraInfo?.Response?.Connected || false;
    cameraStatus.value = cameraConnected.value ? "Verbunden" : "Nicht verbunden";

    const mountInfo = await apiService.mountAction("info");
    mountConnected.value = mountInfo?.Response?.Connected || false;
    mountStatus.value = mountConnected.value ? "Verbunden" : "Nicht verbunden";

    const focusInfo = await apiService.focusAction("info");
    focusConnected.value = focusInfo?.Response?.Connected || false;
    focusStatus.value = focusConnected.value ? "Verbunden" : "Nicht verbunden";

    const guiderInfo = await apiService.guiderAction("info");
    guiderConnected.value = guiderInfo?.Response?.Connected || false;
    guiderStatus.value = guiderConnected.value ? "Verbunden" : "Nicht verbunden";
  } catch (error) {
    console.error("Fehler beim Abrufen des Status:", error.response?.data || error);
  }
}

onMounted(async () => {
  await fetchInitialStatus();
});
</script>

<style scoped></style>
