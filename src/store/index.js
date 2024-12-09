import { createStore } from 'vuex';
import apiService from '@/services/apiService';

const store = createStore({
  state: {
    rmsValuesRA: [],
    rmsValuesDec: [],
    rmsValuesTotal: [], 
    RADistanceRaw: [],
    DECDistanceRaw: [],
    RADuration: [],
    DECDuration: [],
  },
  data() {
    return {
     
    };
  },
  mutations: {
    ADD_RMS_VALUES(state, { raRmsValue, decRmsValue, totalRmsValue }) {
      //RMS Werte
      if (state.rmsValuesRA.length >= 50) state.rmsValuesRA.shift();
      if (state.rmsValuesDec.length >= 50) state.rmsValuesDec.shift();
      if (state.rmsValuesTotal.length >= 50) state.rmsValuesTotal.shift();

      state.rmsValuesRA.push(raRmsValue);
      state.rmsValuesDec.push(decRmsValue);
      state.rmsValuesTotal.push(totalRmsValue);


    },
    ADD_RAW_VALUES(state, { RADistanceRaw, DECDistanceRaw, RADuration, DECDuration }) {
      // Funktion zum Hinzufügen nur, wenn sich der Wert geändert hat
      const addIfChanged = (array, value) => {
          if (array.length >= 50) array.shift(); // Entferne älteste Werte bei Bedarf
          if (array.length === 0 || array[array.length - 1] !== value) {
              array.push(value); // Füge nur hinzu, wenn Wert anders ist
          }
      };
  
      // Überprüfe und füge Werte hinzu
      addIfChanged(state.RADistanceRaw, RADistanceRaw);
      addIfChanged(state.DECDistanceRaw, DECDistanceRaw);
      addIfChanged(state.RADuration, RADuration);
      addIfChanged(state.DECDuration, DECDuration);
  },
  },
  actions: {
    async fetchGuiderData({ commit }) {
      try {
        const response = await apiService.guiderAction('info');
        if (response.Success) {
          const data = response.Response;
          //console.log(data);
          const raRmsValue = parseFloat(data.RMSError.RA.Arcseconds.toFixed(2));
          const decRmsValue = parseFloat(data.RMSError.Dec.Arcseconds.toFixed(2));
          const totalRmsValue = parseFloat(data.RMSError.Total.Arcseconds.toFixed(2));

          const RADistanceRaw = parseFloat(data.LastGuideStep.RADistanceRaw.toFixed(2))*parseFloat(data.PixelScale);
          const DECDistanceRaw = parseFloat(data.LastGuideStep.DECDistanceRaw.toFixed(2))*parseFloat(data.PixelScale);
          const RADuration = parseFloat(data.LastGuideStep.RADuration.toFixed(0));
          const DECDuration = parseFloat(data.LastGuideStep.DECDuration.toFixed(0));

          commit('ADD_RMS_VALUES', { raRmsValue, decRmsValue, totalRmsValue });
          commit('ADD_RAW_VALUES', { RADistanceRaw, DECDistanceRaw, RADuration, DECDuration });
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der RMS-Daten:', error);
      }
    },
    startFetching({ dispatch }) {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          dispatch('fetchGuiderData');
        }, 500);
      }
    },
    stopFetching() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
  },
  getters: {
    rmsValuesRA: (state) => state.rmsValuesRA,
    rmsValuesDec: (state) => state.rmsValuesDec,
    rmsValuesTotal: (state) => state.rmsValuesTotal,

    RADistanceRaw: (state) => state.RADistanceRaw,
    DECDistanceRaw: (state) => state.DECDistanceRaw,
    RADuration: (state) => state.RADuration,
    DECDuration: (state) => state.DECDuration,
  },
});

export default store;
