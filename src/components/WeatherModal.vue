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
        <div>
          <h2 class="text-2xl font-bold text-gray-100 tracking-tight">
            {{ $t('components.weatherModal.weatherInformation') }}
          </h2>
          <p class="text-sm text-gray-400 mt-1">{{ weatherInfo.DisplayName }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <button
            @click="toggleUnits"
            class="text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
          >
            {{
              settingsStore.useImperialUnits
                ? $t('components.weatherModal.metric')
                : $t('components.weatherModal.imperial')
            }}
          </button>
        </div>
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
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
            <span>{{ $t('components.weatherModal.temperature') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ temperature }} {{ temperatureUnit }}</p>
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
            <span>{{ $t('components.weatherModal.cloudCover') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ cloudCover }}</p>
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
            <span>{{ $t('components.weatherModal.wind') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">
            {{ windSpeed }} {{ windSpeedUnit }}
            {{ windDirection !== 'N/A' ? `(${windDirection})` : '' }}
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
            <span>{{ $t('components.weatherModal.humidity') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ humidity }}</p>
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
            <span>{{ $t('components.weatherModal.pressure') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ pressure }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSettingsStore } from '@/store/settingsStore';

const { weatherInfo } = defineProps({
  weatherInfo: {
    type: Object,
    required: true,
  },
});

const settingsStore = useSettingsStore();

const temperature = computed(() => {
  if (isNaN(weatherInfo.Temperature)) {
    return 'N/A';
  }
  return settingsStore.useImperialUnits
    ? ((weatherInfo.Temperature * 9) / 5 + 32).toFixed(1)
    : weatherInfo.Temperature.toFixed(1);
});

const temperatureUnit = computed(() => {
  return isNaN(weatherInfo.Temperature) ? '' : settingsStore.useImperialUnits ? '°F' : '°C';
});

const windSpeed = computed(() => {
  if (isNaN(weatherInfo.WindSpeed)) {
    return 'N/A';
  }
  return settingsStore.useImperialUnits
    ? (weatherInfo.WindSpeed * 2.23694).toFixed(1)
    : weatherInfo.WindSpeed.toFixed(1);
});

const windDirection = computed(() => {
  if (isNaN(weatherInfo.WindDirection)) {
    return 'N/A';
  }
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round((weatherInfo.WindDirection % 360) / 22.5);
  return directions[index % 16];
});

const windSpeedUnit = computed(() => {
  return isNaN(weatherInfo.WindSpeed) ? '' : settingsStore.useImperialUnits ? 'mph' : 'km/h';
});

const cloudCover = computed(() => {
  return isNaN(weatherInfo.CloudCover) ? 'N/A' : `${weatherInfo.CloudCover}%`;
});

const humidity = computed(() => {
  return isNaN(weatherInfo.Humidity) ? 'N/A' : `${weatherInfo.Humidity}%`;
});

const pressure = computed(() => {
  return isNaN(weatherInfo.Pressure) ? 'N/A' : `${weatherInfo.Pressure} hPa`;
});

function toggleUnits() {
  settingsStore.toggleUnits();
}

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
