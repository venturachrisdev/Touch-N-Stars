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
          class="min-h-10 w-full min-w-14 rounded-md text-white font-medium transition-colors bg-cyan-700"
          @click="capturePhoto"
          :disabled="loading"
        >
          {{ loading ? "Aufnahme läuft..." : "Foto aufnehmen" }}
        </button>

        <!-- Statusanzeige unter dem Button -->
        <div v-if="statusMessage" class="text-white mt-2">
          {{ statusMessage }}
        </div>
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
      imageData: null, // Base64-Daten des Bildes
      loading: false, // Ladezustand
      statusMessage: null, // Statusnachrichten
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

      try {
        // Starten der Aufnahme (ohne darauf zu warten)
        const capturePromise = apiService.startCapture(this.exposureTime);

        // Countdown der Belichtungszeit starten
        this.statusMessage = `Belichtungszeit: ${this.remainingExposureTime} Sekunden`;
        await this.startExposureCountdown();

        // Warten, bis die Aufnahme abgeschlossen ist
        await capturePromise;

        // Nach der Belichtung anzeigen, dass das Bild geladen wird
        this.statusMessage = "Bild lädt...";

        // Schritt 2: Wiederholt prüfen, ob das Bild verfügbar ist
        let attempts = 0;
        const maxAttempts = 10; // Maximal 10 Sekunden warten
        let image = null;

        while (!image && attempts < maxAttempts) {
          this.statusMessage = `Bild wird geladen... Versuch ${
            attempts + 1
          }/${maxAttempts}`;
          try {
            const result = await apiService.getCaptureResult();
            image = result?.Response?.Image;

            if (image) {
              this.statusMessage = null;
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
          this.statusMessage = "Bild wurde nicht rechtzeitig bereitgestellt.";
          console.error("Kein Bild verfügbar nach mehreren Versuchen.");
        }
      } catch (error) {
        console.error("Fehler bei der Aufnahme:", error.message);
        this.statusMessage = "Fehler bei der Aufnahme. Siehe Konsole.";
      } finally {
        this.loading = false;
      }
    },
    startExposureCountdown() {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          this.remainingExposureTime--;
          if (this.remainingExposureTime > 0) {
            this.statusMessage = `Belichtungszeit: ${this.remainingExposureTime} Sekunden`;
          } else {
            clearInterval(interval);
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
</style>
