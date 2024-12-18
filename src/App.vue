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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useHead } from '@vueuse/head';
import NavigationComp from './components/NavigationComp.vue';
import apiService from "@/services/apiService";

useHead({
  title: "TouchNStars",
});

const isBackendReachable = ref(false);
let checkInterval = null;

async function checkBackendStatus() {
  try {
    isBackendReachable.value = await apiService.isBackendReachable();
    console.log(isBackendReachable.value ? "Backend ist erreichbar" : "Backend ist nicht erreichbar");
  } catch (error) {
    console.error("Fehler beim Prüfen der Backend-Erreichbarkeit", error);
    isBackendReachable.value = false;
  }
}

onMounted(async () => {
  await checkBackendStatus();
  checkInterval = setInterval(checkBackendStatus, 5000);
});

onBeforeUnmount(() => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
});
</script>

<style scoped></style>
