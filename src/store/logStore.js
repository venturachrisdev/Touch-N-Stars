import { defineStore } from 'pinia';
import apiService from '../services/apiService';
import { apiStore } from '@/store/store';

export const useLogStore = defineStore('LogStore', {
  state: () => ({
    intervalId: null,
    LogsInfo: [],
    hfrValues: [], // Array to store HFR values
    startAfTime: "", // merken, ab wann wir HFR-Werte sammeln wollen
  }),

  actions: {
    async fetchLogInfos() {
      try {
        const store = apiStore();

        if (!store.isBackendReachable) {
          console.warn('Backend ist nicht erreichbar log');
          return;
        }

        // Fetch logs from API service (z. B. die letzten 100 Einträge)
        const logs = await apiService.getLastLogs('100');
        this.LogsInfo = logs;
        console.log(this.LogsInfo);

        // Prüfen, ob der Autofokus läuft
        if (store.focuserAfInfo && store.focuserAfInfo.autofocus_running) {
          // Falls wir noch keine Startzeit haben, setzen wir sie jetzt
          if (!this.startAfTime) {
            this.startAfTime = Date.now();
            console.log('Autofokus gestartet um (ms): ', this.startAfTime);
          }

          // Hier filtern wir nur die Einträge, die ein "Average HFR:" haben
          // UND deren timestamp >= startAfTime liegt.
          const newHfrValues = logs.logs
            .filter(log => {
              // Enthält die Message "Average HFR:"?
              if (!log.message.includes('Average HFR:')) return false;

              // Ist der Zeitpunkt des Logs >= startAfTime?
              const logTime = new Date(log.timestamp).getTime();
              return logTime >= this.startAfTime;
            })
            .map(log => {
              // HFR-Wert parsen
              const match = log.message.match(/Average HFR:\s*([\d.]+)/);
              return match ? parseFloat(match[1]) : null;
            })
            .filter(value => value !== null);

          // Beispiel: Neue gefundene HFR-Werte an unser hfrValues-Array anhängen
          // (falls du lieber nur das „aktuelle“ Set an HFR-Werten möchtest,
          // kannst du natürlich einfach `this.hfrValues = newHfrValues;` nehmen)
          this.hfrValues = [...this.hfrValues, ...newHfrValues];
          this.startAfTime = Date.now();
        } else {
          // Autofokus ist nicht aktiv, also leeren wir das Array und den Zeitstempel
          this.hfrValues = [];
          this.startAfTime = "";
        }

        console.log('Extracted HFR values:', this.hfrValues);
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
