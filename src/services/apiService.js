import axios from "axios";

const BASE_URL = "http://192.168.2.128:5000/v2/api";
const API_URL = "http://192.168.2.128:5000/api/";
const TARGETPIC_URL = "http://192.168.2.128:5000/api/targetpic";

const apiService = {
  // Backend reachability check
  async isBackendReachable() {
    try {
      const response = await axios.get(`${BASE_URL}/version`);
      return response.status === 200;
    } catch (error) {
      console.error("Error reaching backend:", error.message);
      return false;
    }
  },

  // Camera actions
  cameraAction(action) {
    return this._simpleGetRequest(`${BASE_URL}/equipment/camera/${action}`);
  },

  // Mount actions
  mountAction(action) {
    return this._simpleGetRequest(`${BASE_URL}/equipment/mount/${action}`);
  },

  // Focuser actions
  focusAction(action) {
    console.log(action);
    return this._simpleGetRequest(`${BASE_URL}/equipment/focuser/${action}`);
  },

  // Guider actions
  guiderAction(action) {
    return this._simpleGetRequest(`${BASE_URL}/equipment/guider/${action}`);
  },

  // Framing actions
  framingAction(action) {
    return this._simpleGetRequest(`${BASE_URL}/framing/${action}`);
  },

  // Start capture
  async startCapture(duration) {
    try {
      const response = await axios.get(`${BASE_URL}/equipment/camera/capture`, {
        params: { duration, getResult: false },
      });
      return response.data;
    } catch (error) {
      console.error("Error starting capture:", error);
      throw error;
    }
  },

  // Get capture result
  async getCaptureResult() {
    try {
      const response = await axios.get(`${BASE_URL}/equipment/camera/capture`, {
        params: { getResult: true, quality: 80 },
      });
      return response.data;
    } catch (error) {
      console.error("Error retrieving capture result:", error);
      throw error;
    }
  },

  // Move focuser
  async moveFocuser(position) {
    try {
      const response = await axios.get(`${BASE_URL}/equipment/focuser/move`, {
        params: { position },
      });
      return response.data;
    } catch (error) {
      console.error("Error moving focuser:", error);
      throw error;
    }
  },

  // Slew and center
  async slewAndCenter(RAangle, DECangle, Center) {
    try {
      await axios.get(`${BASE_URL}/framing/set-coordinates`, {
        params: { RAangle, DECangle },
      });

      const params = Center ? { slewoption: "Center" } : {};
      const response = await axios.get(`${BASE_URL}/framing/slew`, { params });
      return response.data;
    } catch (error) {
      console.error("Error controlling mount:", error);
      throw error;
    }
  },

  // NGC search
  async searchNGC(query, limit = 10) {
    return this._getWithParams(`${API_URL}ngc/search`, { query, limit });
  },

  async getNgcCache() {
    return this._simpleGetRequest(`${API_URL}ngc/cache`);
  },

  async updateNgcCache(data) {
    try {
      const response = await axios.post(`${API_URL}ngc/cache`, { data });
      return response.data;
    } catch (error) {
      console.error("Error updating NGC cache:", error);
      throw error;
    }
  },

  // Load target picture
  async searchTargetPic(width, height, fov, ra, dec) {
    try {
      const response = await axios.get(TARGETPIC_URL, {
        params: { width, height, fov, ra, dec, hips: "CDS/P/DSS2/color", projection: "STG", format: "jpg" },
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error retrieving target picture:", error);
      throw error;
    }
  },

  // Fetch guider chart data
  async fetchGuiderChartData() {
    try {
      const response = await axios.get(`${API_URL}guider-data`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching guider data:", error);
      return { success: false, message: "Error fetching guider data" };
    }
  },

  // Helper methods
  _simpleGetRequest(url) {
    return axios
      .get(url)
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error in GET request to ${url}:`, error);
        throw error;
      });
  },

  _getWithParams(url, params) {
    return axios
      .get(url, { params })
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error in GET request to ${url} with params:`, error);
        throw error;
      });
  },
};

export default apiService;
