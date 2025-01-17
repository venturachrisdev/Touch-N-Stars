import { defineStore } from 'pinia';

export const useFlatStore = defineStore('flatStore', {
  state: () => ({
    brightness: 100,
  }),
  actions: {},
});
