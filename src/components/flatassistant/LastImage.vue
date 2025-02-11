<template>
  <div>
    <p v-if="isLoadingImg"></p>
    <img v-else :src="imageData" alt="Flat Image" />
  </div>
</template>

<script setup>
import apiService from '@/services/apiService';
import { useFlatassistantStore } from '@/store/flatassistantStore';
import { ref, watch, onMounted } from 'vue';
import { wait } from '@/utils/utils';

const flatsStore = useFlatassistantStore();
const imageData = ref(null);
const isLoadingImg = ref(true);

async function getlastImage(index, quality, resize, scale) {
  try {
    const result = await apiService.getSequenceImageFilterd(index, quality, resize, scale, 'FLAT');
    if (result.StatusCode != 200) {
      console.error('Unknown error: Check NINIA Log for more information');
      return;
    }
    const image = result?.Response;
    if (image) {
      imageData.value = `data:image/jpeg;base64,${image}`;
      isLoadingImg.value = false;
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des Bildes:', error.message);
  }
}

watch(
  () => flatsStore.status.CompletedIterations,
  async () => {
    const imageHistoryAllFilterd = await apiService.imageHistoryAllFilterd('FLAT');
    const latestIndex = imageHistoryAllFilterd.Response.length - 1;
    console.log('Watch imageHistoryInfo');
    console.log('latestIndex: ', latestIndex);
    if (latestIndex > 0 && isLoadingImg.value === false) {
      await wait(1000); // Es kann sein, dass das Bild noch nicht verfügbar ist
      getlastImage(latestIndex, 50, true, 0.3);
    }
  },
  { immediate: false }
);

onMounted(async () => {
  const imageHistoryAllFilterd = await apiService.imageHistoryAllFilterd('FLAT');
  const latestIndex = imageHistoryAllFilterd.Response.length - 1;
  console.log('latestIndex: ', latestIndex);
  if (latestIndex > 0) {
    getlastImage(latestIndex, 50, true, 0.3);
  }
});
</script>
