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
    default: return 'text-black'
  }
}
</script>

<template>
  <div>
    <div
      v-for="(item, index) in props.items"
      :key="index"
      class="border-l border-gray-200 pl-4 mb-2"
    >
      <!-- Hier geht's weiter ... -->
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-medium">{{ item.Name }}</h3>
        <span :class="statusColor(item.Status)">
          {{ item.Status }}
        </span>
      </div>
      
      <!-- Beispiel-Felder -->
      <div class="text-sm text-gray-600" v-if="typeof item.ExposureCount !== 'undefined'">
        ExposureCount: {{ item.ExposureCount }}
      </div>
      <div class="text-sm text-gray-600" v-if="typeof item.ExposureTime !== 'undefined'">
        Belichtungszeit: {{ item.ExposureTime }}s
      </div>

      <!-- Rekursion bei verschachtelten Items -->
      <div v-if="item.Items && item.Items.length" class="pl-4 mt-2">
        <RecursiveItem :items="item.Items" />
      </div>
    </div>
  </div>
</template>
