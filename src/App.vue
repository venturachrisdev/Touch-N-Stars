<template>
  <div class="dark min-h-screen bg-gray-900 text-white">
    <div v-if="!isBackendReachable">
      <div class="flex w-full min-h-screen items-center justify-center text-2xl text-red-700">
        <p>NINA ist nicht erreichbar!</p>
      </div>
    </div>
    <div v-else>
      <!-- Navigation -->
      <nav>
        <div>
          <NavigationComp />
        </div>
      </nav>

      <!-- Hauptinhalt -->
      <div class="container mx-auto p-4 transition-all">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { apiStore } from '@/store/store';
import { useHead } from '@vueuse/head';
import NavigationComp from './components/NavigationComp.vue';
import apiService from "@/services/apiService";

useHead({
  title: "TouchNStars",
});

const isBackendReachable = ref(false);
const isPollingActive = ref(false);
const store = apiStore();
let checkInterval = null;

async function checkBackendStatus() {
  try {
    isBackendReachable.value = await apiService.isBackendReachable();
    console.log(
      isBackendReachable.value
        ? "Backend ist erreichbar"
        : "Backend ist nicht erreichbar"
    );
  } catch (error) {
    console.error("Fehler beim Prüfen der Backend-Erreichbarkeit", error);
    isBackendReachable.value = false;
  }
}

function startPolling() {
  if (isPollingActive.value) return; // Verhindert doppelte Timer
  isPollingActive.value = true;

  checkInterval = setInterval(async () => {
    await checkBackendStatus();
  }, 5000);

  console.log("Polling gestartet");
}

function stopPolling() {
  if (!isPollingActive.value) return; // Falls kein Timer aktiv ist
  clearInterval(checkInterval);
  checkInterval = null;
  isPollingActive.value = false;
  console.log("Polling gestoppt");
}

function handleVisibilityChange() {
  if (document.hidden) {
    console.log("Seite ausgeblendet");
    stopPolling();
    store.stopFetchingInfo();
  } else {
    console.log("Seite sichtbar");
    startPolling();
    store.startFetchingInfo();
  }
}

onMounted(async () => {
  await checkBackendStatus();

  startPolling(); // Starte das Polling beim Laden der Seite

  // Beobachte Sichtbarkeitsänderungen
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Starte Datenabruf des Stores
  store.startFetchingInfo();
});

onBeforeUnmount(() => {
  stopPolling(); // Beende das Polling
  store.stopFetchingInfo(); // Beende den Store-Datenabruf
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style scoped></style>
