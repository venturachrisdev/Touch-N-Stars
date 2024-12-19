import { defineStore } from 'pinia';
import apiService from '@/services/apiService';

export const apiStore = defineStore("store", {
  state: () => ({
    intervalId: null,
    intervalIdGraph: null,
    cameraInfo: [],
    mountInfo: [],
    focuserInfo: [],
    guiderInfo: [],
    RADistanceRaw: [],
    DECDistanceRaw: [],
    isBackendReachable: false,
  }),
  actions: {
    async fetchAllInfos() {
      try {
        this.isBackendReachable = await apiService.isBackendReachable();
        if (!this.isBackendReachable){
          console.log("Backend ist nicht erreichbar")
            }
      } catch (error) {
        console.error("Fehler beim Abrufen der Informationen:", error);
      }
      if (this.isBackendReachable) {
        try {
          const [cameraResponse, mountResponse, focuserResponse, guiderResponse, GuiderChartResponse] = await Promise.all([
            apiService.cameraAction("info"),
            apiService.mountAction("info"),
            apiService.focusAction("info"),
            apiService.guiderAction("info"),
            apiService.fetchGuiderChartData()
          ]);

          // Kamera
          if (cameraResponse.Success) {
            this.cameraInfo = cameraResponse.Response;
           // console.log("Kamera Info:", this.cameraInfo);
          } else {
            this.isConnected = false;
            console.error("Fehler in der Kamera-API-Antwort:", cameraResponse.Error);
          }

          // Montierung
          if (mountResponse.Success) {
            this.mountInfo = mountResponse.Response;
            //console.log("Mount Info:", this.mountInfo);
          } else {
            this.isConnected = false;
            console.error("Fehler in der Mount-API-Antwort:", mountResponse.Error);
          }

          // Fokussierer
          if (focuserResponse.Success) {
            this.focuserInfo = focuserResponse.Response;
            //console.log("Focuser Info:", this.focuserInfo);
          } else {
            this.isConnected = false;
            console.error("Fehler in der Focuser-API-Antwort:", focuserResponse.Error);
          }

          // Guider
          if (guiderResponse.Success) {
            this.guiderInfo = guiderResponse.Response;
            //console.log("Guider Info:", this.guiderInfo);
          } else {
            this.isConnected = false;
            console.error("Fehler in der Guider-API-Antwort:", guiderResponse.Error);
          }

          if (GuiderChartResponse.success) {
            if (GuiderChartResponse.success) {
              const data = GuiderChartResponse.data;

              if (
                !Array.isArray(data.RADistanceRaw) ||
                !Array.isArray(data.DECDistanceRaw)
              ) {
                console.error("Ungültige Datenstruktur:", data);
                return;
              }
              const sanitizedRA = data.RADistanceRaw.map((value) =>
                typeof value === "number" ? value : 0
              );
              const sanitizedDec = data.DECDistanceRaw.map((value) =>
                typeof value === "number" ? value : 0
              );

              this.RADistanceRaw = sanitizedRA;
              this.DECDistanceRaw = sanitizedDec;

            } 
          }

        } catch (error) {
          console.error("Fehler beim Abrufen der Informationen:", error);
        }
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
    },


  }
});
