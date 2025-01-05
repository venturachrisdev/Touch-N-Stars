<template>
  <div>
    <SubNav :items="[
      { name: t('components.sequence.title'), value: 'showSequenz' },
      { name: t('components.sequence.stats'), value: 'showSeqStats' }
    ]" v-model:activeItem="currentTab" />
  </div>
  <div v-if="!store.sequenceIsLoaded" class="pt-24">
    <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center ">
      <p class="text-red-400 font-medium ">{{ $t('components.sequence.noSequenceLoaded') }}</p>
    </div>
  </div>
  <div v-else class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 pt-14">
    <div class="max-w-4xl mx-auto">
      <!-- Title 
      <h1 class="text-3xl text-center font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        {{ $t('components.sequence.title') }}
      </h1>-->
      <!-- Content Sections -->
      <div class="space-y-8">
        <controlSequence />
        <transition name="fade">
          <div v-show="currentTab === 'showSequenz'" class="space-y-8">

            <infoSequence />
          </div>
        </transition>

        <transition name="fade">
          <div v-show="currentTab === 'showSeqStats'">
            <sequenceStats />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup>
import infoSequence from '@/components/sequence/infoSequence.vue';
import controlSequence from '@/components/sequence/controlSequence.vue';
import sequenceStats from '@/components/sequence/sequenceStats.vue';
import { apiStore } from '@/store/store';
import SubNav from '@/components/SubNav.vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';


const currentTab = ref('showSequenz'); // Standardwert
const store = apiStore();
const { t } = useI18n()

</script>
<style scoped></style>
