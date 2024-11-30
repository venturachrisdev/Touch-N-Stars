<template>
  <div class=" dark min-h-screen bg-gray-900 text-white ">
    <!-- Navigation -->
    
      <nav>
        <div>
          <NavigationComp />
        </div>
      </nav>

      <!-- Hauptinhalt -->
    <div class="container mx-auto mt-4 p-4  transition-all">
      <router-view />
    </div>
</div>
</template>

<script>
import { useHead } from '@vueuse/head';
import NavigationComp from './components/NavigationComp.vue';

export default {
  setup() {
    useHead ({
      title: "NINA WebApp",
    /*''  meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        },
     ],*/
    })
  },
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
