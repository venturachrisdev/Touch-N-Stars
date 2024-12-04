<template>
  <div class="container text-center">
    <h5 class="text-xl  font-bold text-white mb-4">Montierung</h5>

     <!-- Integration von TppaPage -->
     <TppaPage />
    
  </div>
</template>

<script>

//import apiService from "@/services/apiService";
import TppaPage from '../components/TppaPage.vue';
export default {
  components: {
    TppaPage,
  },
  data() {
    return {

    };
  },
  async mounted() {
    
  },
  methods: {

  },
};
</script>
