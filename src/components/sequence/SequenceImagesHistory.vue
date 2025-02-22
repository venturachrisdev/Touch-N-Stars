<template>
    <div>
        <div class="flex items-center space-x-3 mb-4">
            <button @click="showImageHistory = !showImageHistory"
                class="w-7 h-7 bg-gray-700 active:bg-cyan-700 hover:bg-cyan-600 rounded-md border border-cyan-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white transition-transform duration-300"
                    :class="{ '-rotate-90': showImageHistory }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
            <p class="text-sm italic">Images history</p>
            <div class="flex-grow h-[1px] bg-gray-700"></div>
        </div>
        <div v-if="showImageHistory">
            <div class="grid grid-cols-2 gap-2">
                <img v-for="image in imageHistory" :src="image.data" class="cursor-pointer" @click="openModal(image)" />
                <div v-if="isLoadingImages" class="flex items-center justify-center p-5 h-full min-h-[300px]">
                    <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    </div>

    <ImageModal :showModal="showModal" :imageData="imageDataModal" :isLoading="isLoadingModal" @close="closeModal" />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import ImageModal from '@/components/helpers/imageModal.vue';
import { apiStore } from '@/store/store';
import { useSettingsStore } from '@/store/settingsStore';
import apiService from '@/services/apiService';

const imageHistory = ref([]);
const store = apiStore();
const settingsStore = useSettingsStore();
const showImageHistory = ref(false);
const isLoadingImages = ref(false);

// Modal data
const isLoadingModal = ref(false);
const showModal = ref(false);
const imageDataModal = ref(null);

function openModal(image) {
    showModal.value = true;
    imageDataModal.value = image.data;
}

function closeModal() {
    showModal.value = false;
}

async function getImageByIndex(index) {
    try {
        const result = await apiService.getSequenceImage(index, settingsStore.camera.imageQuality, true, 0.5);
        if (result.StatusCode != 200) {
            console.error('Unknown error: Check NINA Logs for more information');
            return;
        }
        const image = result?.Response;
        return image;

    } catch (error) {
        console.error(`An error happened while getting image with index ${index}`, error.message);
        return;
    }
}

function addImageToHistory(imageIndex, imageData) {
    imageHistory.value.push({ data: `data:image/jpeg;base64,${imageData}`, index: imageIndex });
}

async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

watch(
    () => store.imageHistoryInfo,
    async (newVal, oldVal) => {
        if (!oldVal || newVal.length > oldVal.length) {
            const latestIndex = newVal.length - 1;
            const isImageLoaded = imageHistory.value.some(image => image.index == latestIndex).length > 0;

            if (!isImageLoaded) {
                await wait(3000); // Wait 3 seconds. The image may not be available yet.
                isLoadingImages.value = true;
                const image = await getImageByIndex(latestIndex);
                addImageToHistory(latestIndex, image);
                isLoadingImages.value = false;
            }
        }
    },
    { immediate: false }
);


onMounted(async () => {
    isLoadingImages.value = true;
    const historyWithoutLatest = store.imageHistoryInfo.slice(0, -1);

    for (const imageIndex in historyWithoutLatest) {
        const image = await getImageByIndex(imageIndex);
        addImageToHistory(imageIndex, image);
    }
    isLoadingImages.value = false;
});

</script>
