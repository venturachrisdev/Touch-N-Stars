<template>
  <div class="flex items-center space-x-4">
    <button
      @click="updateToggled"
      :class="statusValue ? 'bg-green-500/80 ' : 'bg-gray-500'"
      class="relative inline-flex h-6 w-11 items-center border border-gray-200 rounded-full transition-colors duration-200"
      type="button"
      :aria-pressed="statusValue.toString()"
    >
      <span class="sr-only">Toggle</span>
      <span
        :class="statusValue ? 'translate-x-6' : 'translate-x-1'"
        class="inline-block h-4 w-4 transform bg-gray-800 rounded-full transition-transform duration-200"
      ></span>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// Props definieren
const props = defineProps({
  statusValue: {
    type: Boolean,
    required: true,
  },
});

// Emits für Parent-Kommunikation (falls benötigt)
const emits = defineEmits(['update:statusValue']);

// Methode zum Umschalten des Wertes
function updateToggled() {
  emits('update:statusValue', !props.statusValue);
}
</script>
