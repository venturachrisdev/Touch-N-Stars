<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md landscape:max-w-xl">
      <infoFocuser v-model="store.focuserInfo.Connected" class="grid grid-cols-2 landscape:grid-cols-3" />

      <div v-if="store.focuserInfo.Connected" class="flex flex-col text-left mt-4">
        <div class="flex space-x-3 items-center">
          <label for="position" class="w-auto">Neue Position:</label>
          <input
            id="position"
            v-model.number="position"
            type="number"
            class="text-black px-4 h-10 w-40 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
            placeholder="1"
            step="50"
          />
          <button
            class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
            @click="moveFocuser"
          >
            Bewegen
          </button>
        </div>
        <div class="mt-4">
          <button
            class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
            @click="startAutofocus"
          >
            Starte Autofokus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import apiService from "@/services/apiService";
import infoFocuser from '../components/infoFocuser.vue';
import { apiStore } from '@/store/store';

const store = apiStore();
const position = ref(null)
const loading = ref(false)

async function moveFocuser() {
  try {
    loading.value = true;
    await apiService.moveFocuser(position.value);
  } catch (error) {
    console.error("Fehler beim Bewegen des Fokussierers:", error);
  } finally {
    loading.value = false;
  }
}

async function startAutofocus() {
  try {
    await apiService.focusAction("auto-focus");
  } catch (error) {
    console.error("Fehler beim Autofokus", error);
  }
}
</script>

<style scoped></style>
