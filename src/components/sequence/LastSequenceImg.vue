<template>

    <div class="flex flex-col landscape:flex-row justify-center ">
        <div ref="imageContainer" class="image-container  landscape:max-w-[75%]  overflow-hidden 
                   touch-auto bg-gray-800 shadow-lg shadow-cyan-700/40
                   rounded-xl border border-cyan-700">
            <img v-if="imageData" ref="image" @click="openModal" :src="imageData" alt="Aufgenommenes Bild"
                class="block w-full max-h-[50svh]" />
        </div>
        <div v-if="imageData"
            class="border border-cyan-700 bg-gray-800 shadow-lg shadow-cyan-700/40 rounded-xl p-4 portrait:mt-2 landscape:ml-4 text-sm ">
            <p v-if="formattedDate">Date: {{ formattedDate }}</p>
            <p v-if="ExposureTime">ExposureTime: {{ ExposureTime.toFixed(2) }}</p>
            <p v-if="HFR">HFR: {{ HFR.toFixed(2) }}</p>
            <p v-if="Stars">Stars: {{ Stars }}</p>
            <p v-if="Mean">Mean: {{ Mean.toFixed(2) }}</p>
            <p v-if="Median">Median: {{ Median }}</p>
            <p v-if="StDev">StDev: {{ StDev.toFixed(2) }}</p>
            <p v-if="RmsText">RmsText: {{ RmsText }}</p>
            <p v-if="Temperature !== 'NaN'">Temperature: {{ Temperature }}</p>
            <p v-if="Filter">Filter: {{ Filter }}</p>
        </div>
        <ImageModal :showModal="showModal" :imageData="imageDataModal" @close="closeModal" />
        
    </div>
   

</template>

<script setup>
import { ref, computed, watch } from "vue";
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
const dateValue = ref(null);
const showModal = ref(false);
const lastImgIndex = ref(null);

// Computed Property für das Formatieren des Datums
const formattedDate = computed(() => {
  if (!dateValue.value) return "";
  
  const dateObj = new Date(dateValue.value);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
});

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
        if (image) {
            imageData.value = `data:image/jpeg;base64,${image}`;
            setSelectedDataset(index);
            lastImgIndex.value = index;
        }
        const resultModal = await apiService.getSequenceImage(index, 80, false, 1);
        const imageModal = resultModal?.Response;
        if (imageModal) {
            imageDataModal.value = `data:image/jpeg;base64,${imageModal}`;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen des Bildes:', error.message);
    }
}

function setSelectedDataset(datasetIndex) {
    if (!store.imageHistoryInfo || store.imageHistoryInfo.length === 0) return;

    const selectedData = store.imageHistoryInfo[datasetIndex];
    if (selectedData) {
        Filter.value = selectedData.Filter;
        HFR.value = selectedData.HFR;
        Mean.value = selectedData.Mean;
        Median.value = selectedData.Median;
        RmsText.value = selectedData.RmsText;
        StDev.value = selectedData.StDev;
        Stars.value = selectedData.Stars;
        Temperature.value = selectedData.Temperature;
        ExposureTime.value = selectedData.ExposureTime;
        dateValue.value = selectedData.Date; 
    }
}

watch(
    () => store.imageHistoryInfo,
    (newVal, oldVal) => {
        if (!oldVal || newVal.length > oldVal.length) {
            const latestIndex = newVal.length - 1;
            getlastImage(latestIndex, 80, false, 1);
        }
    },
    { immediate: false }
);
</script>


<style scoped></style>
