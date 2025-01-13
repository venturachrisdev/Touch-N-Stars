<template>
  <div class="flex gap-x-2">
    <button @click="openShutter" class="default-button-cyan">
      {{ $t('components.dome.control.open') }}
    </button>
    <button @click="closeShutter" class="default-button-cyan">
      {{ $t('components.dome.control.close') }}
    </button>
    <button @click="stopShutter" class="default-button-red">
      {{ $t('components.dome.control.stop') }}
    </button>
  </div>
</template>

<script setup>
import apiService from '@/services/apiService';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

async function openShutter() {
  try {
    await apiService.domeAction('open');
    console.log(t('components.dome.control.open'));
  } catch (error) {
    console.log(t('components.dome.control.errors.open'));
  }
}

async function closeShutter() {
  try {
    await apiService.domeAction('close');
    console.log(t('components.dome.control.close'));
  } catch (error) {
    console.log(t('components.dome.control.errors.close'));
  }
}
async function stopShutter() {
  try {
    await apiService.domeAction('stop');
    console.log(t('components.dome.control.stop'));
  } catch (error) {
    console.log(t('components.dome.control.errors.stop'));
  }
}
</script>
