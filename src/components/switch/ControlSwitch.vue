<template>
  <div v-for="WritableSwitche in store.switchInfo.WritableSwitches">
    <div v-if="WritableSwitche.Maximum === 1.0">
      {{ WritableSwitche.Name }}
      <toggleButton @click="setBool(WritableSwitche.Id,WritableSwitche.Value)" :status-value="WritableSwitche.TargetValue === 1" />
    </div>
  </div>
</template>
<script setup>
import { apiStore } from '@/store/store';
import apiService from '@/services/apiService';
import toggleButton from '@/components/helpers/toggleButton.vue';

const store = apiStore();

async function setBool(id, value) {
  try {
    //console.log('id: ', id, 'value: ', value)
    if (value === 1.0) {
      await apiService.setSwitch(id, 0);
      console.log('Switch on: ', id);
    } else {
      await apiService.setSwitch(id, 1);
      console.log('Switch off: ', id);
    }
  } catch (error) {
    console.log('Feher beim setzen des Switches ');
  }
}
</script>
