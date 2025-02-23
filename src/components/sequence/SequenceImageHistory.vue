<template>
  <div class="grid grid-cols-1 gap-2">
    <div v-for="image in imageHistory" v-bind:key="image.data" class="relative">
      <SequenceImage
        :image="image.data"
        :stats="image.stats"
        :showStats="settingsStore.monitorViewSetting.showImageStats"
      />
    </div>
    <div v-if="isLoadingImages" class="flex items-center justify-center p-5 h-full min-h-[300px]">
      <div
        class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import SequenceImage from '@/components/sequence/SequenceImage.vue';
import { apiStore } from '@/store/store';
import { useSettingsStore } from '@/store/settingsStore';
import apiService from '@/services/apiService';

const imageHistory = ref([]);
const store = apiStore();
const settingsStore = useSettingsStore();
const isLoadingImages = ref(false);

async function getImageByIndex(index) {
  try {
    const result = await apiService.getSequenceImage(
      index,
      settingsStore.camera.imageQuality,
      true,
      0.5
    );
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

function addImageToHistory(imageIndex, imageData, stats) {
  imageHistory.value.push({
    stats,
    data: `data:image/jpeg;base64,${imageData}`,
    index: imageIndex,
  });
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

watch(
  () => store.imageHistoryInfo,
  async (newVal, oldVal) => {
    if (!oldVal || newVal.length > oldVal.length) {
      const latestIndex = newVal.length - 1;
      const isImageLoaded =
        imageHistory.value.some((image) => image.index == latestIndex).length > 0;

      if (!isImageLoaded) {
        await wait(3000); // Wait 3 seconds. The image may not be available yet.
        isLoadingImages.value = true;
        const stats = newVal[latestIndex];
        const image = await getImageByIndex(latestIndex);
        addImageToHistory(latestIndex, image, stats);
        isLoadingImages.value = false;
      }
    }
  },
  { immediate: false }
);

onMounted(async () => {
  isLoadingImages.value = true;

  for (const imageIndex in store.imageHistoryInfo) {
    const image = await getImageByIndex(imageIndex);
    const stats = store.imageHistoryInfo[imageIndex];
    addImageToHistory(imageIndex, image, stats);
  }
  isLoadingImages.value = false;
});
</script>
