<template>
    <div class="">
        <div class="flex flex-col border border-gray-500 p-1 pb-2 rounded-lg h-full">
            <label for="gain" class="text-xs mb-1 text-gray-400">Filter: </label>
            <div v-if="store.filterInfo.AvailableFilters && store.filterInfo.AvailableFilters.length > 0">
                <select id="filter" v-model.number="store.filterNr"
                    @change="changeFilter"
                    class="w-28 text-black px-3 h-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700">
                    <!-- Option für 'Unbekannt' hinzufügen -->
                    <option :value="null" disabled>Unbekannt</option>
                    <!-- Name anzeigen und ID speichern -->
                    <option v-for="filter in store.filterInfo.AvailableFilters" :key="filter.Id" :value="filter.Id">
                        {{ filter.Name }}
                    </option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import apiService from '@/services/apiService';
import { apiStore } from '@/store/store'

// Initialisiere Stores
const store = apiStore()

async function changeFilter() {
    
    try {
        const data = apiService.changeFilter(store.filterNr);
        console.log("Antwort:", data);
        console.log("Filter:", store.filterNr);
    } catch (error) {
        console.log("Fehler:", error);
    }
}

onMounted(async () => {
    store.filterNr = store.filterInfo.SelectedFilter.Id;
    store.filterInfo = store.filterInfo.SelectedFilter.Name;
});
</script>
