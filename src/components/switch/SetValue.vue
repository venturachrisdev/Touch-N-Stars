<template>
  <input
    @blur="emitValue"
    v-model.number="localValue"
    type="number"
    class="text-black px-4 h-10 w-40 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
    placeholder="1"
    step="1"
    :min="props.min"
    :max="props.max"
  />
</template>
<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['blur']); // Event deklarieren
const props = defineProps({
  storeValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
});
const localValue = ref(0);

// Funktion zum Emitten des Werts
function emitValue() {
  emit('blur', localValue.value); // Sende den Wert zurück an die Eltern-Komponente
}

onMounted(() => {
  localValue.value = props.storeValue;
});
</script>
