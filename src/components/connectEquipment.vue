<template>
    <div class="">

        <!-- Kamera-Steuerung -->
        <ConnectionButton :isConnected="store.cameraInfo.Connected" connectText="Kamera verbinden"
            disconnectText="Kamera trennen" :onToggle="toggleCameraConnection" />

        <!-- Filter-Steuerung -->
        <ConnectionButton :isConnected="store.filterInfo.Connected" connectText="Filterrad verbinden"
            disconnectText="Filterrad trennen" :onToggle="toggleFilterConnection" />

        <!-- Montierungs-Steuerung -->
        <ConnectionButton :isConnected="store.mountInfo.Connected" connectText="Montierung verbinden"
            disconnectText="Montierung trennen" :onToggle="toggleMountConnection" />

        <!-- Focuser-Steuerung -->
        <ConnectionButton :isConnected="store.focuserInfo.Connected" connectText="Fokusierer verbinden"
            disconnectText="Fokusierer trennen" :onToggle="toggleFocuserConnection" />

        <!-- Rotator-Steuerung -->
        <ConnectionButton :isConnected="store.rotatorInfo.Connected" connectText="Rotator verbinden"
            disconnectText="Rotator trennen" :onToggle="toggleRotatorConnection" />

        <!-- Guider-Steuerung -->
        <ConnectionButton :isConnected="store.guiderInfo.Connected" connectText="Guider verbinden"
            disconnectText="Guider trennen" :onToggle="toggleGuiderConnection" />

    </div>
</template>

<script setup>
import { apiStore } from '@/store/store';
import apiService from "@/services/apiService";
import ConnectionButton from "@/components/helpers/ConnectionButton.vue";

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
        console.error("Fehler bei der Mount-Steuerung:", error.response?.data || error);
    }
}

async function toggleFilterConnection() {
    try {
        if (store.filterInfo.Connected) {
            await apiService.filterAction("disconnect");
        } else {
            await apiService.filterAction("connect");
        }
    } catch (error) {
        console.error("Fehler bei der Filter-Steuerung:", error.response?.data || error);
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

async function toggleRotatorConnection() {
    try {
        if (store.rotatorInfo.Connected) {
            await apiService.rotatorAction("disconnect");
        } else {
            await apiService.rotatorAction("connect");
        }
    } catch (error) {
        console.error("Fehler bei der Rotator-Steuerung:", error.response?.data || error);
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