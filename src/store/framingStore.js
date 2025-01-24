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
    width: 200,
    height: 200,
    fov: 2,
  }),
  actions: {},
});
