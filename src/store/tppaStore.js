import { defineStore } from 'pinia';

export const useTppaStore = defineStore('tppaStore', {
  state: () => ({
    lastMessage: null,
    status: 'nicht verbunden',
    isConnected: false,
    currentMessage : null,
  }),

  actions: {

  },

});
