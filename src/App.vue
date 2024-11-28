<template>
  <div class="dark min-h-screen bg-gray-900 text-white">
    <NavigationComp />
    <router-view />
  </div>
</template>

<script>
import NavigationComp from './components/NavigationComp.vue';

export default {
  components: {
    NavigationComp,
  },
};
</script>
