<template>
  <div>
    <div class="flex flex-col border border-gray-500 p-1 pb-2 rounded-lg">
      <label for="position" class="text-xs mb-1 text-gray-400">Rotator: </label>
      <div class="flex gap-2 ">
        <input id="position" v-model.number="store.rotatorMechanicalPosition" type="number"
          class="text-black px-4 h-10 w-40 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
          placeholder="1" step="1" />
        <button
          class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
          @click="moveRotator">
          Bewegen
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import apiService from "@/services/apiService";
import { apiStore } from '@/store/store';

const store = apiStore();

async function moveRotator() {
  try {
    await apiService.moveMechanicalRotator(store.rotatorMechanicalPosition);
    console.log("Rotator dreht");
  } catch (error) {
    console.log("Fehler beim parken der Montierung");
  }
}





</script>