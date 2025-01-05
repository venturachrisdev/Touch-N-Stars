<template>
  <div class="text-center">
    <!-- Titel -->
    <div class="text-left mb-2">
      <h1 class="text-xl text-center font-bold">{{ $t('components.camera.title') }}</h1>
    </div>

    <!-- Camera Connection Status -->
    <div class="w-full flex justify-center">
      <div class="max-w-xl">
        <div v-if="!store.cameraInfo.Connected" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p class="text-red-400 font-medium">{{ $t('components.camera.connect') }}</p>
        </div>

      <!-- Info & Settings Section -->
      <div v-show="cameraStore.showInfo" class="space-y-6">
        <!-- Section Header -->
        <div class="relative flex items-center py-4">
          <div class="flex-grow border-t border-gray-700"></div>
          <span class="flex-shrink mx-4 text-sm font-semibold text-cyan-400">{{ $t('components.camera.info') }}</span>
          <div class="flex-grow border-t border-gray-700"></div>
        </div>

        <infoCamera v-model="store.cameraInfo.Connected" :show-all-info="true"
          class="grid grid-cols-2 landscape:grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50" />

        <!-- Settings Section -->
        <div class="relative flex items-center py-4">
          <div class="flex-grow border-t border-gray-700"></div>
          <span class="flex-shrink mx-4 text-sm font-semibold text-cyan-400">{{ $t('components.camera.settings') }}</span>
          <div class="flex-grow border-t border-gray-700"></div>
        </div>
        
        <div class="space-y-6">
          <settingsCameraCooler class="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50" />
          
          <div class="grid grid-flow-row-dense grid-cols-1 landscape:grid-cols-2 gap-6">
            <changeFilter v-if="store.filterInfo.Connected" class="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50" />
            <controlRotator v-if="store.rotatorInfo.Connected" class="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50" />
          </div>
          
          <settingsCamera class="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50" />
        </div>

      </div>
    </div>
  </div>

    <!-- Hauptbereich, wenn Kamera verbunden -->
    <div v-show="store.cameraInfo.Connected">
      <!-- Toggle Button for Info/Settings -->
      <div class="flex items-center space-x-3 mb-4">
          <div class="w-3 h-[1px] bg-gray-700"></div> <!-- kurze Linie -->
          <button @click="cameraStore.showInfo = !cameraStore.showInfo"
            class="w-7 h-7 bg-gray-700 active:bg-cyan-700 hover:bg-cyan-600 rounded-md border border-cyan-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white transition-transform duration-300"
              :class="{ '-rotate-90': cameraStore.showInfo }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p class=" text-sm italic"> {{ $t('components.camera.info_settings') }}</p>
          <div class="flex-grow h-[1px] bg-gray-700"></div> <!-- lange Linie -->
        </div>

      <!-- Capture Controls and Image Display -->
      <div class="flex flex-col landscape:flex-row gap-6">
        <!-- Left Panel - Controls -->
        <div class="flex flex-col landscape:w-1/6 space-y-4">
          <!-- Loop Checkbox -->
          <div class="flex items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <input v-model="cameraStore.isLooping" id="checkDauerschleife" type="checkbox" 
              class="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2" />
            <label for="checkDauerschleife" class="ms-3 text-sm font-medium text-gray-300">
              {{ $t('components.camera.loop') }}
            </label>
          </div>

          <!-- Capture Button -->
          <button class="btn-primary bg-gradient-to-br from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600
                    transition-all duration-200 shadow-lg hover:shadow-cyan-500/20"
            @click="cameraStore.capturePhoto(apiService, cameraStore.exposureTime, cameraStore.gain)"
            :disabled="cameraStore.loading">
              <template v-if="cameraStore.loading">
                <!-- Wenn Belichtung läuft -->
                <div v-if="cameraStore.isExposure" class="flex items-center">
                  <svg class="w-6 h-6" viewBox="0 0 36 36">
                    <path class="text-white text-opacity-30 fill-none stroke-current stroke-[2.8]" d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="fill-none stroke-current stroke-[2.8]" :style="{
                      strokeDasharray: cameraStore.progress + ', 100',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                    }" d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                <span class="ml-2 text-white text-sm font-medium">
                    {{ $t('components.camera.capture_running') }} {{ cameraStore.remainingExposureTime }}s
                  </span>
                </div>
                <!-- Wenn Bild gerade geladen wird -->
                <div v-else-if="cameraStore.isLoadingImage" class="flex items-center">
                  <svg class="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span class="ml-2 text-white text-sm font-medium">
                    {{ $t('components.camera.image_loading') }}
                  </span>
                </div>
              </template>
              <template v-else>
                {{ $t('components.camera.start_capture') }}
              </template>
            </button>

          <!-- Cancel Button -->
          <div class="pt-2">
            <button v-if="cameraStore.isExposure" @click="cameraStore.abortExposure(apiService)"
              class="btn-primary bg-gradient-to-br from-red-600 to-red-500 hover:from-red-700 hover:to-red-600
                    transition-all duration-200 shadow-lg hover:shadow-red-500/20">
              {{ $t('components.camera.cancel') }}
            </button>
          </div>
        </div>

        <!-- Right Panel - Image Display -->
        <div class="flex w-full landscape:w-5/6">
          <div ref="imageContainer" class="image-container overflow-hidden min-h-[65vh] w-full
                   touch-auto bg-gray-800 shadow-lg shadow-cyan-700/40
                   rounded-xl border border-cyan-700/50">
            <img v-if="cameraStore.imageData" ref="image" :src="cameraStore.imageData" alt="Captured Image"
              class="block" />
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
import { apiStore } from "@/store/store"

// Dein Pinia-Store
import { useCameraStore } from "@/store/cameraStore"

// Services & Components
import apiService from "@/services/apiService"
import infoCamera from "@/components/camera/infoCamera.vue"
import settingsCamera from "@/components/camera/settingsCamera.vue"
import settingsCameraCooler from "@/components/camera/settingsCameraCooler.vue"
import changeFilter from "@/components/filterwheel/changeFilter.vue"
import controlRotator from "@/components/rotator/controlRotator.vue"

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
