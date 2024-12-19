<template>
  <div>
    
    <button
      @click="toggleConnection"
      class="min-w-64 min-h-10 rounded-md text-white font-medium transition-colors"
      :class="isConnected ? 'bg-red-900' : 'bg-cyan-700'"
    >
      {{ isConnected ? disconnectText : connectText }}
    </button>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  isConnected: {
    type: Boolean,
    required: true,
  },
  connectText: {
    type: String,
    default: "Verbinden",
  },
  disconnectText: {
    type: String,
    default: "Trennen",
  },
  onToggle: {
    type: Function,
    required: true,
  },
})

function toggleConnection() {
  props.onToggle()
}
</script>
