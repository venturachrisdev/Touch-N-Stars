<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <div v-if="currentStep" class="text-center">
        <h2 class="text-xl font-bold mb-4">{{ currentStep.title }}</h2>
        <p class="mb-6">{{ currentStep.content }}</p>

        <div class="flex justify-between items-center">
          <button v-if="currentStepIndex > 0" @click="previousStep" class="btn btn-secondary">
            Previous
          </button>
          <span v-else></span>

          <button @click="nextStep" class="btn btn-primary">
            {{ isLastStep ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['close']);

const currentStepIndex = ref(0);

const currentStep = computed(() => props.steps[currentStepIndex.value]);
const isLastStep = computed(() => currentStepIndex.value === props.steps.length - 1);

function nextStep() {
  if (isLastStep.value) {
    emit('close');
  } else {
    currentStepIndex.value++;
  }
}

function previousStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
}
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded transition-colors;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white;
}
</style>
