<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
    <div
      class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
    ></div>
  </div>
  <div v-else>
    <div
      id="fov"
      class="border relative overflow-hidden"
      :style="{
        width: `${framingStore.containerSize}px`,
        height: `${framingStore.containerSize}px`,
        position: 'relative',
      }"
      ref="containerRef"
    >
      <!-- TargetPic als Hintergrund -->
      <img class="absolute inset-0" ref="imageRef" :src="cameraStore.imageData" />

      <!-- Verschiebbares / drehbares Ziel-Element -->
      <div
        class="target"
        ref="targetRef"
        :style="{
          width: `${framingStore.camWidth}px`,
          height: `${framingStore.camHeight}px`,
          transform: `translate(${x}px, ${y}px) rotate(${-framingStore.rotationAngle}deg)`,
          zIndex: 2,
        }"
      ></div>

      <!-- Moveable-->
      <Moveable
        ref="moveableRef"
        :target="targetRef"
        :draggable="true"
        :rotatable="false"
        @drag="onDrag"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import Moveable from 'vue3-moveable';
import { useFramingStore } from '@/store/framingStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useCameraStore } from '@/store/cameraStore';
import apiService from '@/services/apiService';
import { degreesToHMS, degreesToDMS, rad2deg } from '@/utils/utils.js';

const framingStore = useFramingStore();
const cameraStore = useCameraStore();
const settingsStore = useSettingsStore();
const isLoading = ref(true);
const targetPic = ref(null);
const scaleDegPerPixel = ref(0.004); // Grad pro Pixel
const baseRA = cameraStore?.plateSolveResult?.Coordinates?.RADegrees;
const baseDec = cameraStore?.plateSolveResult?.Coordinates?.Dec;
const x = ref(0);
const y = ref(0);
const containerRef = ref(null);
const targetRef = ref(null);
const moveableRef = ref(null);
const imageRef=ref(null);
const imageWidth = ref(0);
const imageHeight = ref(0);

onMounted(async () => {
  console.log("Plate Solve Result:", cameraStore.plateSolveResult);
  console.log("Verfügbare Keys:", Object.keys(cameraStore.plateSolveResult));
  console.log("RA Degrees:", cameraStore.plateSolveResult.Coordinates.RADegrees);
  // Container-Größe berechnen
  const smallerDimension = Math.min(window.innerWidth, window.innerHeight - 200);
  const roundedDimension = Math.floor(smallerDimension / 100) * 100;
  framingStore.containerSize = roundedDimension;
  console.log('roundedDimension', roundedDimension);
  framingStore.camWidth = 100;
  framingStore.camHeight = 100;
  // Element in die Mitte setzen
  x.value = framingStore.containerSize / 2 - framingStore.camWidth / 2;
  y.value = framingStore.containerSize / 2 - framingStore.camHeight / 2;

  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 500));
  isLoading.value = false;
});

watch(
  () => framingStore.rotationAngle,
  () => {
    console.log('debounceRotateRange:', framingStore.rotationAngle);
    debounceRotateRange();
  }
);

watch(
  () => imageRef.value,
  () => {
    console.log('mageRef.value:', imageRef.value);
    const rect = imageRef.value.getBoundingClientRect();


    imageWidth.value =  rect.width;
    imageHeight.value = rect.height;
    
    console.log(`Bildgröße: ${imageWidth.value}x${imageHeight.value}`);
  }
);


let debounceTimeout;
function debounceRotateRange() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    rotateByRange();
  }, 500); // Wartezeit in Millisekunden
}


// Drag-Event von Moveable
function onDrag(e) {
  x.value += e.delta[0];
  y.value += e.delta[1];

  // Begrenzung: nicht über Container hinausragen
  if (x.value < 0) x.value = 0;
  if (y.value < 0) y.value = 0;
  if (x.value > framingStore.containerSize - framingStore.camWidth)
    x.value = framingStore.containerSize - framingStore.camWidth;
  if (y.value > framingStore.containerSize - framingStore.camHeight)
    y.value = framingStore.containerSize - framingStore.camHeight;

  calculateRaDec();
}


function calculateRaDec() {
  // Center des Ziel-Rechtecks
  const targetCenterX = x.value + framingStore.camWidth / 2;
  const targetCenterY = y.value + framingStore.camHeight / 2;

  // Container-Mitte
  const center = framingStore.containerSize / 2;

  // Abweichung in Pixel
  const deltaX = targetCenterX - center;
  const deltaY = center - targetCenterY;

  // Offset DEC
  const offsetDec = deltaY * scaleDegPerPixel.value;

  // RA-Korrektur (cos(dec))
  let cosDec = Math.cos((baseDec * Math.PI) / 180);
  if (Math.abs(cosDec) < 1e-8) cosDec = 1e-8;
  const offsetRA = (deltaX * scaleDegPerPixel.value) / cosDec;

  // Aktuelle Koords
  const currentRA = baseRA - offsetRA;
  const currentDec = baseDec + offsetDec;

  // Als String speichern
  framingStore.RAangleString = degreesToHMS(currentRA);
  framingStore.DECangleString = degreesToDMS(currentDec);

  framingStore.RAangle = currentRA;
  framingStore.DECangle = currentDec;

  console.log(currentRA , currentDec);
}

</script>

<style scoped>
.target {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed red;
}
</style>




144