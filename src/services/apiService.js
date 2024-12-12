import axios from "axios";

//const BASE_URL = "/v2/api";
const BASE_URL = "http://192.168.2.128:5000/v2/api";
const NGCS_URL = "http://192.168.2.128:5000/api/ngc/";
//const TARGETPIC_URL = "https://alaskybis.u-strasbg.fr/hips-image-services/hips2fits";
const TARGETPIC_URL = "http://192.168.2.128:5000/api/targetpic";

const apiService = {
  // Backend-Erreichbarkeitsprüfung
  async isBackendReachable() {
    try {
      const response = await axios.get(`${BASE_URL}/version`);
      return response.status === 200;
    } catch (error) {
      console.error("Fehler beim Erreichen des Backends:", error.message);
      return false;
    }
  },

  // Verbindungen ------------------------------
  // Kameraaktionen
  cameraAction(action) {
    return axios.get(`${BASE_URL}/equipment/camera/${action}`).then((response) => response.data);
  },

  // Montierungsaktionen
  mountAction(action) {
    //console.log(action);
    return axios.get(`${BASE_URL}/equipment/mount/${action}`).then((response) => response.data);
  },

  // Fokusierer
  focusAction(action) {
    return axios.get(`${BASE_URL}/equipment/focuser/${action}`).then((response) => response.data);
  },

  // Guider
  guiderAction(action) {
    return axios.get(`${BASE_URL}/equipment/guider/${action}`).then((response) => response.data);
  },

  // framing
  framingAction(action) {
    return axios.get(`${BASE_URL}/framing/${action}`).then((response) => response.data);
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

  // Slew and Center --------------------------------------------------------
  async slewAndCenter(RAangle, DECangle, Center) {
    try {
      // Koordinaten setzen
      await axios.get(`${BASE_URL}/framing/set-coordinates`, {
        params: {
          RAangle,
          DECangle,
        },
      });

      // Slew-Befehl senden
      if (Center === false) {
        const response = await axios.get(`${BASE_URL}/framing/slew`);
        return response.data;
      } else {
        const response = await axios.get(`${BASE_URL}/framing/slew`, {
          params: {
            slewoption: "Center",
          },
        })
        return response.data;
      }
    } catch (error) {
      console.error("Fehler beim Steuern der Montierung:", error);
      throw error;
    }

  },

  // NGC-Suche:
  async searchNGC(query, limit = 10) {
    // Ruft die NGC-Suche auf, die im Flask-Server unter /api/ngc/search läuft
    return axios
      .get(NGCS_URL+"search", {
        params: {
          query,
          limit,
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Fehler bei der NGC-Suche:", error);
        throw error;
      });
  },
  async getNgcCache() {
    return axios
      .get(NGCS_URL+"cache", {
        params: {},
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Fehler bei der NGC-Suche:", error);
        throw error;
      });
  },

  async updateNgcCache(data) {
    return axios
      .post(NGCS_URL+"cache", {
        data,
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error("Fehler beim der NGC-Update:", error);
        throw error;
      });
  },

// Zielbild laden
  async searchTargetPic(width,height,fov,ra,dec) {
    return axios
      .get(TARGETPIC_URL, {
        params: {
          width: width,
          height: height,
          fov: fov,
          ra: ra,
          dec: dec,
          hips: "CDS/P/DSS2/color",
          projection:"STG",
          format: "jpg",
        },
        responseType: "blob", 
      })
      .then((response) => {
        // Erzeugt eine Blob-URL aus den binären Daten
        return URL.createObjectURL(response.data);
      })
      .catch((error) => {
        console.error("Fehler beim abrufen des Zielbildes", error);
        throw error;
      });
    }
};





export default apiService;
