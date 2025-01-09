import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    coordinates: {
      latitude: null,
      longitude: null,
      altitude: null,
    },
    connection: {
      ip: '',
      port: ''
    }
  }),
  actions: {
    setCoordinates(coords) {
      this.coordinates = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude
      };
    },
    setConnection(connection) {
      this.connection = {
        ip: connection.ip,
        port: connection.port
      };
    }
  },
  persist: true
});
