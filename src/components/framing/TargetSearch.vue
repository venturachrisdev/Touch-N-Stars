<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md">
      <h5 class="text-xl font-bold mb-4">{{ $t('components.framing.search.title') }}</h5>
      <div class="text-black mx-auto">
        <input
          type="text"
          v-model="searchQuery"
          @input="fetchSuggestions"
          class="w-full p-2 border border-gray-300 rounded"
          :placeholder="$t('components.framing.search.placeholder')"
        />
        <!-- Überprüfe, ob suggestions ein Array ist und Elemente hat -->
        <ul v-if="Array.isArray(suggestions) && suggestions.length > 0" class="bg-white border border-gray-300 rounded mt-1 z-10">
          <li
            v-for="(item, index) in suggestions"
            :key="index"
            class="p-2 hover:bg-gray-200 cursor-pointer"
            @click="selectSuggestion(item)"
          >
            {{ item.Name }}
            <span v-if="item['Common names']"> ({{ item['Common names'] }})</span>
            <span v-if="item['M']"> (M {{ item['M'] }})</span>
          </li>
        </ul>
      </div>

      <!-- Ausgewählter Eintrag -->
      <div v-if="selectedItem" class="grid grid-cols-2 mt-4 p-4 border border-gray-700 rounded shadow">
        <div class="text-xs">
          <p v-if="selectedItem['Common names']"><strong>Name:</strong> {{ selectedItem['Common names'] }}</p>
          <p><strong>NGC:</strong> {{ selectedItem.Name }}</p>
          <p v-if="selectedItem.M"><strong>M:</strong> M{{ selectedItem.M }}</p>
        </div>
        <div>
          <TargetPic
            class="border border-gray-500 rounded-md"
            v-model:RAangleString="RAangleString"
            v-model:DECangleString="DECangleString"
          />
        </div>
      </div>

      <div class="mt-4">
        <slewAndCenter
          v-model:RAangleString="RAangleString"
          v-model:DECangleString="DECangleString"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiService from "@/services/apiService";
import slewAndCenter from '@/components/framing/slewAndCenter.vue';
import TargetPic from '@/components/framing/TargetPic.vue';

const searchQuery = ref('');
// suggestions wird als Array initialisiert
const suggestions = ref([]);
const selectedItem = ref(null);
const RAangleString = ref("");
const DECangleString = ref("");

async function loadNgcCache() {
  try {
    const data = await apiService.getNgcCache();
    if (data && data.data && data.data.item) {
      selectedItem.value = data.data.item;
      RAangleString.value = data.data.item.RA;
      DECangleString.value = data.data.item.Dec;
      console.log("Cache erfolgreich geladen:", data.data.item);
    } else {
      console.warn("Kein Cache verfügbar oder ungültiges Format.");
    }
  } catch (error) {
    console.error("Fehler beim Laden des Caches:", error);
  }
}

async function fetchSuggestions() {
  if (searchQuery.value.trim() === '') {
    suggestions.value = [];
    return;
  }
  try {
    const data = await apiService.searchNGC(searchQuery.value, 10);
    // Sicherstellen, dass data ein Array ist
    if (Array.isArray(data)) {
      suggestions.value = data;
    } else {
      console.warn("Die API hat kein Array zurückgegeben, 'suggestions' wird geleert.");
      suggestions.value = [];
    }
  } catch (error) {
    console.error('Fehler beim Laden der Vorschläge:', error);
    suggestions.value = [];
  }
}

function selectSuggestion(item) {
  searchQuery.value = item.Name || '';
  suggestions.value = [];
  selectedItem.value = item;
  RAangleString.value = item.RA;
  DECangleString.value = item.Dec;
  try {
    apiService.updateNgcCache({ item });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Caches:", error);
  }
}

onMounted(async () => {
  await loadNgcCache();
});
</script>

<style scoped></style>
