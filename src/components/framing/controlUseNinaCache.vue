<template>
  <toggleButton
    @click="toggleNinaCache"
    :status-value="framingStore.useNinaCache"
    class="pr-5 pl-5 justify-center"
  />
</template>
<script setup>
import { useFramingStore } from '@/store/framingStore';
import toggleButton from '@/components/helpers/toggleButton.vue';

const framingStore = useFramingStore();

function toggleNinaCache() {
  if (framingStore.useNinaCache) {
    framingStore.useNinaCache = false;
    console.log('Hipps nutzen');
  } else {
    framingStore.useNinaCache = true;
    console.log('cache nutzen');
  }
}
</script>
