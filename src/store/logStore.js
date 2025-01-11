import { defineStore } from 'pinia';
import apiService from '@/services/apiService';
import { apiStore } from '@/store/store';

export const useLogStore = defineStore('LogStore', {
  state: () => ({
    intervalId: null,
    LogsInfo: [],
    canSetPos: true,
    foundPos : 0,
    foundPosTime : new Date(),

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
        //console.log('Alle Logs:', this.LogsInfo);

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
          
          const firstPositionEntry = logs.logs
            .find(log => log.message.includes('Moving Focuser to position'));

           
          let foundPosition = null;
          let  foundPositionTime = 0;
          //console.log(this.canSetPos)
          if (firstPositionEntry && this.canSetPos) {
            // Positionswert herausparsen, z.B. "2100"
            const match = firstPositionEntry.message.match(/Moving Focuser to position\s+(\d+)/);
            if (match) {
              foundPosition = parseInt(match[1], 10);
              foundPositionTime = new Date(firstPositionEntry.timestamp).getTime() ;
              //console.log(foundPositionTime);
              this.canSetPos = false;
              this.foundPos = foundPosition;
              this.foundPosTime = foundPositionTime;
              //console.log('Erste Position gefunden:', foundPosition);
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
             // console.log('hfr: ',firstNewHfrEntry.timestamp)
              //console.log('Neuer HFR-Wert gefunden:', foundHfr, 'Zeit:', foundHfrTime);
              // Wenn Pos und HFR gefunden dann darf Pos wieder erfasst werden
              this.canSetPos = true;
            }
          }

          // -------------------------------------------------------
          // 3) Wenn BEIDE Werte (Position & HFR) ,
          //    lege einen kombinierten Datensatz an.
          // -------------------------------------------------------
          //console.log('Hfr: ', foundHfrTime, 'zu' , this.foundPosTime)
          if (this.foundPos !== null && foundHfr !== null && (foundHfrTime - 1000) > this.foundPosTime  ) {
            this.focuserData.push({
              pos: this.foundPos,
              hfr: foundHfr,
            });
            // Nach dem Push sortieren aufsteigend nach pos
            this.focuserData.sort((a, b) => a.pos - b.pos);
            console.log(
              `Neuer Datensatz: pos = ${this.foundPos}, hfr = ${foundHfr}`
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

        //console.log('Aktuelle Kombinationen (pos, hfr):', this.focuserData);
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
