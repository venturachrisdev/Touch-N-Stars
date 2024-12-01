<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-7">Fotoaufnahme</h5>

    <!-- Eingabe für die Belichtungszeit -->
    <div class="flex flex-col md:flex-row gap-4">
      <div
        class="flex flex-row md:flex-col md:space-y-4 space-y-0 gap-4 md:gap-0 md:w-2/6"
      >
        <div class="grid grid-cols-2 items-center justify-between gap-2">
          <label for="exposure" class="text-right text-sm"
            >Belichtungszeit:</label
          >
          <input
            id="exposure"
            v-model.number="exposureTime"
            type="number"
            class="text-black px-4 h-10 max-w-15 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
            placeholder="1"
          />
        </div>

        <!-- Foto aufnehmen -->
        <button
          class="h-10 w-full min-w-14 rounded-md text-white font-medium transition-colors bg-cyan-700 flex items-center justify-center disabled:opacity-50"
          @click="capturePhoto"
          :disabled="loading"
        >
          <template v-if="loading">
            <div v-if="isExposure" class="flex items-center">
              <!-- Fortschrittskreis für Belichtungszeit -->
              <svg class="w-6 h-6" viewBox="0 0 36 36">
                <path
                  class="text-white text-opacity-30 fill-none stroke-current [stroke-width:2.8]"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="fill-none stroke-current [stroke-width:2.8]"
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
                {{ remainingExposureTime }}s
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

      <!-- Anzeige des Bildes mit Zoom-Steuerung -->
      <div v-if="imageData" class="w-full">
        <!-- Zoombares Bild mit Scrollbalken -->
        <div
          class="w-full h-auto overflow-auto touch-auto shadow-lg shadow-cyan-700/40 rounded-xl border border-cyan-700"
        >
          <img
            :src="imageData"
            alt="Aufgenommenes Bild"
            class="max-h-screen transform"
            :style="{ transform: `scale(${scale / 100})` }"
          />
        </div>
        <!-- Zoom-Slider mit Labels -->
        <div class="flex items-center space-x-2 mb-2 mt-2">
          <span class="text-white">Min</span>
          <input
            type="range"
            :min="minScale"
            :max="maxScale"
            :step="1"
            v-model.number="scale"
            class="flex-grow"
          />
          <span class="text-white">Max</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";

export default {
  data() {
    return {
      exposureTime: 1, // Standard-Belichtungszeit
      remainingExposureTime: 0, // Für den Countdown der Belichtungszeit
      progress: 0, // Fortschritt für den Spinner
      imageData: null, // Base64-Daten des Bildes
      loading: false, // Ladezustand
      isExposure: false, // Gibt an, ob die Belichtungszeit läuft
      isLoadingImage: false, // Gibt an, ob das Bild geladen wird
      scale: 100, // Startet bei 100%
      maxScale: 2200, // Maximale Zoomstufe
      minScale: 50, // Minimale Zoomstufe
    };
  },
  methods: {
    async capturePhoto() {
      if (this.exposureTime <= 0) {
        alert("Bitte geben Sie eine gültige Belichtungszeit ein.");
        return;
      }

      this.loading = true;
      this.scale = 100; // Zoomlevel auf Standard setzen
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
        const maxAttempts = 10; // Maximal 10 Sekunden warten
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
};
</script>

<style scoped>
/* Minimales eigenes CSS für spezielle Anpassungen */

/* Hintergrund des Sliders transparent setzen */
input[type="range"] {
  background-color: transparent;
}

/* Pseudo-Elemente können nicht mit Tailwind direkt gestylt werden */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  @apply h-4 w-4 bg-cyan-700 border border-cyan-700 rounded-full cursor-pointer;
  margin-top: -6px;
}

input[type="range"]::-webkit-slider-runnable-track {
  @apply h-1 bg-cyan-700 rounded;
}

/* Für Firefox */
input[type="range"]::-moz-range-thumb {
  @apply h-4 w-4 bg-cyan-700 border border-cyan-700 rounded-full cursor-pointer;
}

input[type="range"]::-moz-range-track {
  @apply h-1 bg-cyan-700 rounded;
}

/* Entfernt den Standardhintergrund in Firefox */
input[type="range"] {
  -moz-appearance: none; /* Wichtig für Firefox */
  background-color: transparent;
}

/* Fokus-Stil entfernen */
input[type="range"]:focus {
  outline: none;
}
</style>
