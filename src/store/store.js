import { defineStore } from 'pinia';
import apiService from '@/services/apiService';

import { useCameraStore } from '@/store/cameraStore';


export const apiStore = defineStore('store', {
  state: () => ({
    intervalId: null,
    intervalIdGraph: null,
    profileInfo: [],
    cameraInfo: { IsExposing: false },
    mountInfo: [],
    filterInfo: [],
    focuserInfo: [],
    rotatorInfo: [],
    focuserAfInfo: [],
    guiderInfo: [],
    LogsInfo: [],
    RADistanceRaw: [],
    DECDistanceRaw: [],
    isBackendReachable: false,
    filterName: 'unbekannt',
    filterNr: null,
    showAfGraph: true,
    imageData: null,
    isLoadingImage: false,
    captureRunning: false,
    rotatorMechanicalPosition:0,
  }),

  actions: {
    async fetchAllInfos() {
      try {
        this.isBackendReachable = await apiService.isBackendReachable();

        if (!this.isBackendReachable) {
          console.warn('Backend ist nicht erreichbar');
          return;
        }

        const [
          cameraResponse,
          mountResponse,
          filterResponse,
          rotatorResponse,
          focuserResponse,
          focuserAfResponse,
          guiderResponse,
          guiderChartResponse,
          logsResponse,
        ] = await Promise.all([
          apiService.cameraAction('info'),
          apiService.mountAction('info'),
          apiService.filterAction('info'),
          apiService.rotatorAction('info'),
          apiService.focusAction('info'),
          apiService.focuserAfAction('info'),
          apiService.guiderAction('info'),
          apiService.fetchGuiderChartData(),
          apiService.getLastLogs('10'),
        ]);

        this.handleApiResponses({
          cameraResponse,
          mountResponse,
          filterResponse,
          rotatorResponse,
          focuserResponse,
          focuserAfResponse,
          guiderResponse,
          guiderChartResponse,
          logsResponse,
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Informationen:', error);
      }
    },

    handleApiResponses({
      cameraResponse,
      mountResponse,
      filterResponse,
      rotatorResponse,
      focuserResponse,
      focuserAfResponse,
      guiderResponse,
      guiderChartResponse,
      logsResponse,
    }) {
      if (cameraResponse.Success) {
        this.cameraInfo = cameraResponse.Response;
      } else {
        console.error('Fehler in der Kamera-API-Antwort:', cameraResponse.Error);
      }

      if (mountResponse.Success) {
        this.mountInfo = mountResponse.Response;
      } else {
        console.error('Fehler in der Mount-API-Antwort:', mountResponse.Error);
      }

      if (filterResponse.Success) {
        this.filterInfo = filterResponse.Response;
      } else {
        console.error('Fehler in der Filter-API-Antwort:', filterResponse.Error);
      }

      if (rotatorResponse.Success) {
        this.rotatorInfo = rotatorResponse.Response;
      } else {
        console.error('Fehler in der Rotator-API-Antwort:', rotatorResponse.Error);
      }

      if (focuserResponse.Success) {
        this.focuserInfo = focuserResponse.Response;
      } else {
        console.error('Fehler in der Focuser-API-Antwort:', focuserResponse.Error);
      }

      if (focuserAfResponse.Success) {
        this.focuserAfInfo = focuserAfResponse;
      } else {
        console.error('Fehler in der Focuser-AF-API-Antwort:', focuserAfResponse.Error);
      }

      if (logsResponse) {
        this.LogsInfo = logsResponse;
      } else {
        console.error('Fehler in der Logs-API-Antwort:', logsResponse.Error);
      }

      if (guiderResponse.Success) {
        this.guiderInfo = guiderResponse.Response;
      } else {
        console.error('Fehler in der Guider-API-Antwort:', guiderResponse.Error);
      }

      if (guiderChartResponse.success) {
        this.processGuiderChartData(guiderChartResponse.data);
      } else {
        console.error('Fehler in der Guider-Chart-API-Antwort:', guiderChartResponse);
      }
    },

    processGuiderChartData(data) {
      if (!Array.isArray(data.RADistanceRaw) || !Array.isArray(data.DECDistanceRaw)) {
        console.error('Ungültige Datenstruktur:', data);
        return;
      }

      this.RADistanceRaw = data.RADistanceRaw.map(value => (typeof value === 'number' ? value : 0));
      this.DECDistanceRaw = data.DECDistanceRaw.map(value => (typeof value === 'number' ? value : 0));
    },

    startFetchingInfo() {
      if (!this.intervalId) {
        this.intervalId = setInterval(this.fetchAllInfos, 1000);
      }
    },

    stopFetchingInfo() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    async fetchProfilInfos() {
      try {
        if (!this.isBackendReachable) {
          console.warn('Backend ist nicht erreichbar');
          return;
        }

        const profileInfoResponse = await apiService.profileAction("show?active=true");

        if (profileInfoResponse && profileInfoResponse.Response) {
          this.profileInfo = profileInfoResponse.Response;
          console.log('Profilinformationen abgerufen:', this.profileInfo);
          this.setDefaultCameraSettings();
          this.setDefaultRotatorSettings();
        } else {
          console.error('Fehler in der Profil-API-Antwort:', profileInfoResponse?.Error);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Profilinformationen:', error);
      }
    },
    setDefaultCameraSettings() {
      const cStore = useCameraStore();
      cStore.coolingTemp = this.profileInfo?.CameraSettings.Temperature ?? -10;
      cStore.coolingTime = this.profileInfo?.CameraSettings.CoolingDuration ?? 10;
      cStore.warmingTime = this.profileInfo?.CameraSettings.WarmingDuration ?? 10;
      cStore.gain = this.profileInfo?.CameraSettings.Gain ?? 0;
      console.log('Kameraeinstellungen gesetzt:', cStore.coolingTemp, cStore.coolingTime, cStore.warmingTime, cStore.gain); // eslint-disable-line
    },
    setDefaultRotatorSettings() {

      this.rotatorMechanicalPosition = this.rotatorInfo?.MechanicalPosition ?? 0;
      console.log('Rotatoreinstellung gesetzt:', this.rotatorMechanicalPosition); 
    },
  },
});
