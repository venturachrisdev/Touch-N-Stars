import { defineStore } from 'pinia';
import apiService from '../services/apiService';
import { apiStore } from '@/store/store';

export const useLogStore = defineStore('LogStore', {
  state: () => ({
    intervalId: null,
    LogsInfo: [],

    // Hier speichern wir kombinierte Objekte, z.B. { pos: 2100, hfr: 1.25 }
    focuserData: [],

    startAfTime: "",
    // Wir merken uns den höchsten Timestamp, den wir schon verarbeitet haben,
    // damit wir keine doppelten Einträge bekommen.
    lastHfrLogTime: 0,
  }),

  actions: {
    async fetchLogInfos() {
      try {
        const store = apiStore();

        if (!store.isBackendReachable) {
          console.warn('Backend ist nicht erreichbar log');
          return;
        }

        // Logs vom Backend holen (z.B. die letzten 100)
        const logs = await apiService.getLastLogs('100');
        this.LogsInfo = logs;
        console.log('Alle Logs:', this.LogsInfo);

        // Prüfen, ob der Autofokus läuft
        if (store.focuserAfInfo && store.focuserAfInfo.autofocus_running) {
          // Falls noch keine Startzeit gespeichert ist -> jetzt setzen
          if (!this.startAfTime) {
            this.startAfTime = Date.now();
            console.log('Autofokus gestartet um (ms): ', this.startAfTime);
          }

          // Falls wir noch nie HFR/Positions-Logs verarbeitet haben,
          // initialisieren wir lastHfrLogTime auf startAfTime
          if (!this.lastHfrLogTime) {
            this.lastHfrLogTime = this.startAfTime;
          }

          // -------------------------------------------------------
          // 1) Ersten neuen Position-Log suchen ("Moving Focuser to position XYZ")
          // -------------------------------------------------------
          const firstNewPositionEntry = logs.logs
            .filter(log => {
              if (!log.message.includes('Moving Focuser to position')) return false;
              const logTime = new Date(log.timestamp).getTime();
              // Muss NACH startAfTime und NACH lastHfrLogTime liegen
              return logTime >= this.startAfTime && logTime > this.lastHfrLogTime;
            })
            // Aufsteigend nach Timestamp sortieren, um den *frühesten* zu kriegen
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];

          let foundPosition = null;
          let foundPositionTime = 0;
          if (firstNewPositionEntry) {
            // Positionswert herausparsen, z.B. "2100"
            const match = firstNewPositionEntry.message.match(/Moving Focuser to position\s+(\d+)/);
            if (match) {
              foundPosition = parseInt(match[1], 10);
              foundPositionTime = new Date(firstNewPositionEntry.timestamp).getTime();
              console.log('Neue Position gefunden:', foundPosition, 'Zeit:', foundPositionTime);
            }
          }

          // -------------------------------------------------------
          // 2) Ersten neuen HFR-Log suchen ("Average HFR: X.Y")
          // -------------------------------------------------------
          const firstNewHfrEntry = logs.logs
            .filter(log => {
              if (!log.message.includes('Average HFR:')) return false;
              const logTime = new Date(log.timestamp).getTime();
              return logTime >= this.startAfTime && logTime > this.lastHfrLogTime;
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];

          let foundHfr = null;
          let foundHfrTime = 0;
          if (firstNewHfrEntry) {
            const match = firstNewHfrEntry.message.match(/Average HFR:\s*([\d.]+)/);
            if (match) {
              foundHfr = parseFloat(match[1]);
              foundHfrTime = new Date(firstNewHfrEntry.timestamp).getTime();
              console.log('Neuer HFR-Wert gefunden:', foundHfr, 'Zeit:', foundHfrTime);
            }
          }

          // -------------------------------------------------------
          // 3) Wenn wir BEIDE Werte (Position & HFR) haben,
          //    legen wir einen kombinierten Datensatz an.
          // -------------------------------------------------------
          if (foundPosition !== null && foundHfr !== null) {
            this.focuserData.push({
              pos: foundPosition,
              hfr: foundHfr,
            });
            console.log(
              `Neuer Datensatz: pos = ${foundPosition}, hfr = ${foundHfr}`
            );
          }

          // -------------------------------------------------------
          // 4) lastHfrLogTime hochsetzen
          // -------------------------------------------------------
          // Maximalen Zeitstempel der gefundenen Logs errechnen
          // (damit wir denselben Eintrag beim nächsten Mal
          // nicht erneut verarbeiten)
          const maxNewTime = Math.max(
            this.lastHfrLogTime,
            foundPositionTime,
            foundHfrTime
          );

          if (maxNewTime > this.lastHfrLogTime) {
            this.lastHfrLogTime = maxNewTime;
          }

        } else {
          // Autofokus läuft nicht -> alles zurücksetzen
          this.focuserData = [];
          this.startAfTime = "";
          this.lastHfrLogTime = 0;
        }

        console.log('Aktuelle Kombinationen (pos, hfr):', this.focuserData);
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
