<template>
  <div v-if="!store.sequenceIsLoaded" class="pt-2">
    <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
      <p class="text-red-400 font-medium">{{ $t('components.sequence.noSequenceLoaded') }}</p>
    </div>
  </div>
  <div v-else class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 pt-4">
    <div class="max-w-4xl mx-auto">
      <!-- Content Sections -->
      <div class="space-y-8">
        <controlSequence />
        <transition name="fade">
          <div v-show="currentTab === 'showSequenz'" class="space-y-8">
            <infoSequence />
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
import { apiStore } from '@/store/store';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const currentTab = ref('showSequenz'); // Standardwert
const store = apiStore();
const { t } = useI18n();
</script>
<style scoped></style>
