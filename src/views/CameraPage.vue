<template>
  <div class="text-center">
    <div v-show="store.cameraInfo.Connected" class="text-left mb-2">
      <h1 class="text-xl text-center font-bold">Fotoaufnahme</h1>
    </div>

    <infoCamera
      v-model="store.cameraInfo.Connected"
      :show-all-info="showInfo"
      class="grid grid-cols-2 landscape:grid-cols-3 mb-4"
    />

    <div v-show="store.cameraInfo.Connected">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-3 h-[1px] bg-gray-700"></div>
        <button
          @click="showInfo = !showInfo"
          class="w-7 h-7 bg-gray-700 active:bg-cyan-700 hover:bg-cyan-600 rounded-md border border-cyan-500/20 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-white transition-transform duration-300"
            :class="{ 'rotate-180': showInfo }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div class="flex-grow h-[1px] bg-gray-700"></div>
      </div>

      <div class="flex flex-col landscape:flex-row gap-2">
        <div class="flex flex-row justify-center landscape:justify-normal landscape:flex-col landscape:space-y-2 space-y-0 gap-2 landscape:gap-0 landscape:w-3/7">
          <div class="flex flex-col gap-2 text-left max-w-40">
            <label for="exposure" class="text-sm">Belichtungszeit:</label>
            <input
              id="exposure"
              v-model.number="exposureTime"
              type="number"
              class="text-black px-4 h-10 max-w-15 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
              placeholder="1"
            />
          </div>

          <div class="flex flex-col min-w-40">
            <div class="flex items-center mb-2">
              <input
                v-model="isLooping"
                id="checkDauerschleife"
                type="checkbox"
                value=""
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                for="checkDauerschleife"
                class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Dauerschleife
              </label>
            </div>
            <button
              class="flex h-10 min-w-48 rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
              @click="capturePhoto"
              :disabled="loading"
            >
              <template v-if="loading">
                <div v-if="isExposure" class="flex items-center">
                  <svg class="w-6 h-6" viewBox="0 0 36 36">
                    <path
                      class="text-white text-opacity-30 fill-none stroke-current stroke-[2.8]"
                      d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      class="fill-none stroke-current stroke-[2.8]"
                      :style="{
                        strokeDasharray: progress + ', 100',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                      }"
                      d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span class="ml-2 text-white text-sm font-medium">
                    Aufnahme läuft {{ remainingExposureTime }}s
                  </span>
                </div>
                <div v-else-if="isLoadingImage" class="flex items-center">
                  <svg
                    class="w-6 h-6 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span class="ml-2 text-white text-sm font-medium">
                    Bild lädt...
                  </span>
                </div>
              </template>
              <template v-else>
                Aufnahme starten
              </template>
            </button>
            <div class="pt-2">
              <button
                class="flex h-10 w-full rounded-md text-white font-medium bg-red-800 items-center justify-center"
                v-if="isExposure"
                @click="abortExposure"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>

        <div class="flex w-full landscape:w-4/7">
          <div
            ref="imageContainer"
            class="image-container overflow-hidden min-h-[65vh] min-w-full touch-auto bg-gray-800 shadow-lg shadow-cyan-700/40 rounded-xl border border-cyan-700"
          >
            <img
              v-if="imageData"
              ref="image"
              :src="imageData"
              alt="Aufgenommenes Bild"
              class="block"
              style="touch-action: none; user-select: none;"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import apiService from "@/services/apiService";
import Panzoom from 'panzoom';
import infoCamera from '../components/infoCamera.vue';
import { apiStore } from '@/store/store';

const store = apiStore();
const exposureTime = ref(2);
const remainingExposureTime = ref(0);
const progress = ref(0);
const imageData = ref(null);
const loading = ref(false);
const isExposure = ref(false);
const isLoadingImage = ref(false);
const isLooping = ref(false);
const isAbort = ref(false);
const showInfo = ref(false);

let panzoomInstance = null;
let exposureCountdownTimer = null;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startExposureCountdown() {
  const totalTime = exposureTime.value;

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      // Abbruchbedingung prüfen
      if (!isExposure.value) {
        clearInterval(interval);
        reject(new Error("Belichtung wurde abgebrochen."));
        return;
      }

      remainingExposureTime.value--;
      progress.value =
        ((totalTime - remainingExposureTime.value) / totalTime) * 100;

      if (remainingExposureTime.value <= 0) {
        clearInterval(interval);
        progress.value = 100;
        resolve();
      }
    }, 1000);

    exposureCountdownTimer = interval;
  });
}

async function capturePhoto() {
  if (exposureTime.value <= 0) {
    alert("Bitte geben Sie eine gültige Belichtungszeit ein.");
    return;
  }

  loading.value = true;
  remainingExposureTime.value = exposureTime.value;
  progress.value = 0;
  isExposure.value = true;
  isLoadingImage.value = false;
  isAbort.value = false;

  try {
    const capturePromise = apiService.startCapture(exposureTime.value);

    await startExposureCountdown();
    await capturePromise;

    isExposure.value = false; 
    isLoadingImage.value = true; 

    let attempts = 0;
    const maxAttempts = 15;
    let image = null;

    while (!image && attempts < maxAttempts && !isAbort.value) {
      try {
        const result = await apiService.getCaptureResult();
        image = result?.Response?.Image;

        if (image) {
          imageData.value = `data:image/jpeg;base64,${image}`;
          break;
        }
      } catch (error) {
        console.error("Fehler beim Abrufen des Bildes:", error.message);
      }

      attempts++;
      await wait(1000);
    }

    if (isAbort.value) {
      console.log("Bildabruf wurde abgebrochen.");
      return;
    }

    if (!image) {
      console.error("Kein Bild verfügbar nach mehreren Versuchen.");
      alert("Bild wurde nicht rechtzeitig bereitgestellt.");
    }
  } catch (error) {
    console.error("Fehler bei der Aufnahme:", error.message);
    alert("Fehler bei der Aufnahme. Siehe Konsole.");
  } finally {
    loading.value = false;
    isLoadingImage.value = false;

    if (isLooping.value) {
      capturePhoto();
    }
  }
}

async function abortExposure() {
  try {
    console.log("Abbruch der Belichtung gestartet...");
    await apiService.cameraAction("abort-exposure");

    isAbort.value = true;
    isExposure.value = false;
    isLoadingImage.value = false;
    isLooping.value = false;
    remainingExposureTime.value = 0;
    progress.value = 0;

    clearInterval(exposureCountdownTimer);
    console.log("Belichtung erfolgreich abgebrochen.");
  } catch (error) {
    console.error("Fehler beim Abbrechen der Belichtung:", error);
    alert("Abbrechen fehlgeschlagen: " + (error.message || "Unbekannter Fehler"));
  } finally {
    loading.value = false;
  }
}

watch(imageData, async (newValue) => {
  if (newValue) {
    await nextTick();
    const image = document.querySelector('[ref="image"]');

    if (image) {
      if (panzoomInstance) {
        panzoomInstance.dispose();
      }
      panzoomInstance = Panzoom(image, {
        maxZoom: 30,
        minZoom: 0.9,
        bounds: true,
        boundsPadding: 0.1,
        contain: 'inside',
        origin: 'center',
      });
    }
  }
});

</script>

<style scoped>
.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  touch-action: none;
  transform-origin: center center;
}
</style>
