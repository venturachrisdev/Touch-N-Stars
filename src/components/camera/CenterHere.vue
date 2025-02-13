<template>
  <div class="wrapper">
    <!-- Hauptbild: wird responsiv skaliert -->
    <img
      ref="imageRef"
      :src="cameraStore.imageData"
      alt="Captured Image"
      class="main-image"
      @load="onImageLoad"
    />

    <!-- Verschiebbare Box (Target) -->
    <div
      ref="targetRef"
      class="target-box"
      :style="{
        left: position.x + 'px',
        top: position.y + 'px',
        width: boxSize + 'px',
        height: boxSize + 'px',
      }"
    >
      <p class="box-text">Drag me</p>
    </div>

    <!-- Moveable-Komponente -->
    <Moveable
      ref="moveableRef"
      :target="targetRef"
      :draggable="true"
      :rotatable="false"
      :snappable="false"
      @drag="onDrag"
    />

    <!-- Anzeige der berechneten RA/Dec -->
    <div
      v-if="marker.ra !== null && marker.dec !== null"
      class="info-box"
    >
      <div>RA: {{ marker.ra.toFixed(3) }}°</div>
      <div>Dec: {{ marker.dec.toFixed(3) }}°</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Moveable from 'vue3-moveable';
import { useCameraStore } from '@/store/cameraStore';
import { apiStore } from '@/store/store';
import { degreesToHMS, degreesToDMS } from '@/utils/utils.js';

const cameraStore = useCameraStore();
const store = apiStore();

// Beispielwerte:
const baseRA =  ref(100.0);         // RA in Grad für Bildzentrum
const baseDec = ref(20.0);          // Dec in Grad für Bildzentrum
const cameraRotationDeg = ref(15.0); // Kamera-Rotation in Grad
const scaleDegPerPixel = ref(0.004); // Grad pro Pixel

// Refs für DOM-Elemente
const imageRef   = ref(null);
const targetRef  = ref(null);
const moveableRef = ref(null);

// Position & Größe der Target-Box
const position = ref({ x: 0, y: 0 });
const boxSize = 50; // px

// Letzte berechnete RA/Dec
const marker = ref({
  ra:  null,
  dec: null,
});

/**
 * onMounted: Wir legen ggf. ein Resize-Event an,
 * damit beim Fenster-Resize das Target neu zentriert oder neu berechnet werden kann.
 */
onMounted(() => {
  window.addEventListener('resize', onWindowResize);
  baseRA.value = cameraStore.plateSolveResult.Coordinates.RADegrees;
  baseDec.value = cameraStore.plateSolveResult.Coordinates.Dec;
  baseDec.cameraRotationDeg = cameraStore.plateSolveResult.PositionAngle;
  scaleDegPerPixel.value = cameraStore.plateSolveResult.Pixscale / 3600;

  console.log(baseRA.value, baseDec.value,  cameraRotationDeg.value,  scaleDegPerPixel.value);

});

/**
 * onBeforeUnmount: Eventlistener aufräumen
 */
onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
});

/**
 * Wenn das Bild fertig geladen ist (onLoad), zentrieren wir die Target-Box
 * in der Bildmitte. (onImageLoad)
 */
function onImageLoad() {
  centerTargetBox();
}

/**
 * Beim Fenster-Resize kannst du die Box neu zentrieren oder
 * zumindest die Position updaten, damit sie in der richtigen Relation bleibt.
 */
function onWindowResize() {
  centerTargetBox();
}

/**
 * centerTargetBox():
 * Legt die Box in die (gerenderte) Bildmitte.
 */
function centerTargetBox() {
  const rect = imageRef.value?.getBoundingClientRect();
  if (!rect) return;

  position.value.x = rect.width / 2 - boxSize / 2;
  position.value.y = rect.height / 2 - boxSize / 2;

  calculateRaDec();
}

/**
 * Moveable-Event: "drag"
 */
function onDrag(e) {
  // e.delta → Verschiebung seit dem letzten Drag in px
  position.value.x += e.delta[0];
  position.value.y += e.delta[1];

  // Box in Bildgrenzen halten (optional)
  keepTargetInBounds();

  // RA/Dec neu berechnen
  calculateRaDec();
}

/**
 * Box an die Bildgrenzen anpassen
 */
function keepTargetInBounds() {
  const rect = imageRef.value?.getBoundingClientRect();
  if (!rect) return;

  const w = rect.width;
  const h = rect.height;

  // Klemmen
  if (position.value.x < 0) position.value.x = 0;
  if (position.value.y < 0) position.value.y = 0;
  if (position.value.x > w - boxSize) position.value.x = w - boxSize;
  if (position.value.y > h - boxSize) position.value.y = h - boxSize;
}

/**
 * calculateRaDec():
 * Ermittelt RA/Dec basierend auf Box-Position + Rotation.
 */
function calculateRaDec() {
  const rect = imageRef.value?.getBoundingClientRect();
  if (!rect) return;

  const sensorWidth = store.cameraInfo.XSize;
  const displayedWidth = rect.width;
  const ratioX = sensorWidth / displayedWidth;
  const sensorHeight = store.cameraInfo.YSize;
  const displayedHeight = rect.height;
  const ratioY = sensorHeight / displayedHeight;

  // 1) Bildmitte
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // 2) Mittelpunkt der Box
  const boxCenterX = position.value.x + boxSize / 2;
  const boxCenterY = position.value.y + boxSize / 2;

  // 3) dx, dy relativ zur Bildmitte
  //    dx nach rechts positiv, dy nach oben positiv
  let dx = boxCenterX - centerX;
  let dy = centerY - boxCenterY; // invertiert


  const scaleDegPerPixelX = scaleDegPerPixel.value * ratioX;
  const scaleDegPerPixelY = scaleDegPerPixel.value * ratioY;

  
    // Offset DEC
    const offsetDec = dy * scaleDegPerPixelX;

    // RA-Korrektur (cos(dec))
    let cosDec = Math.cos((baseDec.value * Math.PI) / 180);
    if (Math.abs(cosDec) < 1e-8) cosDec = 1e-8;
    const offsetRA = (dx * scaleDegPerPixelY) / cosDec;


  // 6) Final: RA, Dec
  const ra  = baseRA.value - offsetRA;  // Vorzeichen ggf. anpassen
  const dec = baseDec.value + offsetDec;

  marker.value.ra  = ra;
  marker.value.dec = dec;

  console.log('RA', degreesToHMS(ra));
  console.log('dec',degreesToDMS(dec));
}
</script>

<!--
  Beispiel-CSS:
  - .wrapper umschließt alles
  - .main-image responsiv (width: 100%; height: auto)
  - .target-box absolute, rote Umrandung etc.
  - .info-box absolutes Overlay oben links
-->
<style scoped>
.wrapper {
  /* Begrenze die Breite auf 80% der Viewport-Breite, 
     max. 800px, zentriere optional via margin */
  max-width: 800px;
  width: 80vw;
  margin: 0 auto;
  position: relative;
}

.main-image {
  width: 100%;
  height: auto;
  display: block;
}

.target-box {
  position: absolute;
  border: 2px dashed red;
  background-color: rgba(255, 0, 0, 0.05);
  cursor: move;
  user-select: none;
}

.box-text {
  margin: auto;
  color: red;
  font-size: 10px;
  text-align: center;
}

.info-box {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 8px;
  color: #fff;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
