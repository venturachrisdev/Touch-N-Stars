<template>
  <div class="dark min-h-screen bg-gray-900 text-white flex">
    <!-- Navigation -->
    <NavigationComp class="bg-gray-800 shadow-md" />

    <!-- Hauptinhalt -->
    <div
      class="p-4 transition-all"
      :class="{
        'mt-16 mr-16': isPortrait, /* Platz für horizontale Navigation */
        'mt-0 mr-0': !isPortrait /* Platz für vertikale Navigation */
      }"
    >
      <router-view class="w-full h-full" />
    </div>
  </div>
</template>

<script>
import NavigationComp from './components/NavigationComp.vue';

export default {
  components: {
    NavigationComp,
  },
  data() {
    return {
      isPortrait: window.matchMedia('(orientation: portrait)').matches,
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isPortrait = window.matchMedia('(orientation: portrait)').matches;
    },
  },
};
</script>

<style scoped>
/* Zusätzlicher Platzhalter für Debugging */
</style>
