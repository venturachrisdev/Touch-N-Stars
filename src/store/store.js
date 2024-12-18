import { defineStore } from 'pinia';
import apiService from '@/services/apiService';

export const apiStore = defineStore("store", {
  state: () => ({
    age: 45,
    name: "Herbert",
    IsExposing: false,
    Temperature: null,
    isConnected: true,
    intervalId: null,
    cameraInfo: [],
  }),
  actions: {
    testFunktion() {
      this.age++;
      console.log("test");
    },
    async fetchInfo() {
      try {
        const response = await apiService.cameraAction("info");
        if (response.Success) {
          const data = response.Response;
          this.cameraInfo = data;
          this.IsExposing = data.IsExposing;
          this.Temperature = data.Temperature;
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
     startFetchingInfo() {
      this.intervalId = setInterval(this.fetchInfo, 1000);
    },

    stopFetchingInfo() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }
});
