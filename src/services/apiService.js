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

  // Fokusierer
  focusAction(action) {
    return axios.get(`${BASE_URL}/equipment/focuser/${action}`).then((response) => response.data);
  },


  //Foto aufnehmen ------------------------------------
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
          params: { 
            getResult: true,
            quality: 80,
           },
        })
        .then((response) => response.data)
        .catch((error) => {
          console.error("Fehler beim Abrufen des Bildes:", error);
          throw error;
        });
    },
    // Focuser --------------------------------------------------------
    async moveFocuser(position) {
      return axios
        .get(`${BASE_URL}/equipment/focuser/move`, {
          params: { position },
        })
        .then((response) => response.data)
        .catch((error) => {
          console.error("Fehler beim Steuern des OAZ:", error);
          throw error;
        });
    },
    async startAutofocus() {
      return axios
        .get(`${BASE_URL}/equipment/focuser/auto-focus`, {

        })
        .then((response) => response.data)
        .catch((error) => {
          console.error("Fehler beim Steuern des OAZ:", error);
          throw error;
        });
    },
    async getFocuserInfo(){
      return axios
      .get(`${BASE_URL}/equipment/focuser/info`, {
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Fehler beim abrufen des OAZ:", error);
        throw error;
      });
    },
  };

export default apiService;
