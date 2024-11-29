<template>
  <div class="container text-center">
    <h5 class="text-xl font-bold text-white mb-4">Fotoaufnahme</h5>

    <!-- Eingabe für die Belichtungszeit -->
    <div class="mb-4">
      <label for="exposure" class="block text-white mb-2">Belichtungszeit (Sekunden)</label>
      <input
        id="exposure"
        v-model.number="exposureTime"
        type="number"
        class="form-control text-black mx-auto"
        style="max-width: 200px"
        min="1"
        placeholder="Belichtungszeit"
      />
    </div>

    <!-- Foto aufnehmen -->
    <button
      @click="capturePhoto"
      :disabled="loading"
      class="btn btn-primary"
    >
      {{ loading ? "Aufnahme läuft..." : "Foto aufnehmen" }}
    </button>

    <!-- Anzeige des Bildes -->
    <div v-if="imageData" class="mt-4">
      <h6 class="text-white font-bold mb-2">Aufgenommenes Bild</h6>
      <img
        :src="imageData"
        alt="Aufgenommenes Bild"
        class="img-thumbnail mx-auto"
      />
    </div>

    <!-- Statusanzeige -->
    <div v-if="statusMessage" class="text-white mt-4">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
import apiService from "@/services/apiService";

export default {
  data() {
    return {
      exposureTime: 10, // Standard-Belichtungszeit
      imageData: null, // Base64-Daten des Bildes
      loading: false, // Ladezustand
      statusMessage: null, // Statusnachrichten
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
        const maxAttempts = this.exposureTime + 5; // Maximal warten: Belichtungszeit + 5 Sekunden
        let image = null;

        while (!image && attempts < maxAttempts) {
          this.statusMessage = `Prüfe Bildverfügbarkeit... Versuch ${attempts + 1}/${maxAttempts}`;
          try {
            const result = await apiService.getCaptureResult();
            image = result?.Response?.Image;

            if (image) {
              this.statusMessage = "Bild erfolgreich abgerufen.";
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
  },
};
</script>

<style scoped>
/* Optional: Zusätzliche Stile */
.form-control {
  padding: 10px;
  font-size: 16px;
}
</style>
