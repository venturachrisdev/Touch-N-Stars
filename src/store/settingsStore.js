import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    coordinates: {
      latitude: null,
      longitude: null,
      altitude: null,
    },
    // Support both single connection (legacy) and multiple instances
    connection: {
      ip: '', // Legacy single connection IP
      port: '', // Legacy single connection port
      instances: [], // Array of {id, name, ip, port}
    },
    selectedInstanceId: null,
    lastCreatedInstanceId: null,
  }),
  actions: {
    setCoordinates(coords) {
      this.coordinates = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude,
      };
    },

    // Legacy single connection support
    setConnection(connection) {
      this.connection.ip = connection.ip;
      this.connection.port = connection.port;
    },

    // New methods for managing multiple instances
    addInstance(instance) {
      const newInstance = {
        id: Date.now().toString(),
        name: instance.name || 'Instance',
        ip: instance.ip,
        port: instance.port,
      };
      this.connection.instances.push(newInstance);
      this.lastCreatedInstanceId = newInstance.id;
    },

    isLastCreatedInstance(id) {
      return this.lastCreatedInstanceId === id;
    },

    updateInstance(id, updatedInstance) {
      const index = this.connection.instances.findIndex((i) => i.id === id);
      if (index !== -1) {
        this.connection.instances[index] = {
          ...this.connection.instances[index],
          ...updatedInstance,
        };
      }
    },

    removeInstance(id) {
      this.connection.instances = this.connection.instances.filter((i) => i.id !== id);
      if (this.selectedInstanceId === id) {
        this.selectedInstanceId = null;
      }
    },

    getInstance(id) {
      return this.connection.instances.find((i) => i.id === id);
    },

    setSelectedInstanceId(id) {
      this.selectedInstanceId = id;
    },
  },
  persist: true,
});
