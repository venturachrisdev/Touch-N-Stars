<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 relative shadow-2xl" @click.stop>
      <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h2 class="text-xl font-semibold text-gray-100">About Touch-N-Stars</h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-700/50 rounded-full transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
        <div class="bg-gray-700/20 p-4 rounded-lg">
          <h3 class="font-medium text-gray-100 mb-2">Version</h3>
          <p class="text-gray-300">{{ version }}</p>
        </div>

        <div class="bg-gray-700/20 p-4 rounded-lg">
          <h3 class="font-medium text-gray-100 mb-2">Copyright</h3>
          <p class="text-gray-300">© 2025 Touch-N-Stars</p>
        </div>

        <div class="bg-gray-700/20 p-4 rounded-lg">
          <h3 class="font-medium text-gray-100 mb-2">Application Overview</h3>
          <p class="text-gray-300 leading-relaxed">
            Nina astro control plugin for managing astronomical equipment and sequences.
          </p>
        </div>

        <div class="bg-gray-700/20 p-4 rounded-lg">
          <h3 class="font-medium text-gray-100 mb-2">GitHub Repository</h3>
          <a
            href="https://github.com/Touch-N-Stars/Touch-N-Stars"
            target="_blank"
            class="text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            https://github.com/Touch-N-Stars/Touch-N-Stars
          </a>
        </div>

        <div class="bg-gray-700/20 p-4 rounded-lg">
          <h3 class="font-medium text-gray-100 mb-2">Used Modules</h3>
          <ul class="text-gray-300 list-disc list-inside space-y-1">
            <li class="hover:text-gray-100 transition-colors duration-200">Vue.js</li>
            <li class="hover:text-gray-100 transition-colors duration-200">Tailwind CSS</li>
            <li class="hover:text-gray-100 transition-colors duration-200">NINA Advanced API</li>
            <li class="hover:text-gray-100 transition-colors duration-200">WebSocket</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  version: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);
</script>

<style scoped>
/* Mobile optimization */
@media (max-width: 640px) {
  .max-w-md {
    margin: 1rem;
  }
}
</style>
