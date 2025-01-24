<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
    <div
      class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
    ></div>
  </div>
  <div v-else>
    <div
      class="border relative overflow-hidden"
      :style="{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        position: 'relative',
      }"
      ref="containerRef"
    >
      <!-- TargetPic als Hintergrund -->
      <img
        class="absolute inset-0"
        :src="targetPic"
        :style="{
          zIndex: 1,
        }"
      />

      <!-- Verschiebbares Ziel-Element -->
      <div
        class="target"
        ref="targetRef"
        :style="{
          width: `${framingStore.camWidth}px`,
          height: `${framingStore.camHeight}px`,
          transform: `translate(${x}px, ${y}px)`,
          zIndex: 2,
        }"
      ></div>

      <!-- Moveable-Komponente -->
      <Moveable
        ref="moveableRef"
        :target="targetRef"
        :draggable="true"
        :rotatable="false"
        @drag="onDrag"
      />
    </div>
    <div>
      <p>RA: {{ currentRAHMS }} DEC: {{ currentDecDMS }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import Moveable from 'vue3-moveable';
import { useFramingStore } from '@/store/framingStore';
import apiService from '@/services/apiService';

const framingStore = useFramingStore();

framingStore.RAangle = 10.683333333333334;
framingStore.DECangle = 41.26861111111111;
framingStore.width = 500;
framingStore.height = 500;

const isLoading = ref(true);
const currentRAHMS = ref('');
const currentDecDMS = ref('');
const targetPic = ref(null);
const scaleDegPerPixel = ref(0.004); // Grad pro Pixel

const containerSize = framingStore.width; // 500 px Breite und Höhe

// -> Daraus folgt: Grad pro Pixel
//    2° / 500 px = 0.004°/px
scaleDegPerPixel.value = framingStore.fov / framingStore.width;

// Basis-RA/Dec in der Mitte des Containers
const baseRA = framingStore.RAangle;
const baseDec = framingStore.DECangle;

// Linke obere Ecke (x,y) so, dass das Element in der Container-Mitte startet
console.log('camWidth', framingStore.camWidth);
console.log('containerSize', containerSize);

const x = ref(containerSize / 2 - framingStore.camWidth / 2);
const y = ref(containerSize / 2 - framingStore.camHeight / 2);

const containerRef = ref(null);
const targetRef = ref(null);
onBeforeMount(async () => {
  await getTargetPic();
  x.value = containerSize / 2 - framingStore.camWidth / 2;
  y.value = containerSize / 2 - framingStore.camHeight / 2;
  console.log('x', x);
  isLoading.value = false;
});

function calcCameraFov() {
  const sensorWidthPx = 6000;
  const sensorHeightPx = 4000;
  const pixelSizeM = 3.8e-6; // 3.8 µm
  const focalLengthM = 0.7; // 750 mm
  scaleDegPerPixel.value = framingStore.fov / framingStore.width;

  // => Physische Sensorgröße
  const sensorWidthM = sensorWidthPx * pixelSizeM; // ~0.0114 m
  const sensorHeightM = sensorHeightPx * pixelSizeM; // ~0.0057 m

  // => Reale FOV in Grad
  const fovX = 2 * rad2deg(Math.atan(sensorWidthM / 2 / focalLengthM));
  // ~ 0.87°
  const fovY = 2 * rad2deg(Math.atan(sensorHeightM / 2 / focalLengthM));
  // ~ 0.44°
  console.log(`Reale Kamera-FOV: ~${fovX.toFixed(3)}° × ${fovY.toFixed(3)}°`);

  const fovPxX = fovX / scaleDegPerPixel.value;
  const fovPxY = fovY / scaleDegPerPixel.value;
  console.log('FOV in Pixel:', fovPxX.toFixed(2), '×', fovPxY.toFixed(2));

  framingStore.camWidth = fovPxX; // Breite des verschiebbaren Elements
  framingStore.camHeight = fovPxY; // Höhe des verschiebbaren Elements
}

function onDrag(e) {
  // Position des Elements aktualisieren
  x.value += e.delta[0];
  y.value += e.delta[1];

  // Grenzen: Element soll nicht aus 500×500 px hinausragen
  if (x.value < 0) x.value = 0;
  if (y.value < 0) y.value = 0;
  if (x.value > containerSize - framingStore.camWidth)
    x.value = containerSize - framingStore.camWidth;
  if (y.value > containerSize - framingStore.camHeight)
    y.value = containerSize - framingStore.camHeight;

  // Nach dem Verschieben: RA/Dec berechnen
  calculateRaDec();
}

async function getTargetPic() {
  try {
    const ra = framingStore.RAangle;
    const dec = framingStore.DECangle;
    const width = framingStore.width;
    const height = framingStore.height;
    const fov = framingStore.fov;

    const useCache = framingStore.useNinaCache;
    console.log('Bild wird abgerufen', 'RA: ', ra, 'DEC: ', dec, useCache);
    calcCameraFov();
    if (targetPic.value) {
      URL.revokeObjectURL(targetPic.value);
    }
    targetPic.value = await apiService.searchTargetPic(width, height, fov, ra, dec, useCache);
    console.log('Load TargestPic');
  } catch (error) {
    console.error('Fehler beim Abrufen des Bildes:', error);
  }
}

function calculateRaDec() {
  // Mitte des Targets
  const targetCenterX = x.value + framingStore.camWidth / 2;
  const targetCenterY = y.value + framingStore.camHeight / 2;

  // Container-Mitte
  const center = containerSize / 2;

  // Pixel-Differenz:
  // - deltaX > 0, wenn Target rechts vom Zentrum
  // - deltaY > 0, wenn Target unterhalb vom Zentrum
  //   Für Dec in Astronomie steigt Dec meist nach oben,
  //   daher (center - targetCenterY).
  const deltaX = targetCenterX - center;
  const deltaY = center - targetCenterY;

  // Umrechnung in Grad
  // RA steigt nach rechts, Dec steigt nach oben
  const offsetRA = deltaX * scaleDegPerPixel.value;
  const offsetDec = deltaY * scaleDegPerPixel.value;

  const currentRA = baseRA - offsetRA;
  const currentDec = baseDec + offsetDec;

  currentRAHMS.value = degreesToHMS(currentRA);
  currentDecDMS.value = degreesToDMS(currentDec);

  //console.log(`RA=${currentRA.toFixed(3)}°, Dec=${currentDec.toFixed(3)}°`);
  console.log('RA', degreesToHMS(currentRA), 'DEC', degreesToDMS(currentDec));
}

function degreesToHMS(deg) {
  // Schritt 1: Grad in Stunden umrechnen
  const totalHours = deg / 15;

  // Ganze Stunden ermitteln
  const h = Math.floor(totalHours);

  // Schritt 2: Minuten
  const remainingHours = totalHours - h;
  const totalMinutes = remainingHours * 60;
  const m = Math.floor(totalMinutes);

  // Schritt 3: Sekunden
  const remainingMinutes = totalMinutes - m;
  const s = remainingMinutes * 60;

  // Formatierung (z. B. auf eine Nachkommastelle)
  const hStr = String(h).padStart(1, '0'); // Stunden dürfen ruhig einstellig bleiben
  const mStr = String(m).padStart(2, '0'); // Minuten zweistellig
  const sStr = s.toFixed(1).padStart(4, '0'); // Sekunden mit einer Nachkommastelle

  return `${hStr}:${mStr}:${sStr}`;
}
function degreesToDMS(deg) {
  //console.log('degreesToDMS ', deg);
  // 1) Vorzeichen merken und Absolutwert nehmen
  const sign = deg < 0 ? '-' : '+';
  deg = Math.abs(deg);

  // 2) Ganze Grad
  const d = Math.floor(deg);

  // 3) Minuten
  const remainingDeg = deg - d;
  const totalMinutes = remainingDeg * 60;
  const m = Math.floor(totalMinutes);

  // 4) Sekunden
  const remainingMinutes = totalMinutes - m;
  const s = remainingMinutes * 60;

  // 5) Formatierung
  //    a) Grad: max. zwei Ziffern, da DEC zwischen -90° und +90° liegt
  //    b) Minuten/Sekunden: jeweils zweistellig
  const dStr = String(d).padStart(2, '0');
  const mStr = String(m).padStart(2, '0');
  // Auf eine Nachkommastelle runden, z. B. 0.1"
  const sStr = s.toFixed(1).padStart(4, '0');

  // 6) Zusammenbauen: ±DD:MM:SS.s
  return `${sign}${dStr}:${mStr}:${sStr}`;
}
function rad2deg(rad) {
  return rad * (180 / Math.PI);
}
</script>

<style>
.container {
  position: relative;
}
.target {
  position: absolute;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
