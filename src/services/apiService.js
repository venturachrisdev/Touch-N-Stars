import axios from "axios";

const BASE_URL = "/v2/api";

const apiService = {
  // Kameraaktionen
  cameraAction(action) {
    return axios.get(`${BASE_URL}/equipment/camera/${action}`).then((response) => response.data);
  },

  // Montierungsaktionen
  mountAction(action) {
    return axios.get(`${BASE_URL}/equipment/mount/${action}`).then((response) => response.data);
  },

  // Foto aufnehmen
  capturePhoto(exposureTime) {
    return axios
      .get(`${BASE_URL}/equipment/camera/capture`, {
        params: {
          duration: exposureTime, // Dauer der Belichtung in Sekunden
          getResult: true, // Bild und Ergebnisse nach Abschluss zurückgeben
        },
      })
      .then((response) => {
        if (response.data.Success) {
          return response.data.Response; // Enthält das Bild und andere Details
        } else {
          throw new Error("Fehler bei der Aufnahme des Bildes.");
        }
      })
      .catch((error) => {
        console.error("Fehler beim Aufnehmen des Fotos:", error);
        throw error;
      });
  },

    async startCapture(duration) {
      return axios
        .get(`${BASE_URL}/equipment/camera/capture`, {
          params: { duration, getResult: false },
        })
        .then((response) => response.data)
        .catch((error) => {
          console.error("Fehler beim Starten der Aufnahme:", error);
          throw error;
        });
    },
  
    async getCaptureResult() {
      return axios
        .get(`${BASE_URL}/equipment/camera/capture`, {
          params: { getResult: true },
        })
        .then((response) => response.data)
        .catch((error) => {
          console.error("Fehler beim Abrufen des Bildes:", error);
          throw error;
        });
    },
  };

export default apiService;
