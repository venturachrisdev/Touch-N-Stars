<template>
  <div class="text-center">
    <!-- Titel -->
    <div class="text-left mb-2">
      <h1 class="text-xl text-center font-bold">Fotoaufnahme</h1>
    </div>

    <!-- Kamera-Verbindungsstatus -->
    <div v-if="!store.cameraInfo.Connected" class="text-red-500">
      <p>Bitte Kamera verbinden</p>
    </div>

    <!-- Infos & Einstellungen (nur anzeigen, wenn showInfo=true) -->
    <div v-show="cameraStore.showInfo">
      <div class="flex items-center space-x-3 mb-2">
        <div class="w-3 h-[1px] bg-gray-700"></div>
        <p class="text-sm italic text-gray-400">Info</p>
        <div class="flex-grow h-[1px] bg-gray-700"></div>
      </div>

      <infoCamera
        v-model="store.cameraInfo.Connected"
        :show-all-info="true"
        class="grid grid-cols-2 landscape:grid-cols-3 mb-4"
      />

      <div class="flex items-center space-x-3 mb-2">
        <div class="w-3 h-[1px] bg-gray-700"></div>
        <p class="text-sm italic text-gray-400">Einstellungen</p>
        <div class="flex-grow h-[1px] bg-gray-700"></div>
      </div>
      <settingsCameraCooler class="grid grid-cols-1  mb-3 text-left" />
      <settingsCamera class="grid grid-cols-2 landscape:grid-cols-3 mb-3 text-left" />
      <changeFilter v-if="store.filterInfo.Connected" class="grid rid-flow-row-dense grid-cols-2 landscape:grid-cols-3 mb-3 text-left" />
    </div>

    <!-- Hauptbereich, wenn Kamera verbunden -->
    <div v-show="store.cameraInfo.Connected">
      <!-- Button, um Infos/Einstellungen ein- oder auszublenden -->
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-3 h-[1px] bg-gray-700"></div>
        <button
          @click="cameraStore.showInfo = !cameraStore.showInfo"
          class="w-7 h-7 bg-gray-700 active:bg-cyan-700 hover:bg-cyan-600 rounded-md border border-cyan-500/20 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-white transition-transform duration-300"
            :class="{ '-rotate-90': cameraStore.showInfo }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <p class="text-sm italic">Infos & Einstellungen</p>
        <div class="flex-grow h-[1px] bg-gray-700"></div>
      </div>

      <!-- Flex-Container für Dauerschleife, Aufnahme-Button und Bild-Anzeige -->
      <div class="flex flex-col landscape:flex-row gap-2">
        <!-- Linker Bereich -->
        <div
          class="flex flex-row justify-center landscape:justify-normal
                 landscape:flex-col landscape:space-y-2 space-y-0 gap-2
                 landscape:gap-0 landscape:w-3/7"
        >
          <div class="flex flex-col min-w-40">
            <!-- Dauerschleife -->
            <div class="flex items-center mb-2">
              <input
                v-model="cameraStore.isLooping"
                id="checkDauerschleife"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded
                       focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-gray-800
                       focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                for="checkDauerschleife"
                class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Dauerschleife
              </label>
            </div>

            <!-- Aufnahme-Button -->
            <button
              class="flex h-10 min-w-48 rounded-md text-white font-medium transition-colors
                     bg-cyan-700 items-center justify-center disabled:opacity-50"
              @click="cameraStore.capturePhoto(apiService, cameraStore.exposureTime, cameraStore.gain)"
              :disabled="cameraStore.loading"
            >
              <template v-if="cameraStore.loading">
                <!-- Wenn Belichtung läuft -->
                <div v-if="cameraStore.isExposure" class="flex items-center">
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
                        strokeDasharray: cameraStore.progress + ', 100',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                      }"
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span class="ml-2 text-white text-sm font-medium">
                    Aufnahme läuft {{ cameraStore.remainingExposureTime }}s
                  </span>
                </div>
                <!-- Wenn Bild gerade geladen wird -->
                <div v-else-if="cameraStore.isLoadingImage" class="flex items-center">
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
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
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

            <!-- Abbrechen-Button -->
            <div class="pt-2">
              <button
                v-if="cameraStore.isExposure"
                @click="cameraStore.abortExposure(apiService)"
                class="flex h-10 w-full rounded-md text-white font-medium bg-red-800 items-center justify-center"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>

        <!-- Rechter Bereich: Bildanzeige -->
        <div class="flex w-full landscape:w-4/7">
          <div
            ref="imageContainer"
            class="image-container overflow-hidden min-h-[65vh] min-w-full
                   touch-auto bg-gray-800 shadow-lg shadow-cyan-700/40
                   rounded-xl border border-cyan-700"
          >
            <img
              v-if="cameraStore.imageData"
              ref="image"
              :src="cameraStore.imageData"
              alt="Aufgenommenes Bild"
              class="block"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import Panzoom from 'panzoom'

// Dein globaler API-Store
import { apiStore } from '@/store/store'

// Dein Pinia-Store
import { useCameraStore } from '@/store/cameraStore'

// Services & Components
import apiService from '@/services/apiService'
import infoCamera from '@/components/infoCamera.vue'
import settingsCamera from '@/components/settingsCamera.vue'
import settingsCameraCooler from '@/components/settingsCameraCooler.vue'
import changeFilter from '@/components/changeFilter.vue'

// Initialisiere Stores
const store = apiStore()
const cameraStore = useCameraStore()

// Refs für Panzoom
const imageContainer = ref(null)
const image = ref(null)
let panzoomInstance = null

// Sobald sich das Bild ändert, initialisieren wir Panzoom
watch(
  () => cameraStore.imageData,
  async (newValue) => {
    if (!newValue) return
    await nextTick()
    if (!image.value) return

    // Panzoom-Instanz immer erst aufräumen
    if (panzoomInstance) {
      panzoomInstance.dispose()
    }

    // Und dann neu initialisieren
    panzoomInstance = Panzoom(image.value, {
      maxZoom: 30,
      minZoom: 0.9,
      bounds: true,
      boundsPadding: 0.1,
      contain: 'inside',
      origin: 'center',
    })
  },
  {
    immediate: true
  }
)
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
