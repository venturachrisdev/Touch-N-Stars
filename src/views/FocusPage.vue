<template>
  <div class="container flex tems-center justify-center">
    <div class="container max-w-md landscape:max-w-xl">
      <infoFocuser v-model="isConnected" class="grid grid-cols-2 landscape:grid-cols-3" />
      <div v-if="!isConnected" >
      </div>
      <div v-else class="flex flex-col text-left mt-4">
        <div class="flex space-x-3 items-center">
          <label for="position" class=" w-auto">Neue Position:</label>
          <input id="position" v-model.number="position" type="number"
            class="text-black px-4 h-10 w-40 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
            placeholder="1" step="50" />
          <button
            class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
            @click="moveFocuser" :disabled="loading">
            Bewegen
          </button>
        </div>
        <div class="mt-4">
          <button
            class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
            @click="startAutofocus" :disabled="loading">
            Starte Autofokus
          </button>
        </div>

      </div>
    </div>
  </div>

</template>

<script>
import apiService from "@/services/apiService";
import infoFocuser from '../components/infoFocuser.vue';

export default {
  components: {
    infoFocuser,
  },
  data() {
    return {
      position: null, // Eingabeposition
      loading: false, // Status des Buttons
      intervalId: null, // ID für setInterval
    };
  },
  async mounted() {
  },
  beforeUnmount() {

  },
  methods: {
    async moveFocuser() {
      try {
        this.loading = true;
        await apiService.moveFocuser(this.position); // Fokussierer bewegen
        this.loading = false;
      } catch (error) {
        console.error("Fehler beim Bewegen des Fokussierers:", error);
        this.loading = false;
      }
    },
    async startAutofocus() {
      try {
        await apiService.focusAction("auto-focus"); // Fokussierer bewegen
      } catch (error) {
        console.error("Fehler beim Autofokus", error);
      }
    },
  },
};
</script>
