import { defineStore } from 'pinia';

export const useFramingStore = defineStore('FramingStore', {
  state: () => ({
    searchQuery: '',
    targetSearchResult: [],
    selectedItem: null,
    RAangle: 0,
    DECangle: 90,
    RAangleString: '',
    DECangleString: '',
    useNinaCache: true,
    fov: 5,
    camWidth: 0,
    camHeight: 0,
    containerSize: 500,
  }),
  actions: {},
});
