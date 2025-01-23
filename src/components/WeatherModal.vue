<template>
  <div
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
    @click.self="handleOutsideClick"
  >
    <div
      class="bg-gray-800/95 rounded-xl p-8 max-w-md w-full mx-4 relative shadow-2xl transform transition-all duration-300 ease-out"
      :class="{ 'scale-95 opacity-0': !isMounted, 'scale-100 opacity-100': isMounted }"
      @click.stop
    >
      <div class="flex justify-between items-center mb-8 pb-6 border-b border-gray-700/50">
        <h2 class="text-2xl font-bold text-gray-100 tracking-tight">Weather Information</h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 transform hover:rotate-90 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
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

      <div
        class="space-y-6 overflow-y-auto max-h-[70vh] pr-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800/50"
      >
        <!-- Temperature -->
        <div
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Temperature</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ weatherInfo.Temperature.toFixed(1) }}°C</p>
        </div>

        <!-- Cloud Cover -->
        <div
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"
              />
            </svg>
            <span>Cloud Cover</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ weatherInfo.CloudCover }}%</p>
        </div>

        <!-- Wind -->
        <div
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Wind</span>
          </h3>
          <p class="text-gray-300 pl-7">
            {{ weatherInfo.WindSpeed }} m/s at {{ weatherInfo.WindDirection }}°
          </p>
        </div>

        <!-- Humidity -->
        <div
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Humidity</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ weatherInfo.Humidity }}%</p>
        </div>

        <!-- Pressure -->
        <div
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 011 1v3a1 1 0 11-2 0V9a1 1 0 011-1zM8 8a1 1 0 011 1v3a1 1 0 11-2 0V9a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Pressure</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ weatherInfo.Pressure }} hPa</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const { weatherInfo } = defineProps({
  weatherInfo: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

function handleOutsideClick(event) {
  emit('close');
  if (event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});
</script>

<style scoped>
/* Mobile optimization */
@media (max-width: 640px) {
  .max-w-md {
    margin: 1rem;
    padding: 1.5rem;
  }
}

/* Smooth scroll behavior */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #4a5568;
  border-radius: 20px;
}
</style>
