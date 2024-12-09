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
      if (state.rmsValuesRA.length >= 100) state.rmsValuesRA.shift();
      if (state.rmsValuesDec.length >= 100) state.rmsValuesDec.shift();
      if (state.rmsValuesTotal.length >= 100) state.rmsValuesTotal.shift();

      state.rmsValuesRA.push(raRmsValue);
      state.rmsValuesDec.push(decRmsValue);
      state.rmsValuesTotal.push(totalRmsValue);


    },
    ADD_RAW_VALUES(state, { RADistanceRaw, DECDistanceRaw, RADuration, DECDuration }) {
      //Akutelle Abweichungen
      if (state.RADistanceRaw.length >= 100) state.RADistanceRaw.shift();
      if (state.DECDistanceRaw.length >= 100) state.DECDistanceRaw.shift();
      if (state.RADuration.length >= 100) state.RADuration.shift();
      if (state.DECDuration.length >= 100) state.DECDuration.shift();

      state.RADistanceRaw.push(RADistanceRaw);
      state.DECDistanceRaw.push(DECDistanceRaw);
      state.RADuration.push(RADuration);
      state.DECDuration.push(DECDuration);
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

          const RADistanceRaw = parseFloat(data.LastGuideStep.RADistanceRaw.toFixed(2));
          const DECDistanceRaw = parseFloat(data.LastGuideStep.DECDistanceRaw.toFixed(2));
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
        }, 1000);
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
