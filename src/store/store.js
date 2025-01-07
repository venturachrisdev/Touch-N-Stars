import { defineStore } from 'pinia';
import apiService from '@/services/apiService';

import { useCameraStore } from '@/store/cameraStore';


export const apiStore = defineStore('store', {
  state: () => ({
    intervalId: null,
    intervalIdGraph: null,
    profileInfo: [],
    sequenceInfo: [],
    collapsedStates: {},
    cameraInfo: { IsExposing: false },
    mountInfo: [],
    filterInfo: [],
    focuserInfo: [],
    rotatorInfo: [],
    focuserAfInfo: [],
    guiderInfo: [],
    flatdeviceInfo: [],
    domeInfo: [],
    safetyInfo: {
      Connected: false,
      IsSafe: false
    },
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
    rotatorMechanicalPosition: 0,
    sequenceIsLoaded: false,
    sequenceRunning: false,
    existingEquipmentList: [],
  }),

  actions: {
    setSequenceRunning(isRunning) {
      this.sequenceRunning = isRunning;
    },
    toggleCollapsedState(containerName) {
      this.collapsedStates = {
        ...this.collapsedStates,
        [containerName]: !this.collapsedStates[containerName]
      };
    },

    isCollapsed(containerName) {
      return !!this.collapsedStates[containerName];
    },

    async fetchAllInfos() {
      try {
        this.isBackendReachable = await apiService.isBackendReachable();

        if (!this.isBackendReachable) {
          console.warn('Backend ist nicht erreichbar');
          return;
        }

        const [
          imageHistoryResponse,
          sequenceResponse,
          cameraResponse,
          mountResponse,
          filterResponse,
          rotatorResponse,
          focuserResponse,
          focuserAfResponse,
          guiderResponse,
          flatdeviceResponse,
          domeResponse,
          guiderChartResponse,
          safetyResponse,
          logsResponse,
        ] = await Promise.all([
          apiService.imageHistoryAll(),
          apiService.sequenceAction('json'),
          apiService.cameraAction('info'),
          apiService.mountAction('info'),
          apiService.filterAction('info'),
          apiService.rotatorAction('info'),
          apiService.focusAction('info'),
          apiService.focuserAfAction('info'),
          apiService.guiderAction('info'),
          apiService.flatdeviceAction('info'),
          apiService.domeAction('info'),
          apiService.fetchGuiderChartData(),
          apiService.safetyAction('info'),
          apiService.getLastLogs('100'),
        ]);

        this.handleApiResponses({
          imageHistoryResponse,
          sequenceResponse,
          cameraResponse,
          mountResponse,
          filterResponse,
          rotatorResponse,
          focuserResponse,
          focuserAfResponse,
          guiderResponse,
          flatdeviceResponse,
          domeResponse,
          guiderChartResponse,
          safetyResponse,
          logsResponse,
        });
      } catch (error) {
        console.error('Fehler beim Abrufen der Informationen:', error);
      }
    },

    handleApiResponses({
      imageHistoryResponse,
      sequenceResponse,
      cameraResponse,
      mountResponse,
      filterResponse,
      rotatorResponse,
      focuserResponse,
      focuserAfResponse,
      guiderResponse,
      flatdeviceResponse,
      domeResponse,
      guiderChartResponse,
      safetyResponse,
      logsResponse,
    }) {
      if (imageHistoryResponse.Success) {
        this.imageHistoryInfo = imageHistoryResponse.Response;
        //console.log('Image History abgerufen:', this.imageHistoryInfo);
      } else {
        this.sequenceIsLoaded = false;
        console.error('Fehler in der Sequence-API-Antwort:', sequenceResponse.Error);
      }

      if (sequenceResponse.Success) {
        this.sequenceInfo = sequenceResponse.Response;
        this.sequenceIsLoaded = true;
        //console.log('Sequenzinformationen abgerufen:', this.sequenceInfo);
      } else {
        this.sequenceIsLoaded = false;
        //console.error('Fehler in der Sequence-API-Antwort:', sequenceResponse.Error);
      }

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
        //console.log('Filterinformationen abgerufen:', this.filterInfo);
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

      if (safetyResponse.Success) {
        this.safetyInfo = safetyResponse.Response;
      } else {
        console.error('Fehler in der Safety-API-Antwort:', safetyResponse.Error);
      }

      if (guiderResponse.Success) {
        this.guiderInfo = guiderResponse.Response;
      } else {
        console.error('Fehler in der Guider-API-Antwort:', guiderResponse.Error);
      }

      if (flatdeviceResponse.Success) {
        this.flatdeviceInfo = flatdeviceResponse.Response;
      } else {
        console.error('Fehler in der Flat-API-Antwort:', flatdeviceResponse.Error);
      }

      if (domeResponse.Success) {
        this.domeInfo = domeResponse.Response;
      } else {
        console.error('Fehler in der Flat-API-Antwort:', domeResponse.Error);
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
        this.intervalId = setInterval(this.fetchAllInfos, 2000);
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
          this.getExistingEquipment(this.profileInfo);
        } else {
          console.error('Fehler in der Profil-API-Antwort:', profileInfoResponse?.Error);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Profilinformationen:', error);
      }
    },

    getExistingEquipment(activeProfile) {
      this.existingEquipmentList =[];
      // Mapping von Schlüssel zu API-Namen
      const apiMapping = {
        CameraSettings: "camera",
        DomeSettings: "dome",
        FilterWheelSettings: "filter",
        FocuserSettings: "focuser",
        SwitchSettings: "switch",
        TelescopeSettings: "mount",
        SafetyMonitorSettings: "safety",
        FlatDeviceSettings: "flatdevice",
        RotatorSettings: "rotator",
        WeatherDataSettings: "weather",
        GuiderSettings: "guider" 
      };
      // Liste der Schlüssel, die potenzielle Geräte enthalten können
      const keysToCheck = Object.keys(apiMapping);

      // Iteriere durch die definierten Schlüssel
      keysToCheck.forEach(key => {
        if (activeProfile && activeProfile[key]) {
          const device = activeProfile[key];
          
          // Sonderfall GuiderSettings (GuiderName anstelle von Id prüfen)
          if (key === "GuiderSettings") {
            if (device.GuiderName && device.GuiderName !== "No_Guider") {
              this.existingEquipmentList.push({ 
                type: key, 
                id: device.GuiderName, 
                apiName: apiMapping[key] 
              });
            }
          } else if (device.Id && device.Id !== "No_Device") {
            // Standardfall für Geräte mit Id
            this.existingEquipmentList.push({ 
              type: key, 
              id: device.Id, 
              apiName: apiMapping[key] 
            });
          }
        }
      });
      console.log(this.existingEquipmentList);
    },

    setDefaultCameraSettings() {
      const cStore = useCameraStore();
      cStore.coolingTemp = this.profileInfo?.CameraSettings.Temperature ?? -10;
      cStore.coolingTime = this.profileInfo?.CameraSettings.CoolingDuration ?? 10;
      cStore.warmingTime = this.profileInfo?.CameraSettings.WarmingDuration ?? 10;
      cStore.gain = this.profileInfo?.CameraSettings.Gain ?? 0;
      cStore.buttonCoolerOn = this.cameraInfo?.CoolerOn ?? false;
      console.log('Kameraeinstellungen gesetzt:', cStore.coolingTemp, cStore.coolingTime, cStore.warmingTime, cStore.gain);
    },
    setDefaultRotatorSettings() {
      this.rotatorMechanicalPosition = this.rotatorInfo?.MechanicalPosition ?? 0;
      console.log('Rotatoreinstellung gesetzt:', this.rotatorMechanicalPosition);
    },
  },
});
