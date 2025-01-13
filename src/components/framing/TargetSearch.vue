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
import { ref } from 'vue'
import apiService from "@/services/apiService";
import slewAndCenter from '@/components/framing/slewAndCenter.vue';
import TargetPic from '@/components/framing/TargetPic.vue';

const searchQuery = ref('');
// suggestions wird als Array initialisiert
const suggestions = ref([]);
const selectedItem = ref(null);
const RAangleString = ref("");
const DECangleString = ref("");

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
      console.log('Suche: ', data)
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
  RAangleString.value = degreesToHMS(item.RA);
  DECangleString.value = degreesToDMS(item.Dec);
}

function degreesToHMS(deg) {
  // Schritt 1: Grad in Stunden umrechnen
  const totalHours = deg / 15;

  // Ganze Stunden ermitteln
  const h = Math.floor(totalHours);

  // Schritt 2: Minuten
  const remainingHours = totalHours - h;
  const totalMinutes = remainingHours * 60;
  const m = Math.floor(totalMinutes);

  // Schritt 3: Sekunden
  const remainingMinutes = totalMinutes - m;
  const s = remainingMinutes * 60;

  // Formatierung (z. B. auf eine Nachkommastelle)
  const hStr = String(h).padStart(1, '0');      // Stunden dürfen ruhig einstellig bleiben
  const mStr = String(m).padStart(2, '0');      // Minuten zweistellig
  const sStr = s.toFixed(1).padStart(4, '0');   // Sekunden mit einer Nachkommastelle
  
  return `${hStr}:${mStr}:${sStr}`;
}
function degreesToDMS(deg) {
  console.log('degreesToDMS ', deg);
  // 1) Vorzeichen merken und Absolutwert nehmen
  const sign = deg < 0 ? '-' : '+';
  deg = Math.abs(deg);

  // 2) Ganze Grad
  const d = Math.floor(deg);

  // 3) Minuten
  const remainingDeg = deg - d;
  const totalMinutes = remainingDeg * 60;
  const m = Math.floor(totalMinutes);

  // 4) Sekunden
  const remainingMinutes = totalMinutes - m;
  const s = remainingMinutes * 60;

  // 5) Formatierung
  //    a) Grad: max. zwei Ziffern, da DEC zwischen -90° und +90° liegt
  //    b) Minuten/Sekunden: jeweils zweistellig
  const dStr = String(d).padStart(2, '0');
  const mStr = String(m).padStart(2, '0');
  // Auf eine Nachkommastelle runden, z. B. 0.1"
  const sStr = s.toFixed(1).padStart(4, '0');

  // 6) Zusammenbauen: ±DD:MM:SS.s
  return `${sign}${dStr}:${mStr}:${sStr}`;
}


</script>

<style scoped></style>
