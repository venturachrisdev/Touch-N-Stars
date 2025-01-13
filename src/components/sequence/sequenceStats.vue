<template>
  <div class="flex justify-center">
    <div
      v-if="store.imageHistoryInfo && store.imageHistoryInfo.length > 0"
      class="max-w-md landscape:max-w-2xl"
    >
      <LastSequenceImg />
      <SequenzGraph class="pt-4" />
    </div>
    <div v-else class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
      <p class="text-red-400 font-medium">{{ $t('components.sequence.noSequenceData') }}</p>
    </div>
  </div>
</template>

<script setup>
import LastSequenceImg from './LastSequenceImg.vue';
import SequenzGraph from './SequenzGraph.vue';
import { apiStore } from '@/store/store';

const store = apiStore();
</script>

<style>
/* Keine zusätzlichen Styles notwendig, da Tailwind CSS verwendet wird */
</style>
