<template>
  <div class="text-left mb-2">
    <h1 class="text-xl text-center font-bold">{{ $t('components.dome.title') }}</h1>
  </div>
  <div v-if="!store.domeInfo.Connected" class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
    <p class="text-red-400 font-medium text-center">{{ $t('components.dome.please_connect_dome') }}</p>
  </div>
  <div v-else class="container flex items-center justify-center">
    <div class="container max-w-md landscape:max-w-xl">
      <infoDome class="grid grid-cols-2 landscape:grid-cols-3" />
      <controlDome class="grid grid-cols-2 landscape:grid-cols-3" />
      
      
    </div>
  </div>
</template>

<script setup>


import infoDome from '@/components/dome/infoDome.vue';
import controlDome from '@/components/dome/controlDome.vue';
import { apiStore } from '@/store/store';

const store = apiStore();







</script>

<style scoped></style>
