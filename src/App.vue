<template>
  <div class="dark min-h-screen bg-gray-900 text-white ">
    <!-- Navigation -->
  <nav class="flex-grow flex">
    <div class="container mx-auto flex justify-between items-center">
      <NavigationComp class="bg-gray-800 shadow-md w-full" />
    </div>
  </nav>
    <!-- Hauptinhalt -->
    <div class="container mx-auto mt-12 p-4">
    <div class="flex-grow flex  justify-center w-full h-full p-6 transition-all">
      <router-view />
    </div>
  </div>
</div>
</template>

<script>
import NavigationComp from './components/NavigationComp.vue';

export default {
  components: {
    NavigationComp,

  },
  methods: {
    handleResize() {
      
    },
  },
};
</script>

<style scoped>

</style>
