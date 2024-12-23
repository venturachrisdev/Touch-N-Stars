import { defineStore } from 'pinia';
import apiService from '@/services/apiService';

export const apiStore = defineStore("store", {
  state: () => ({
    intervalId: null,
    intervalIdGraph: null,
    cameraInfo: { IsExposing: false }, 
    mountInfo: [],
    focuserInfo: [],
    focuserAfInfo: [],
    guiderInfo: [],
    LogsInfo: [],
    RADistanceRaw: [],
    DECDistanceRaw: [],
    isBackendReachable: false,
    exposureTime: 2,
    gain: 0,
    showAfGraph: true,
    IsExposingTemp: false,
    imageData: null,
    isLoadingImage: false,
    captuerRunning: false,


  }),
  actions: {
    async fetchAllInfos() {
      try {
        this.isBackendReachable = await apiService.isBackendReachable();
        if (!this.isBackendReachable) {
          console.log("Backend ist nicht erreichbar")
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Informationen:", error);
      }
      if (this.isBackendReachable) {
        try {
          const [cameraResponse, mountResponse, focuserResponse, focuserAfResponse, guiderResponse, GuiderChartResponse, LogsResponse] = await Promise.all([
            apiService.cameraAction("info"),
            apiService.mountAction("info"),
            apiService.focusAction("info"),
            apiService.focuserAfAction("info"),
            apiService.guiderAction("info"),
            apiService.fetchGuiderChartData(),
            apiService.getLastLogs("10"),
          ]);

          // Kamera
          if (cameraResponse.Success) {
            this.cameraInfo = cameraResponse.Response;
            //console.log("Kamera Info:", this.cameraInfo);
            //Überwachung auf IsExposing
            if (this.IsExposingTemp === true && this.cameraInfo.IsExposing === false) {
              console.log("Exposing beendet");
              this.loadImage(); // Bild laden
          }
          this.IsExposingTemp = this.cameraInfo.IsExposing;
          
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

          // Autofukus
          if (focuserAfResponse.Success) {
            this.focuserAfInfo = focuserAfResponse;
           // console.log("AF-Focuser Info:", this.focuserAfInfo);
          } else {
            this.isConnected = false;
            console.error("Fehler in der Focuser-API-Antwort:", focuserAfResponse.Error);
          }

          // Logs
          if (LogsResponse) {
            this.LogsInfo = LogsResponse;
            //console.log("Logs Info:", this.LogsInfo);
          } else {
            this.isConnected = false;
            console.error("Fehler in der Logs-API-Antwort:", LogsResponse.Error);
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
    async loadImage() {
      try {
        const maxRetries = 30; // Maximale Anzahl der Wiederholungen
        let retries = 0;
        let image = null;
        this.isLoadingImage = true;
       
    
        while (retries < maxRetries) {
          const result = await apiService.getCaptureResult();
    
          console.log("API-Antwort:", result); // Debugging der Antwort
    
          if (result?.Success && result.Response === "Capture already in progress") {
            console.log("Capture läuft noch. Versuche erneut...");
          } else if (result?.Success && result.Response && result.Response.Image) {
            image = result.Response.Image;
            break; // Bild erfolgreich abgerufen, Schleife verlassen
          } else {
            console.error("Unerwartete API-Antwort:", result);
            break; // Schleife verlassen, da ein unerwarteter Fehler aufgetreten ist
          }
    
          retries++;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 Sekunde warten
        }
    
        if (image) {
          this.imageData = `data:image/jpeg;base64,${image}`;
          console.log("Bild erfolgreich geladen");
        } else {
          console.error("Das Bild konnte nach mehreren Versuchen nicht geladen werden");
        }
      } catch (error) {
        console.error("Fehler beim Laden des Bildes:", error);
      } finally {
        this.isLoadingImage = false;
        this.captuerRunning = false;
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

