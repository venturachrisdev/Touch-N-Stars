<template>
  <div class="flex flex-col items-center justify-center max-w-md mx-auto">
    <div
      class="flex-col w-full space-y-2 mt-4 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg p-5"
    >
      <strong> {{ $t('components.switch.gauges') }}</strong>
      <InfoSwitch />
    </div>
    <div
      class="flex-col w-full space-y-2 mt-4 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg p-5"
    >
      <strong>{{ $t('components.switch.switch') }}</strong>
      <ControlSwitch />
    </div>
  </div>
</template>
<script setup>
import ControlSwitch from '@/components/switch/ControlSwitch.vue';
import InfoSwitch from '@/components/switch/InfoSwitch.vue';
</script>
