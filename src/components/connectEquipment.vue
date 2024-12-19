<template>
    <div class="">

        <!-- Kamera-Steuerung -->
        <ConnectionButton :isConnected="store.cameraInfo.Connected" connectText="Kamera verbinden" disconnectText="Kamera trennen"
            :onToggle="toggleCameraConnection" />

        <!-- Montierungs-Steuerung -->
        <ConnectionButton :isConnected="store.mountInfo.Connected" connectText="Montierung verbinden"
            disconnectText="Montierung trennen" :onToggle="toggleMountConnection" />

        <!-- Focuser-Steuerung -->
        <ConnectionButton :isConnected="store.focuserInfo.Connected" connectText="Fokusierer verbinden"
            disconnectText="Fokusierer trennen" :onToggle="toggleFocuserConnection" />

        <!-- Guider-Steuerung -->
        <ConnectionButton :isConnected="store.guiderInfo.Connected" connectText="Guider verbinden" disconnectText="Guider trennen"
            :onToggle="toggleGuiderConnection" />

    </div>
</template>

<script setup>
import { apiStore } from '@/store/store';
import apiService from "@/services/apiService";
import ConnectionButton from "@/components/ConnectionButton.vue";

const store = apiStore();

async function toggleCameraConnection() {
    try {
        if (store.cameraInfo.Connected) {
            await apiService.cameraAction("disconnect");
        } else {
            await apiService.cameraAction("connect");
        }
    } catch (error) {
        console.error("Fehler bei der Kamera-Steuerung:", error.response?.data || error);
    }
}

async function toggleMountConnection() {
    try {
        if (store.mountInfo.Connected) {
            await apiService.mountAction("disconnect");
        } else {
            await apiService.mountAction("connect");
        }
    } catch (error) {
        console.error("Fehler bei der Kamera-Steuerung:", error.response?.data || error);
    }
}

async function toggleFocuserConnection() {
    try {
        if (store.focuserInfo.Connected) {
            await apiService.focusAction("disconnect");
        } else {
            await apiService.focusAction("connect");
        }
    } catch (error) {
        console.error("Fehler bei der Kamera-Steuerung:", error.response?.data || error);
    }
}

async function toggleGuiderConnection() {
    try {
        if (store.guiderInfo.Connected) {
            await apiService.guiderAction("disconnect");
        } else {
            await apiService.guiderAction("connect");
        }
    } catch (error) {
        console.error("Fehler bei der Kamera-Steuerung:", error.response?.data || error);
    }
}

</script>