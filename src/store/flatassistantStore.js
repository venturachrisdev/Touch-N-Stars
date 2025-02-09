import { defineStore } from 'pinia';

export const useFlatassistantStore = defineStore('flatassistantStore', {
  state: () => ({
    count: 20,
    minExposureTime: 0.01,
    maxExposureTime: 20,
    histogramMean: 50,
    meanTolerance: 10,
    binning: '1x1',
    gain: 100,
    offset: 0,
  }),
  actions: {},
});
