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
      <img class="absolute inset-0" :src="targetPic" />

      <!-- Verschiebbares / drehbares Ziel-Element -->
      <div
        class="target"
        ref="targetRef"
        :style="{
          width: `${framingStore.camWidth}px`,
          height: `${framingStore.camHeight}px`,
          transform: `translate(${x}px, ${y}px) rotate(${rotationAngle}deg)`,
          zIndex: 2,
        }"
      ></div>

      <!-- Moveable: rotierbar ist hier fest auf "true" gesetzt -->
      <Moveable
        ref="moveableRef"
        :target="targetRef"
        :draggable="true"
        :rotatable="false"
        @drag="onDrag"
        @rotate="onRotate"
      />
    </div>

    <!-- Beispiel-Bedienelemente für den Winkel -->
    <div class="mt-4 flex gap-2">
      <!-- Button: Winkel auf +15° erhöhen -->
      <button @click="rotateBy15">+15°</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import Moveable from 'vue3-moveable';
import { useFramingStore } from '@/store/framingStore';
import apiService from '@/services/apiService';

// Stores / refs
const framingStore = useFramingStore();
const isLoading = ref(true);
const targetPic = ref(null);

// Für die Berechnungen
const scaleDegPerPixel = ref(0.004); // Grad pro Pixel
const baseRA = framingStore.RAangle;
const baseDec = framingStore.DECangle;

// Positions-Koordinaten
const x = ref(0);
const y = ref(0);

// Hier die "rotationAngle"-Variable, die den Winkel in Grad speichert
const rotationAngle = ref(0);

// Referenzen
const containerRef = ref(null);
const targetRef = ref(null);
const moveableRef = ref(null);

// Beim Mounten Daten laden
onMounted(async () => {
  await fetchFramingInfo();

  // Container-Größe berechnen
  const smallerDimension = Math.min(window.innerWidth, window.innerHeight - 200);
  const roundedDimension = Math.floor(smallerDimension / 100) * 100;
  framingStore.containerSize = roundedDimension;

  // Bild abrufen
  await getTargetPic();

  // Element in die Mitte setzen
  x.value = framingStore.containerSize / 2 - framingStore.camWidth / 2;
  y.value = framingStore.containerSize / 2 - framingStore.camHeight / 2;

  await nextTick();
  isLoading.value = false;
});

// Methode, um Kamera-FOV und das verschiebbare Rechteck zu berechnen
function calcCameraFov() {
  const sensorWidthPx = framingStore.framingInfo.CameraWidth;
  const sensorHeightPx = framingStore.framingInfo.CameraHeight;
  const pixelSizeM = framingStore.framingInfo.CameraPixelSize / 1_000_000;
  const focalLengthM = framingStore.framingInfo.FocalLength / 1000;

  scaleDegPerPixel.value = framingStore.fov / framingStore.containerSize;

  // Sensor-Größe in Meter
  const sensorWidthM = sensorWidthPx * pixelSizeM;
  const sensorHeightM = sensorHeightPx * pixelSizeM;

  // Reales FOV in Grad
  const fovX = 2 * rad2deg(Math.atan(sensorWidthM / 2 / focalLengthM));
  const fovY = 2 * rad2deg(Math.atan(sensorHeightM / 2 / focalLengthM));

  // FOV in Pixel
  const fovPxX = fovX / scaleDegPerPixel.value;
  const fovPxY = fovY / scaleDegPerPixel.value;

  framingStore.camWidth = fovPxX;
  framingStore.camHeight = fovPxY;
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

/** Button-Klick: rotiert um +15° */
function rotateBy15() {
  // Sage Moveable: "rotatable" -> drehe um deltaRotate: 15 Grad
  // Dritter Parameter 'true' = "ist ein 'isInstant' Request".
  // Moveable kümmert sich um den transform und seine Bounding Box.
  moveableRef.value.request('rotatable', { deltaRotate: 15 }, true);
}

function onRotate(e) {
  e.target.style.transform = e.transform; // Das ist der von Moveable fertige transform-String
  rotationAngle.value = e.beforeRotate; // Wenn du den Winkel trotzdem noch speichern willst
}

async function getTargetPic() {
  try {
    const ra = framingStore.RAangle;
    const dec = framingStore.DECangle;
    const width = framingStore.containerSize;
    const height = framingStore.containerSize;
    const fov = framingStore.fov;
    const useCache = framingStore.useNinaCache;

    calcCameraFov();

    if (targetPic.value) {
      URL.revokeObjectURL(targetPic.value);
    }
    targetPic.value = await apiService.searchTargetPic(width, height, fov, ra, dec, useCache);
  } catch (error) {
    console.error('Fehler beim Abrufen des Bildes:', error);
  }
}

async function fetchFramingInfo() {
  try {
    const data = await apiService.framingAction('info');
    framingStore.framingInfo = data.Response;
  } catch (error) {
    console.error('Fehler beim Abrufen des FramingInfo:', error);
  }
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
}

function degreesToHMS(deg) {
  const totalHours = deg / 15;
  const h = Math.floor(totalHours);
  const remainingHours = totalHours - h;
  const totalMinutes = remainingHours * 60;
  const m = Math.floor(totalMinutes);
  const remainingMinutes = totalMinutes - m;
  const s = remainingMinutes * 60;

  const hStr = String(h);
  const mStr = String(m).padStart(2, '0');
  const sStr = s.toFixed(1).padStart(4, '0');

  return `${hStr}:${mStr}:${sStr}`;
}
function degreesToDMS(deg) {
  const sign = deg < 0 ? '-' : '+';
  deg = Math.abs(deg);
  const d = Math.floor(deg);
  const remainingDeg = deg - d;
  const totalMinutes = remainingDeg * 60;
  const m = Math.floor(totalMinutes);
  const remainingMinutes = totalMinutes - m;
  const s = remainingMinutes * 60;

  const dStr = String(d).padStart(2, '0');
  const mStr = String(m).padStart(2, '0');
  const sStr = s.toFixed(1).padStart(4, '0');

  return `${sign}${dStr}:${mStr}:${sStr}`;
}
function rad2deg(rad) {
  return rad * (180 / Math.PI);
}
</script>

<style scoped>
.target {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Nur zum Testen, damit man den Rahmen sieht */
  border: 2px dashed red;
}
</style>
