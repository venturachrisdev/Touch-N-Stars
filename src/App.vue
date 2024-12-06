<template>
  <div class=" dark min-h-screen bg-gray-900 text-white ">
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
    <div class="container mx-auto  p-4  transition-all">
      <router-view />
    </div>
</div>
</div>
</template>

<script>
import { useHead } from '@vueuse/head';
import NavigationComp from './components/NavigationComp.vue';
import apiService from "@/services/apiService"; 

export default {
  data(){
    return {
      isBackendReachable: false,
      checkInterval: null, // Speichert die ID des Intervalls
    };
  },
  setup() {
    useHead({
      title: "NINA WebApp",
    });
  },
  async mounted() {
    // Initiale Prüfung
    await this.checkBackendStatus();

    // Setze ein Intervall zur regelmäßigen Prüfung
    this.checkInterval = setInterval(this.checkBackendStatus, 5000); // Alle 10 Sekunden
  },
  beforeUnmount() {
    // Räumt das Intervall auf, wenn die Komponente zerstört wird
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
  components: {
    NavigationComp,
  },
  methods: {
    async checkBackendStatus() {
      try {
        this.isBackendReachable = await apiService.isBackendReachable();
        console.log(this.isBackendReachable ? "Backend ist erreichbar" : "Backend ist nicht erreichbar");
      } catch (error) {
        console.error("Fehler beim Prüfen der Backend-Erreichbarkeit", error);
        this.isBackendReachable = false;
      }
    },
  },
};
</script>


<style scoped>

</style>
