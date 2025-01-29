<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

function statusColor(status) {
  switch (status) {
    case 'FINISHED':
      return 'text-green-600';
    case 'RUNNING':
      return 'text-blue-600';
    case 'CREATED':
      return 'text-yellow-500';
    case 'SKIPPED':
      return 'text-gray-400';
    default:
      return 'text-gray-200';
  }
}

function removeSuffix(name) {
  return name.replace(/_Trigger$|_Container$/, '');
}

function filterFields(trigger) {
  const excludedKeys = [
    'Name',
    'Status',
    'Coordinates',
    'Binning',
    'Conditions',
    'Triggers',
    'Items',
  ];
  return Object.entries(trigger).filter(([key]) => !excludedKeys.includes(key));
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(item, index) in props.items"
      :key="index"
      class="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 transition-all hover:border-gray-500"
    >
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-600">
        <h3 class="font-semibold text-gray-200 text-sm md:text-base">
          {{ removeSuffix(item.Name) }}
        </h3>
        <span :class="statusColor(item.Status)" class="font-medium text-sm">
          {{ item.Status }}
        </span>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
        <div v-if="typeof item.ExposureCount !== 'undefined'" class="flex gap-2">
          <span class="text-gray-400">{{ $t('components.sequence.exposures') }}:</span>
          <span class="text-gray-200">{{ item.ExposureCount }} / {{ item.Iterations }}</span>
        </div>
        <div v-if="typeof item.ExposureTime !== 'undefined'" class="flex gap-2">
          <span class="text-gray-400">{{ $t('components.sequence.exposureTime') }}:</span>
          <span class="text-gray-200">{{ item.ExposureTime }}s</span>
        </div>
        <div v-if="typeof item.Gain !== 'undefined'" class="flex gap-2">
          <span class="text-gray-400">{{ $t('components.sequence.details.gain') }}:</span>
          <span class="text-gray-200">{{ item.Gain }}</span>
        </div>
        <div v-if="typeof item.Filter !== 'undefined'" class="flex gap-2">
          <span class="text-gray-400">{{ $t('components.sequence.filter') }}:</span>
          <span class="text-gray-200">{{ item.Filter }}</span>
        </div>
        <div
          v-if="item.DitherTargetExposures && item.DitherTargetExposures !== 0"
          class="flex gap-2"
        >
          <span class="text-gray-400">{{ $t('components.sequence.ditherEvery') }}:</span>
          <span class="text-gray-200">{{ item.DitherTargetExposures }}</span>
        </div>
        <div v-if="typeof item.Type !== 'undefined'" class="flex gap-2">
          <span class="text-gray-400">{{ $t('components.sequence.type') }}:</span>
          <span class="text-gray-200">{{ item.Type }}</span>
        </div>
        <div v-if="typeof item.DeltaHFR !== 'undefined'" class="flex gap-2">
          <span class="text-gray-400">{{ $t('components.sequence.deltaHFR') }}:</span>
          <span class="text-gray-200">{{ item.DeltaHFR }}</span>
        </div>
        <div v-if="typeof item.SampleSize !== 'undefined'" class="flex gap-2">
          <span class="text-gray-400">{{ $t('components.sequence.sampleSize') }}:</span>
          <span class="text-gray-200">{{ item.SampleSize }}</span>
        </div>
      </div>

      <!-- Nested Items -->
      <div v-if="item.Items && item.Items.length" class="ml-4 space-y-3">
        <RecursiveItem :items="item.Items" />
      </div>

      <!-- Triggers Section -->
      <div v-if="item.Triggers && item.Triggers.length" class="mt-4">
        <h4 class="text-sm font-semibold text-gray-300 mb-2">
          {{ $t('components.sequence.triggers') }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="(trigger, tIndex) in item.Triggers"
            :key="tIndex"
            class="bg-gray-700 rounded p-3 border border-gray-600"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-200">
                {{ removeSuffix(trigger.Name) }}
              </span>
              <span :class="statusColor(trigger.Status)" class="text-sm">
                {{ trigger.Status }}
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div v-for="[key, value] in filterFields(trigger)" :key="key" class="flex gap-1">
                <span class="text-gray-400">{{ key }}:</span>
                <span class="text-gray-200">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
