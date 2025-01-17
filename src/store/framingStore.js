import { defineStore } from 'pinia';

export const useFramingStore = defineStore('FramingStore', {
  state: () => ({
    searchQuery: '',
    targetSearchResult: [],
    selectedItem: null,
    RAangle: '',
    DECangle: '',
    RAangleString: '',
    DECangleString: '',
    useNinaCache: true,
  }),
  actions: {},
});
