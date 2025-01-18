<template>
  <div class="flex items-center justify-center">
    <div
      v-if="store.imageHistoryInfo && store.imageHistoryInfo.length > 0"
      class="flex flex-col max-w-md landscape:max-w-2xl justify-center items-center space-y-4"
    >
      <div class="mt-5">
        <LastSequenceImg />
      </div>
      <div
        class="w-full min-h-60 min-w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-700"
      >
        <SequenzGraph />
      </div>
      <div
        class="flex w-full min-h-40 bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-700"
      >
        <GuiderStats class="min-w-24 pt-4" />
        <GuiderGraph class="w-full" />
      </div>
      <div class="p-5"></div>
    </div>
    <div v-else class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
      <p class="text-red-400 font-medium">{{ $t('components.sequence.noSequenceData') }}</p>
    </div>
  </div>
</template>

<script setup>
import LastSequenceImg from '@/components/sequence/LastSequenceImg.vue';
import SequenzGraph from '@/components/sequence/SequenzGraph.vue';
import GuiderGraph from '@/components/guider/GuiderGraph.vue';
import GuiderStats from '@/components/guider/GuiderStats.vue';
import { apiStore } from '@/store/store';

const store = apiStore();
</script>

<style>
/* Keine zusätzlichen Styles notwendig, da Tailwind CSS verwendet wird */
</style>
