<template>
    <div class="container flex items-center justify-center">
      <div class="container max-w-md">
        <img class="rounded-md" v-if="targetPic" :src="targetPic" alt="Bild konnte nicht geladen werden">
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue'
  import apiService from "@/services/apiService";
  
  // eslint-disable-next-line 
  const props = defineProps({
    RAangleString: String,
    DECangleString: String,
  });
  
  const targetPic = ref(null);
  
  function hmsToDegrees(hmsString) {
    const parts = hmsString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    return hours * 15 + minutes * (15 / 60) + seconds * (15 / 3600);
  }
  
  function dmsToDegrees(dmsString) {
    const sign = dmsString.startsWith("-") ? -1 : 1;
    const stripped = dmsString.replace("-", "");
    const parts = stripped.split(":");
    
    if (parts.length !== 3) {
      throw new Error("Ungültiges Format. Erwartet: ±DD:MM:SS.s");
    }
  
    const degrees = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
  
    return sign * (degrees + minutes / 60 + seconds / 3600);
  }
  
  async function getTargetPic() {
    try {
      const ra = hmsToDegrees(props.RAangleString);
      const dec = dmsToDegrees(props.DECangleString);
  
      console.log("Bild wird abgerufen");
      if (targetPic.value) {
        URL.revokeObjectURL(targetPic.value);
      }
  
      targetPic.value = await apiService.searchTargetPic(200, 200, 2, ra, dec);
    } catch (error) {
      console.error("Fehler beim Abrufen des Bildes:", error);
    }
  }
  
  function loadImage() {
    getTargetPic();
  }
  
  // Beobachte Änderungen an RAangleString und DECangleString
  watch(() => props.RAangleString, loadImage);
  watch(() => props.DECangleString, loadImage);
  
  // Lade das Bild beim Mounten der Komponente
  onMounted(() => {
    loadImage();
  });
  </script>
  
  <style scoped></style>
  