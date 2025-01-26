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

      <Moveable
        ref="moveableRef"
        :target="targetRef"
        :draggable="true"
        :rotatable="false"
        @drag="onDrag"
      />
    </div>
    <div>
      <p>RA: {{ framingStore.RAangleString }} DEC: {{ framingStore.DECangleString }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import Moveable from 'vue3-moveable';
import { useFramingStore } from '@/store/framingStore';
import apiService from '@/services/apiService';

const framingStore = useFramingStore();
const isLoading = ref(true);
const targetPic = ref(null);
const scaleDegPerPixel = ref(0.004); // Grad pro Pixel
const baseRA = framingStore.RAangle;
const baseDec = framingStore.DECangle;
const x = ref(0);
const y = ref(0);
const containerRef = ref(null);
const targetRef = ref(null);

// Grad pro Pixel berechnen
scaleDegPerPixel.value = framingStore.fov / framingStore.containerSize;

onMounted(async () => {
  // Maximale Containergröe ermitteln
  // Height-200 px um genug Platz nach unten zu haben
  const smallerDimension = Math.min(window.innerWidth, window.innerHeight - 200);
  const roundedDimension = Math.floor(smallerDimension / 100) * 100;
  framingStore.containerSize = roundedDimension;
  console.log('Container-Größe:', framingStore.containerSize);

  // Bild abrufen
  await getTargetPic();

  // Linke obere Ecke (x,y) so, dass das Element in der Container-Mitte startet
  x.value = framingStore.containerSize / 2 - framingStore.camWidth / 2;
  y.value = framingStore.containerSize / 2 - framingStore.camHeight / 2;
  isLoading.value = false;

  await nextTick();
    // Breite und Höhe des fov-Elements abrufen
    console.log('FOV Breite:');
    const fovElement = containerRef.value;
    console.log('FOV Breite:',fovElement);
  if (fovElement) {
    const width = fovElement.offsetWidth; // Breite in Pixel
    const height = fovElement.offsetHeight; // Höhe in Pixel

    console.log("FOV Breite:", width, "px");
    console.log("FOV Höhe:", height, "px");
  }
});

function calcCameraFov() {
  const sensorWidthPx = 6000;
  const sensorHeightPx = 4000;
  const pixelSizeM = 3.8e-6; // 3.8 µm
  const focalLengthM = 0.7; // 750 mm
  scaleDegPerPixel.value = framingStore.fov / framingStore.containerSize;
  console.log('scaleDegPerPixel', scaleDegPerPixel.value);

  // => Physische Sensorgröße
  const sensorWidthM = sensorWidthPx * pixelSizeM; // ~0.0114 m
  const sensorHeightM = sensorHeightPx * pixelSizeM; // ~0.0057 m

  // => Reale FOV in Grad
  const fovX = 2 * rad2deg(Math.atan(sensorWidthM / 2 / focalLengthM));
  const fovY = 2 * rad2deg(Math.atan(sensorHeightM / 2 / focalLengthM));
  console.log(`Reale Kamera-FOV: ~${fovX.toFixed(3)}° × ${fovY.toFixed(3)}°`);

  // => FOV in Pixel
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

  // Grenzen: Element soll nicht aus hinausragen
  if (x.value < 0) x.value = 0;
  if (y.value < 0) y.value = 0;
  if (x.value > framingStore.containerSize - framingStore.camWidth)
    x.value = framingStore.containerSize - framingStore.camWidth;
  if (y.value > framingStore.containerSize - framingStore.camHeight)
    y.value = framingStore.containerSize - framingStore.camHeight;

  // Nach dem Verschieben: RA/Dec berechnen
  calculateRaDec();
}

async function getTargetPic() {
  try {
    const ra = framingStore.RAangle;
    const dec = framingStore.DECangle;
    const width = framingStore.containerSize;
    const height = framingStore.containerSize;
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
  // 1) Pixel-Koordinaten des Zentrums des verschiebbaren Rechtecks
  const targetCenterX = x.value + framingStore.camWidth / 2;
  const targetCenterY = y.value + framingStore.camHeight / 2;

  // 2) Pixel-Koordinaten der Container-Mitte
  const center = framingStore.containerSize / 2;

  // 3) Differenzen in Pixel (deltaX > 0 = rechts)
  //    Achtung: wie du das Vorzeichen festlegst, ist Konvention.
  const deltaX = targetCenterX - center;
  const deltaY = center - targetCenterY;

  // 4) Deklination in Grad/Px (wie gehabt)
  const offsetDec = deltaY * scaleDegPerPixel.value;

  // 5) RA muss um cos(Dec) geteilt werden
  //    Grobe Näherung: nutze baseDec zur Korrektur
  let cosDec = Math.cos(baseDec * Math.PI / 180);
  // Sicherheitshalber: falls cosDec = 0 (Polnähe)
  if (Math.abs(cosDec) < 1e-8) {
    cosDec = 1e-8; 
  }
  const offsetRA = (deltaX * scaleDegPerPixel.value) / cosDec;

  // 6) Aktuelle Koordinaten
  const currentRA  = baseRA  - offsetRA;
  const currentDec = baseDec + offsetDec;

  // 7) In Strings umwandeln (HMS / DMS)
  framingStore.RAangleString  = degreesToHMS(currentRA);
  framingStore.DECangleString = degreesToDMS(currentDec);

  // 8) Speichern
  framingStore.RAangle  = currentRA;
  framingStore.DECangle = currentDec;
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
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
