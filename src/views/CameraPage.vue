<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-7">Fotoaufnahme</h5>

    <!-- Eingabe für die Belichtungszeit -->
    <div class="flex flex-col md:flex-row gap-2 ">
      <div class="flex flex-row justify-center md:justify-normal md:flex-col md:space-y-2 space-y-0 gap-2 md:gap-0 md:w-3/7">
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
        <!-- Dauerschleife -->
        <div class="flex items-center mb-2">
          <input v-model="isLooping" id="checkDauerschleife" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          <label for="checkDauerschleife" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Dauerschleife</label>
        </div>
        <!-- Foto aufnehmen -->
        <button
          class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
          @click="capturePhoto"
          :disabled="loading"
        >
          <template v-if="loading">
            <div v-if="isExposure" class="flex items-center">
              <!-- Fortschrittskreis für Belichtungszeit -->
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
                    'stroke-dasharray': progress + ', 100',
                    'transform': 'rotate(-90deg)',
                    'transform-origin': 'center',
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
              <!-- Drehender Spinner für Bild lädt -->
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
            Foto aufnehmen
          </template>
        </button>
      </div>
      </div>

      <!-- Anzeige des Bildes mit Panzoom -->
      <div v-if="imageData" class="md:w-4/7">
        <!-- Bildcontainer -->
        <div
          ref="imageContainer"
          class="w-full h-auto touch-auto shadow-lg shadow-cyan-700/40 rounded-xl border border-cyan-700"
        >
          <img
            ref="image"
            :src="imageData"
            alt="Aufgenommenes Bild"
            class="max-h-[65vh] w-full"
            style="touch-action: none; user-select: none;"
          />
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import apiService from "@/services/apiService";
import panzoom from '@panzoom/panzoom'

export default {
  data() {
    return {
      exposureTime: 2, // Standard-Belichtungszeit
      remainingExposureTime: 0, // Für den Countdown der Belichtungszeit
      progress: 0, // Fortschritt für den Spinner
      imageData: null, // Base64-Daten des Bildes
      loading: false, // Ladezustand
      isExposure: false, // Gibt an, ob die Belichtungszeit läuft
      isLoadingImage: false, // Gibt an, ob das Bild geladen wird
      isLooping: false,
      panzoomInstance: null, // Panzoom-Instanz
    };
  },
  methods: {
    async capturePhoto() {
      if (this.exposureTime <= 0) {
        alert("Bitte geben Sie eine gültige Belichtungszeit ein.");
        return;
      }

      this.loading = true;
      this.remainingExposureTime = this.exposureTime;
      this.progress = 0; // Fortschritt zurücksetzen
      this.isExposure = true; // Die Belichtung startet
      this.isLoadingImage = false;

      try {
        // Starten der Aufnahme (ohne darauf zu warten)
        const capturePromise = apiService.startCapture(this.exposureTime);

        // Countdown der Belichtungszeit starten
        await this.startExposureCountdown();

        // Warten, bis die Aufnahme abgeschlossen ist
        await capturePromise;

        // Nach der Belichtung anzeigen, dass das Bild geladen wird
        this.isExposure = false; // Die Belichtung ist abgeschlossen
        this.isLoadingImage = true; // Das Bild wird geladen

        // Schritt 2: Wiederholt prüfen, ob das Bild verfügbar ist
        let attempts = 0;
        const maxAttempts = 15; // Maximal 15 Sekunden warten
        let image = null;

        while (!image && attempts < maxAttempts) {
          try {
            const result = await apiService.getCaptureResult();
            image = result?.Response?.Image;

            if (image) {
              this.imageData = `data:image/jpeg;base64,${image}`;
              break;
            }
          } catch (error) {
            console.error("Fehler beim Abrufen des Bildes:", error.message);
          }

          attempts++;
          await this.wait(1000); // 1 Sekunde warten
        }

        if (!image) {
          console.error("Kein Bild verfügbar nach mehreren Versuchen.");
          alert("Bild wurde nicht rechtzeitig bereitgestellt.");
        }
      } catch (error) {
        console.error("Fehler bei der Aufnahme:", error.message);
        alert("Fehler bei der Aufnahme. Siehe Konsole.");
      } finally {
        this.loading = false;
        this.isLoadingImage = false; // Das Bild ist geladen oder der Vorgang ist beendet

        if (this.isLooping) {
          // Startet die Aufnahme erneut, wenn Dauerschleife aktiv ist
          this.capturePhoto();
        }
      }
    },
    startExposureCountdown() {
      return new Promise((resolve) => {
        const totalTime = this.exposureTime;
        const interval = setInterval(() => {
          this.remainingExposureTime--;
          this.progress =
            ((totalTime - this.remainingExposureTime) / totalTime) * 100;

          if (this.remainingExposureTime > 0) {
            // Fortschritt aktualisieren
          } else {
            clearInterval(interval);
            this.progress = 100;
            resolve();
          }
        }, 1000);
      });
    },
    wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
  watch: {
  imageData(newValue) {
    if (newValue) {
      this.$nextTick(() => {
        if (this.$refs.image) {
          // Vorherige Panzoom-Instanz entsorgen, falls vorhanden
          if (this.panzoomInstance) {
            this.panzoomInstance.dispose();
          }
          // Panzoom auf dem Bild initialisieren
          this.panzoomInstance = panzoom(this.$refs.image, {
            maxZoom: 10,
            minZoom: 0.9,
            bounds: true,
            boundsPadding: 0.1,
            zoomDoubleClickSpeed: 5, // Deaktiviert Doppelklick zum Zoomen
          });
        }
      });
    }
  },
},
  beforeUnmount() {
    if (this.panzoomInstance) {
      this.panzoomInstance.dispose();
    }
  },
};
</script>


<style scoped>

img {
  touch-action: none;
  user-select: none;
}

</style>
