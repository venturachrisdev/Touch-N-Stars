<template>
  <div class="dark min-h-screen bg-gray-900 text-white">
    <div v-if="!store.isBackendReachable">
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
import {  onMounted, onBeforeUnmount } from 'vue';
import { apiStore } from '@/store/store';
import { useHead } from '@vueuse/head';
import NavigationComp from './components/NavigationComp.vue';

useHead({
  title: "TouchNStars",
});

const store = apiStore();


function handleVisibilityChange() {
  if (document.hidden) {
    console.log("Seite ausgeblendet");
    
    store.stopFetchingInfo();
  } else {
    console.log("Seite sichtbar");
    
    store.startFetchingInfo();
  }
}

onMounted(async () => {

  // Beobachte Sichtbarkeitsänderungen
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Starte Datenabruf des Stores
  store.startFetchingInfo();
});

onBeforeUnmount(() => {
  store.stopFetchingInfo(); // Beende den Store-Datenabruf
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style scoped></style>
