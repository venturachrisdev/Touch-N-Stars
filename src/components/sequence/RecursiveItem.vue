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

function removeTriggerSuffix(name) {
  return name.replace(/_Trigger$/, '')
}

function filterTriggerFields(trigger) {
  const excludedKeys = ['Name', 'Status', 'Coordinates']
  return Object.entries(trigger).filter(([key]) => {
    return !excludedKeys.includes(key)
  })
}

</script>

<template>
  <div>
    <div v-for="(item, index) in props.items" :key="index"
      class="border-l border-gray-400 pl-4 mb-2 text-xs md:text-base">
      <!-- Name & Status -->
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-medium ">{{ item.Name }}</h3>
        <span :class="statusColor(item.Status)">
          {{ item.Status }}
        </span>
      </div>

      <!-- Felder -->
      <div class="text-gray-500">
        <div v-if="typeof item.ExposureCount !== 'undefined'">
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
          Dither alle {{ item.DitherTargetExposures }} Aufnahmen
        </div>
        <div v-if="typeof item.Type !== 'undefined'">
          Type: {{ item.Type }}
        </div>
      </div>

      <!-- Triggers anzeigen -->
      <div v-if="item.Triggers && item.Triggers.length" class="pl-4 mt-2 ">
        <h4 class="font-semibold mb-1 text-sm md:text-base">Triggers:</h4>
        <div v-for="(trigger, tIndex) in item.Triggers" :key="tIndex">
          <div class="border-l border-gray-300 pl-2">
            <div class="flex items-center justify-between mb-1 pl-2">
              <!-- Trigger-Name -->
              <span>{{ removeTriggerSuffix(trigger.Name) }}</span>



              <!-- Trigger-Status -->
              <span :class="statusColor(trigger.Status)">
                {{ trigger.Status }}
              </span>
            </div>
            <div class="flex flex-col  justify-between ml-4 mb-1 border-l border-gray-300 pl-2">
              <!-- Unbekannte (dynamische) Felder -->
              <div v-for="[key, value] in filterTriggerFields(trigger)" :key="key" class="text-xs text-gray-600 ">
                <!-- key zeigt den Feldnamen an, value den Inhalt -->
                <span>{{ key }}: {{ value }} </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rekursion bei verschachtelten Items -->
      <div v-if="item.Items && item.Items.length" class="pl-4 mt-2">
        <RecursiveItem :items="item.Items" />
      </div>
    </div>
  </div>
</template>
