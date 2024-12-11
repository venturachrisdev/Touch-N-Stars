<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold mb-4">Suche</h5>
    <div class="relative text-black mx-auto max-w-md">
      <input type="text" v-model="searchQuery" @input="fetchSuggestions"
        class="w-full p-2 border border-gray-300 rounded" placeholder="Geben Sie einen Suchbegriff ein..." />
      <ul v-if="suggestions.length > 0"
        class="absolute left-0 right-0 bg-white border border-gray-300 rounded mt-1 z-10">
        <li v-for="(item, index) in suggestions" :key="index" class="p-2 hover:bg-gray-200 cursor-pointer"
          @click="selectSuggestion(item)">
          {{ item.Name }}
          <span v-if="item['Common names']"> ({{ item['Common names'] }})</span>
          <span v-if="item['M']"> (M {{ item['M'] }})</span>
        </li>
      </ul>
    </div>

    <!-- Ausgewählter Eintrag -->
    <div v-if="selectedItem" class="mt-4 bg-white text-black p-4 rounded shadow">
      <h6 class="text-lg font-bold">Ausgewählter Eintrag:</h6>
      <p><strong>Name:</strong> {{ selectedItem['Common names'] }}</p>
      <p><strong>NGC:</strong> {{ selectedItem.Name }}</p>
      <p><strong>Typ:</strong> {{ selectedItem.Type }}</p>
      <p><strong>RA:</strong> {{ selectedItem.RA }}</p>
      <p><strong>Dec:</strong> {{ selectedItem.Dec }}</p>
    </div>
    <div>
      <img :src="imageUrl" alt="Himmelsbild" />
    </div>
    <div>
      <slewAndCenter />
    </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";
import slewAndCenter from '../components/slewAndCenter.vue';

export default {
  components: {
    slewAndCenter,
  },
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      selectedItem: null, 
      imageUrl: null,
    };
  },
  methods: {
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
      this.selectedItem = item; // Ausgewählten Eintrag speichern

      const modifiedFileName = item.Image.FileName.replace('.jpg', '_500px.jpg'); // Fügt "_150px" vor ".jpg" hinzu
      this.imageUrl = `http://192.168.2.128:5000/cache/${modifiedFileName}`;
     // this.imageUrl = `/cache/${modifiedFileName}`;
      this.$emit('itemSelected', item);
      console.log(this.imageUrl);
    }
  }
};
</script>
