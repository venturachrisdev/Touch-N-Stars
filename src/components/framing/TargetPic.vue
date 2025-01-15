<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md">
      <img
        class="rounded-md"
        v-if="targetPic"
        :src="targetPic"
        alt="Bild konnte nicht geladen werden"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import apiService from '@/services/apiService';
import { useFramingStore } from '@/store/framingStore';

const framingStore = useFramingStore();
const targetPic = ref(null);

async function getTargetPic() {
  try {
    const ra = framingStore.RAangleStringDeg;
    const dec = framingStore.DECangleStringDeg;
    console.log('Bild wird abgerufen', 'RA: ', ra, 'DEC: ', dec);
    if (targetPic.value) {
      URL.revokeObjectURL(targetPic.value);
    }
    targetPic.value = await apiService.searchTargetPic(200, 200, 2, ra, dec);
  } catch (error) {
    console.error('Fehler beim Abrufen des Bildes:', error);
  }
}

function loadImage() {
  getTargetPic();
}

// Beobachte Änderungen an RAangleString und DECangleString
watch(() => framingStore.RAangleStringDeg, loadImage);
watch(() => framingStore.DECangleStringDeg, loadImage);

// Lade das Bild beim Mounten der Komponente
onMounted(() => {
  loadImage();
});
</script>

<style scoped></style>
