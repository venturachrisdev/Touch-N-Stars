<template>
  <button @click="setSequenceTarget" class="default-button-cyan">
    {{ $t('components.framing.setSequnceTarget') }}
  </button>
</template>

<script setup>
import apiService from '@/services/apiService';
import { apiStore } from '@/store/store';
import { useFramingStore } from '@/store/framingStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = apiStore();
const framingStore = useFramingStore();

async function setSequenceTarget() {
  console.log('Setting sequence target');

  const name = framingStore.selectedItem.Name;
  const ra = framingStore.RAangle;
  const dec = framingStore.DECangle;
  const rotation = 0;
  const index = 0;

  console.log('Name:', name, 'RA:', ra, 'Dec:', dec);

  if (store.sequenceIsLoaded) {
    try {
      await apiService.sequnceTargetSet(name, ra, dec, rotation, index);
      console.log('Sequence target updated successfully.');
    } catch (error) {
      console.error('Error setting sequence target:', error);
    }
  }
}
</script>
