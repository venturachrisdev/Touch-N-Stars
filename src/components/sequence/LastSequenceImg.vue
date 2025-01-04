<template>
    <div class="flex ">
        <div ref="imageContainer" class="image-container max-w-2/3 overflow-hidden 
                   touch-auto bg-gray-800 shadow-lg shadow-cyan-700/40
                   rounded-xl border border-cyan-700">
            <img v-if="imageData" ref="image" @click="openModal" :src="imageData" alt="Aufgenommenes Bild"
                class="block" />
        </div>
        <div v-if="imageData"
            class="w1/3 border border-cyan-700 bg-gray-800 shadow-lg shadow-cyan-700/40 rounded-xl p-4 ml-4">
            <p>Date: {{ Date }}</p>
            <p>ExposureTime: {{ ExposureTime }}</p>
            <p>HFR: {{ HFR }}</p>
            <p>Stars: {{ Stars }}</p>
            <p>Mean: {{ Mean }}</p>
            <p>Median: {{ Median }}</p>
            <p>StDev: {{ StDev }}</p>
            <p>RmsText: {{ RmsText }}</p>
            <p>Temperature: {{ Temperature }}</p>
            <p>Filter: {{ Filter }}</p>
        </div>
        <ImageModal :showModal="showModal" :imageData="imageDataModal" @close="closeModal" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { apiStore } from "@/store/store";
import apiService from "@/services/apiService";
import ImageModal from "./imageModal.vue";

const store = apiStore();
const imageData = ref(null);
const imageDataModal = ref(null);
const Filter = ref(null);
const HFR = ref(null);
const Mean = ref(null);
const Median = ref(null);
const RmsText = ref(null);
const StDev = ref(null);
const Stars = ref(null);
const Temperature = ref(null);
const ExposureTime = ref(null);
const Date = ref(null);
const showModal = ref(false);
const lastImgIndex = ref(null);

// Modal öffnen / schließen
function openModal() {
    showModal.value = true;

}
function closeModal() {
    showModal.value = false;
}

async function getlastImage(index, quality, resize, scale) {
   
    try {
        const result = await apiService.getSequenceImage(index, quality, resize, scale);
        const image = result?.Response;
        console.log(image);
        if (image) {
            imageData.value = `data:image/jpeg;base64,${image}`;
            console.log('Bild geladen:')
            setSelectedDataset(index);
            lastImgIndex.value = index;
        }
        const resultModal = await apiService.getSequenceImage(index, 80, false, 1);
        const imageModal = resultModal?.Response;
        if (imageModal) {
            imageDataModal.value = `data:image/jpeg;base64,${imageModal}`;
            console.log('Bild geladen Modal')
        }
    } catch (error) {
        console.error('Fehler beim Abrufen des Bildes:', error.message)
    }
}


function setSelectedDataset(datasetIndex) {
    // Prüfen, ob Daten überhaupt vorhanden sind
    if (!store.imageHistoryInfo || store.imageHistoryInfo.length === 0) return;

    // Datensatz anhand eines Kriteriums finden, z.B. "Index"
    const selectedData = store.imageHistoryInfo.find(item => item.Index === datasetIndex);
    console.log('selectedData:', selectedData);
    if (selectedData) {
        // Refs mit Werten befüllen
        Filter.value = selectedData.Filter;
        HFR.value = selectedData.HFR;
        Mean.value = selectedData.Mean;
        Median.value = selectedData.Median;
        RmsText.value = selectedData.RmsText;
        StDev.value = selectedData.StDev;
        Stars.value = selectedData.Stars;
        Temperature.value = selectedData.Temperature;
        ExposureTime.value = selectedData.ExposureTime;
        Date.value = selectedData.Date;

    }
}


onMounted(() => {

});

onBeforeUnmount(() => {

});



watch(
    () => store.imageHistoryInfo,
    (newVal, oldVal) => {
        //Prüfen, ob es mehr Elemente als vorher gibt
        if (newVal.length > oldVal.length) {
            // Letztes Element im Array
            const latestEntry = newVal[newVal.length - 1];
            // Index-Wert des neuesten Datensatzes
            const latestIndex = latestEntry.Index;
            console.log("Neuster Datensatz, Index:", latestIndex);
             getlastImage(latestIndex, 80, false, 1);
        }
    },
    {
        immediate: false,
    }
);
</script>

<style scoped></style>