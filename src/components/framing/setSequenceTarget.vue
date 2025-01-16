<template>
          <button @click="slew" class="default-button-cyan">
            {{ $t('components.slewAndCenter.slew') }}
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
  if (store.sequenceIsLoaded) {
    try {
      await apiService.setSequenceTarget('unpark'); //name, ra, dec, rotation, index)
      console.log('Sequenz Ziel aktuallisiert');
    } catch (error) {
      console.log('Fehler beim setzen des Sequnzziel');
    }
  }
}


</script>