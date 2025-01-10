import { defineStore } from 'pinia';
import apiService from '../services/apiService';
import { apiStore } from '@/store/store';
/* eslint-disable */ 
export const useLogStore = defineStore('LogStore', {
  state: () => ({
    intervalId: null,
    LogsInfo: [],
  }),

  actions: {
    async fetchLogInfos() {
      try {
        const store = apiStore();

        if (!store.isBackendReachable) {
          console.warn('Backend ist nicht erreichbar log');
          return;
        }
        this.LogsInfo= await apiService.getLastLogs('100')
        
        console.log('Log  ', this.LogsInfo);
      } catch (error) {
        console.error('Fehler beim Abrufen der Informationen:', error);
      }
    },

    startFetchingLog() {
      if (!this.intervalId) {
        this.intervalId = setInterval(this.fetchLogInfos, 2000);
      }
    },

    stopFetchingLog() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

  },
});
