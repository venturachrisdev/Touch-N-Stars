import { defineStore } from 'pinia';
import apiService from '@/services/apiService';

export const apiStore = defineStore("store", {
  state: () => ({
    intervalId: null,
    cameraInfo: [],
    mountInfo: [],
    focuserInfo: [],
    guiderInfo: [],
  }),
  actions: {
    async fetchInfo() {
      try {
        const response = await apiService.cameraAction("info");
        if (response.Success) {
          const data = response.Response;
          this.cameraInfo = data;
          console.log(data);
        } else {
          this.isConnected = false;
          console.error("Fehler in der API-Antwort:", response.Error);
        }
      } catch (error) {
        this.isConnected = false;
        console.error("Fehler beim Abrufen der Mount-Informationen:", error);
      }
    },

    async fetchAllInfos() {
      try {
        const [cameraResponse, mountResponse, focuserResponse, guiderResponse] = await Promise.all([
          apiService.cameraAction("info"),
          apiService.mountAction("info"),
          apiService.focusAction("info"),
          apiService.guiderAction("info")
        ]);
    
        // Kamera
        if (cameraResponse.Success) {
          this.cameraInfo = cameraResponse.Response;
          console.log("Kamera Info:", this.cameraInfo);
        } else {
          this.isConnected = false;
          console.error("Fehler in der Kamera-API-Antwort:", cameraResponse.Error);
        }
    
        // Montierung
        if (mountResponse.Success) {
          this.mountInfo = mountResponse.Response;
          console.log("Mount Info:", this.mountInfo);
        } else {
          this.isConnected = false;
          console.error("Fehler in der Mount-API-Antwort:", mountResponse.Error);
        }
    
        // Fokussierer
        if (focuserResponse.Success) {
          this.focuserInfo = focuserResponse.Response;
          console.log("Focuser Info:", this.focuserInfo);
        } else {
          this.isConnected = false;
          console.error("Fehler in der Focuser-API-Antwort:", focuserResponse.Error);
        }
    
        // Guider
        if (guiderResponse.Success) {
          this.guiderInfo = guiderResponse.Response;
          console.log("Guider Info:", this.guiderInfo);
        } else {
          this.isConnected = false;
          console.error("Fehler in der Guider-API-Antwort:", guiderResponse.Error);
        }
    
      } catch (error) {
        this.isConnected = false;
        console.error("Fehler beim Abrufen der Informationen:", error);
      }
    },
    
     startFetchingInfo() {
      this.intervalId = setInterval(this.fetchAllInfos, 1000);
    },
    stopFetchingInfo() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }
});
