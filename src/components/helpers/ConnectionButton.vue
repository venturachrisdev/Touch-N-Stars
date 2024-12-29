<template>
  <div>
    <button
      @click="handleClick"
      class="min-w-64 min-h-10 rounded-md text-white font-medium transition-colors flex items-center justify-center"
      :class="isLoading ? 'bg-cyan-900' : (isConnected ? 'bg-red-900' : 'bg-cyan-700')"
      :disabled="isLoading"
    >
      <div v-if="isLoading" class="flex items-center">
        <svg
          class="w-6 h-6 animate-spin text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
      <span v-else>
        {{ isConnected ? disconnectText : connectText }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { defineProps } from 'vue';

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
});

// State to track loading
const isLoading = ref(false);

async function handleClick() {
  isLoading.value = true; // Show spinner
  await props.onToggle(); // Call the toggle function
  setTimeout(() => {
    isLoading.value = false;
    }, 800);

}
</script>
