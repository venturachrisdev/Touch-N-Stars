import { createStore } from 'vuex';
import apiService from '@/services/apiService';

const store = createStore({
  state: {
    rmsValuesRA: [],
    rmsValuesDec: [],
    rmsValuesTotal: [], // Optional: Gesamter RMS-Fehler
  },
  mutations: {
    ADD_RMS_VALUES(state, { raValue, decValue, totalValue }) {
      if (state.rmsValuesRA.length >= 50) state.rmsValuesRA.shift();
      if (state.rmsValuesDec.length >= 50) state.rmsValuesDec.shift();
      if (state.rmsValuesTotal.length >= 50) state.rmsValuesTotal.shift();

      state.rmsValuesRA.push(raValue);
      state.rmsValuesDec.push(decValue);
      state.rmsValuesTotal.push(totalValue);
    },
  },
  actions: {
    async fetchRmsData({ commit }) {
      try {
        const response = await apiService.guiderAction('info');
        if (response.Success) {
          const data = response.Response.RMSError;
          const raValue = parseFloat(data.RA.Arcseconds.toFixed(2));
          const decValue = parseFloat(data.Dec.Arcseconds.toFixed(2));
          const totalValue = parseFloat(data.Total.Arcseconds.toFixed(2));

          commit('ADD_RMS_VALUES', { raValue, decValue, totalValue });
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der RMS-Daten:', error);
      }
    },
    startFetching({ dispatch }) {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          dispatch('fetchRmsData');
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
  },
});

export default store;
