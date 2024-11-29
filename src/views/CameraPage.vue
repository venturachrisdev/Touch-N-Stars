<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-4">Fotoaufnahme</h5>

    <!-- Eingabe für die Belichtungszeit -->
    <div class="flex flex-col md:flex-row   gap-4">
      <div class="flex flex-row md:flex-col md:space-y-4 space-y-0 gap-4 md:gap-0 md:w-1/5">
        
        <input
          id="exposure"
          v-model.number="exposureTime"
          type="number"
          class=" text-black px-4 min-h-10 min-w-32 max-w-44 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2  focus:border-cyan-700"
          placeholder="Belichtungszeit"
        />
        
        <!-- Foto aufnehmen -->
      <button
        class=" min-h-10 min-w-32 max-w-44 rounded-md text-white font-medium transition-colors bg-cyan-700"
        @click="capturePhoto"
        :disabled="loading"
      >
        {{ loading ? "Aufnahme läuft..." : "Foto aufnehmen" }}
      </button>
    </div>

    <!-- Anzeige des Bildes mit Zoom-Steuerung -->
    <div v-if="imageData" class="mt-4">


      <!-- Zoombares Bild mit Scrollbalken -->
      <div
        class="overflow-auto grid place-items-center  "
      >
        <img
          :src="imageData"
          alt="Aufgenommenes Bild"
          class="max-h-screen"
          :style="{ transform: `scale(${scale})`  }"
        />
      </div>
            <!-- Zoom-Tasten -->
            <div class="flex justify-center space-x-4 mb-2">
        <button
          @click="zoomIn"
          class="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          +
        </button>
        <button
          @click="zoomOut"
          class="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          -
        </button>
      </div>
    </div>
    <!-- Statusanzeige -->
    <div v-if="statusMessage" class="text-white mt-4">
      {{ statusMessage }}
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
      imageData: null, // Base64-Daten des Bildes
      loading: false, // Ladezustand
      statusMessage: null, // Statusnachrichten
      scale: 1, // Zoomstufe des Bildes
      maxScale: 3, // Maximale Zoomstufe
      minScale: 1, // Minimale Zoomstufe
    };
  },
  methods: {
    async capturePhoto() {
      if (this.exposureTime <= 0) {
        alert("Bitte geben Sie eine gültige Belichtungszeit ein.");
        return;
      }

      this.loading = true;
      this.statusMessage = `Starte Aufnahme mit ${this.exposureTime} Sekunden Belichtungszeit...`;
      this.imageData = null;

      try {
        // Schritt 1: Aufnahme starten
        await apiService.startCapture(this.exposureTime);
        this.statusMessage = "Belichtung abgeschlossen. Warte auf Bildübertragung...";

        // Schritt 2: Wiederholt prüfen, ob das Bild verfügbar ist
        let attempts = 0;
        const maxAttempts = this.exposureTime + 3; // Maximal warten: Belichtungszeit + 5 Sekunden
        let image = null;

        while (!image && attempts < maxAttempts) {
          this.statusMessage = `Prüfe Bildverfügbarkeit... Versuch ${attempts + 1}/${maxAttempts}`;
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
    wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    zoomIn() {
      if (this.scale < this.maxScale) {
        this.scale += 0.1;
      }
    },
    zoomOut() {
      if (this.scale > this.minScale) {
        this.scale -= 0.1;
      }
    },
  },
};
</script>

<style scoped>

</style>
