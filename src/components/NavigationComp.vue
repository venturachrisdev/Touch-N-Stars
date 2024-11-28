<template>
    <div :class="navClass">
      <router-link to="/equipment" class="nav-button">Ausrüstung</router-link>
      <router-link to="/camera" class="nav-button">Kamera</router-link>
      <router-link to="/tppa" class="nav-button">TPPA</router-link>
      <router-link to="/autofocus" class="nav-button">Autofokus</router-link>
      <router-link to="/sequencer" class="nav-button">Sequenzer</router-link>
      <router-link to="/misc" class="nav-button">Sonstiges</router-link>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isPortrait: window.matchMedia("(orientation: portrait)").matches,
      };
    },
    computed: {
      navClass() {
        return this.isPortrait
          ? 'flex justify-around p-2 bg-gray-800' // Navigation oben
          : 'flex flex-col items-center p-2 bg-gray-800 fixed right-0 top-0 h-full'; // Navigation rechts
      },
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize() {
        this.isPortrait = window.matchMedia("(orientation: portrait)").matches;
      },
    },
  };
  </script>
  
  <style scoped>
  .nav-button {
    @apply px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600;
    display: block;
    text-align: center;
    margin: 4px;
  }
  </style>
  