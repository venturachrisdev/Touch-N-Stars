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
            class="text-black px-4 min-h-10 max-w-15 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-cyan-700"
            placeholder="1"
          />
        </div>

        <!-- Foto aufnehmen -->
        <button
          class="min-h-10 w-full min-w-14 rounded-md text-white font-medium transition-colors bg-cyan-700 flex items-center justify-center"
          @click="capturePhoto"
          :disabled="loading"
        >
          <template v-if="loading">
            <div v-if="isExposure" class="flex items-center">
              <!-- Fortschrittskreis für Belichtungszeit -->
              <svg class="spinner-button" viewBox="0 0 36 36">
                <path
                  class="circle-bg"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="circle"
                  :stroke-dasharray="progress + ', 100'"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span class="ml-2 text-white text-sm font-medium">
               Aufnahme läuft: {{ remainingExposureTime }}s
              </span>
            </div>
            <div v-else-if="isLoadingImage" class="flex items-center">
              <!-- Drehender Spinner für Bild lädt -->
              <svg class="loading-spinner-button" viewBox="0 0 50 50">
                <circle class="loading-circle" cx="25" cy="25" r="20" />
              </svg>
              <span class="ml-2 text-white text-sm font-medium">Bild lädt...</span>
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
            class="max-h-screen"
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
/* Styling für den Slider */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}

input[type="range"]:focus {
  outline: none;
}

/* Webkit */
input[type="range"]::-webkit-slider-runnable-track {
  height: 5px;
  background: #00bcd4;
  border-radius: 3px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 15px;
  width: 15px;
  background: #fff;
  border: 2px solid #00bcd4;
  cursor: pointer;
  border-radius: 50%;
  margin-top: -5px;
}

/* Mozilla */
input[type="range"]::-moz-range-track {
  height: 5px;
  background: #00bcd4;
  border-radius: 3px;
}

input[type="range"]::-moz-range-thumb {
  height: 15px;
  width: 15px;
  background: #fff;
  border: 2px solid #00bcd4;
  cursor: pointer;
  border-radius: 50%;
}

/* IE */
input[type="range"]::-ms-track {
  height: 5px;
  background: transparent;
  border-color: transparent;
  color: transparent;
}

input[type="range"]::-ms-fill-lower {
  background: #00bcd4;
}

input[type="range"]::-ms-fill-upper {
  background: #00bcd4;
}

input[type="range"]::-ms-thumb {
  height: 15px;
  width: 15px;
  background: #fff;
  border: 2px solid #00bcd4;
  cursor: pointer;
  border-radius: 50%;
}

input[type="range"]:focus::-ms-fill-lower {
  background: #00bcd4;
}

input[type="range"]:focus::-ms-fill-upper {
  background: #00bcd4;
}

/* Styling für den Fortschrittskreis innerhalb des Buttons */
.spinner-button {
  width: 24px;
  height: 24px;
}

.circle-bg {
  fill: none;
  stroke: #fff;
  stroke-opacity: 0.3;
  stroke-width: 2.8;
}

.circle {
  fill: none;
  stroke: #fff;
  stroke-width: 2.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
  transform: rotate(-90deg);
  transform-origin: center;
}

/* Styling für den drehenden Spinner innerhalb des Buttons */
.loading-spinner-button {
  animation: rotate 2s linear infinite;
  width: 24px;
  height: 24px;
}

.loading-circle {
  fill: none;
  stroke: #fff;
  stroke-width: 2.8;
  stroke-linecap: round;
  stroke-dasharray: 90,150;
  stroke-dashoffset: 0;
  transform-origin: center;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1,150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90,150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90,150;
    stroke-dashoffset: -124;
  }
}

/* Anpassung des Textes innerhalb des Buttons */
button .percentage {
  fill: #fff;
  font-size: 0.75em;
  text-anchor: middle;
  dominant-baseline: central;
}
</style>
