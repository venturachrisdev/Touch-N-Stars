<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

function statusColor(status) {
  switch (status) {
    case 'FINISHED': return 'text-green-600'
    case 'RUNNING': return 'text-blue-600'
    case 'CREATED': return 'text-yellow-500'
    case 'SKIPPED': return 'text-gray-400'
    default: return 'text-white'
  }
}
</script>

<template>
  <div>
    <div v-for="(item, index) in props.items" :key="index"
      class="border-l border-gray-400 pl-4 mb-2 text-xs md:text-base">
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-medium ">{{ item.Name }}</h3>
        <span :class="statusColor(item.Status)">
          {{ item.Status }}
        </span>
      </div>

      <!-- Felder -->
      <div class="text-x md:text-base text-gray-500">
        <div class=" " v-if="typeof item.ExposureCount !== 'undefined'">
          Belichtungen: {{ item.ExposureCount }} von {{ item.Iterations }}
        </div>
        <div v-if="typeof item.ExposureTime !== 'undefined'">
          Belichtungszeit: {{ item.ExposureTime }}s
        </div>
        <div v-if="typeof item.Gain !== 'undefined'">
          Gain: {{ item.Gain }}
        </div>
        <div v-if="typeof item.Filter !== 'undefined'">
          Filter: {{ item.Filter }}
        </div>
        <div v-if="typeof item.DitherTargetExposures !== 'undefined' && item.DitherTargetExposures !== 0">
          Dither alle {{ item.DitherTargetExposures }} Aufnamen
        </div>
        <div v-if="typeof item.Type !== 'undefined'">
          Type: {{ item.Type }}
        </div>
      </div>

      <!-- Rekursion bei verschachtelten Items -->
      <div v-if="item.Items && item.Items.length" class="pl-4 mt-2">
        <RecursiveItem :items="item.Items" />
      </div>
    </div>
  </div>
</template>
