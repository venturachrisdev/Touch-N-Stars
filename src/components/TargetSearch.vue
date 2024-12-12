<template>
  <div class="container flex tems-center justify-center">
    <div class="container max-w-md ">
      <h5 class="text-xl font-bold mb-4">Suche</h5>
      <div class=" text-black mx-auto max-w-md">
        <input type="text" v-model="searchQuery" @input="fetchSuggestions"
          class="w-full p-2 border border-gray-300 rounded" placeholder="Geben Sie einen Suchbegriff ein..." />
        <ul v-if="suggestions.length > 0" class=" bg-white border border-gray-300 rounded mt-1 z-10">
          <li v-for="(item, index) in suggestions" :key="index" class="p-2 hover:bg-gray-200 cursor-pointer"
            @click="selectSuggestion(item)">
            {{ item.Name }}
            <span v-if="item['Common names']"> ({{ item['Common names'] }})</span>
            <span v-if="item['M']"> (M {{ item['M'] }})</span>
          </li>
        </ul>
      </div>
      <!-- Ausgewählter Eintrag -->
      <div v-if="selectedItem" class="flex mt-4 p-4 border  border-gray-700 rounded shadow">
        <div>
          <div class="text-xs ">
            <p v-if="selectedItem['Common names']"><strong>Name:</strong> {{ selectedItem['Common names'] }}</p>
            <p> <strong>NGC:</strong> {{ selectedItem.Name }}</p>
            <p v-if="selectedItem.M"> <strong>M:</strong> M{{ selectedItem.M }}</p>
          </div>
        </div>
        <div class="border border-gray-700 rounded-md ml-3">
          <TargetPic v-model:RAangleString="RAangleString" v-model:DECangleString="DECangleString" />
        </div>
      </div>
      <div class="mt-4">
        <slewAndCenter v-model:RAangleString="RAangleString" v-model:DECangleString="DECangleString" />
      </div>
    </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";
import slewAndCenter from '../components/slewAndCenter.vue';
import TargetPic from '../components/TargetPic.vue';

export default {
  components: {
    slewAndCenter,
    TargetPic,
  },
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      selectedItem: null,
      RAangleString: "",
      DECangleString: "",
    };
  },
  async mounted() {
    await this.loadNgcCache(); // Lade Cache beim Laden der Seite
  },
  methods: {
    async loadNgcCache() {
      try {
        const data = await apiService.getNgcCache();
        if (data ) {
          this.selectedItem = data.data.item
          this.RAangleString = data.data.item.RA;
          this.DECangleString = data.data.item.Dec;
          console.log("Cache erfolgreich geladen:", data.data.item);
        } else {
          console.warn("Kein Cache verfügbar.");
        }
      } catch (error) {
        console.error("Fehler beim Laden des Caches:", error);
      }
    },
    async fetchSuggestions() {
      if (this.searchQuery.trim() === '') {
        this.suggestions = [];
        return;
      }
      try {
        const data = await apiService.searchNGC(this.searchQuery, 10);
        this.suggestions = data;
        // console.log(data);
      } catch (error) {
        console.error('Fehler beim Laden der Vorschläge:', error);
        this.suggestions = [];
      }
    },
    selectSuggestion(item) {
      this.searchQuery = item.Name || '';
      this.suggestions = [];
      this.selectedItem = item;
      this.RAangleString = item.RA;
      this.DECangleString = item.Dec;
      try {
         apiService.updateNgcCache({
          item,
    
        });
        console.log("Cache erfolgreich aktualisiert:", item);
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Caches:", error);
      }
  
    }
  }
};
</script>
