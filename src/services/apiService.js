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
};

export default apiService;
