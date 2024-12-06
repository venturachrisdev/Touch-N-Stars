<template>
  <div class=" dark min-h-screen bg-gray-900 text-white ">
    <div v-if="!isBackendReachable">
      <div class="flex w-full min-h-screen items-center justify-center text-2xl text-red-700">
        <p>NINA ist nicht erreichbar!</p>
      </div>
      
    </div>
    <div v-else>
    <!-- Navigation -->
      <nav>
        <div>
          <NavigationComp />
        </div>
      </nav>

      <!-- Hauptinhalt -->
    <div class="container mx-auto  p-4  transition-all">
      <router-view />
    </div>
</div>
</div>
</template>

<script>
import { useHead } from '@vueuse/head';
import NavigationComp from './components/NavigationComp.vue';
import apiService from "@/services/apiService"; 

export default {
  data(){
    return {
      isBackendReachable: false,
    };
  },
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
  async mounted(){
    this.isBackendReachable = await apiService.isBackendReachable();
    if (this.isBackendReachable){
      console.log("ist da");
    } else  {
      console.log("nicht da");
    }
  },
  components: {
    NavigationComp,
  },
  
  methods: {
    handleResize() {
    },
  }
};
</script>

<style scoped>

</style>
