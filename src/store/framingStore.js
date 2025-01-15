import { defineStore } from 'pinia';

export const useFramingStore = defineStore('FramingStore', {
  state: () => ({
    searchQuery: '',
    targetSearchResult: [], // Geänderter Name
    selectedItem: null, // Besser als leerer String, da es sich um ein Objekt handeln sollte
    RAangleStringDeg: '',
    DECangleStringDeg: '',
    RAangleString: '',
    DECangleString: '',
  }),
  actions: {},
});
