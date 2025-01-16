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
  name = framingStore.selectedItem.Name;
  ra = framingStore.RAangle;
  dec = framingStore.DECangle;
  rotation = 0;
  index = 0;

  if (store.sequenceIsLoaded) {
    try {
      await apiService.setSequenceTarget(name, ra, dec, rotation, index); //name, ra, dec, rotation, index)
      console.log('Sequenz Ziel aktuallisiert');
    } catch (error) {
      console.log('Fehler beim setzen des Sequnzziel');
    }
  }
}
</script>
