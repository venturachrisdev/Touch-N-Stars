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
          class="p-2 hover:bg-gray-700/50 rounded-full transition-all duration-200"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 transform hover:rotate-90 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-6 overflow-y-auto max-h-[70vh] pr-3 scrollbar-thin">
        <!-- Temperature -->
        <div
          v-if="!isNaN(weatherInfo.Temperature)"
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="size-6">
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
          v-if="!isNaN(weatherInfo.CloudCover)"
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
          v-if="!isNaN(weatherInfo.WindSpeed) || !isNaN(weatherInfo.WindDirection)"
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
                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z"
              />
            </svg>
            <span>{{ $t('components.weatherModal.wind') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">
            {{ windSpeed }} {{ windSpeedUnit }}
            {{ !isNaN(weatherInfo.WindDirection) ? `(${windDirection})` : '' }}
          </p>
        </div>

        <!-- Humidity -->
        <div
          v-if="!isNaN(weatherInfo.Humidity)"
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
              />
            </svg>
            <span>{{ $t('components.weatherModal.humidity') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ humidity }}</p>
        </div>

        <!-- Pressure -->
        <div
          v-if="!isNaN(weatherInfo.Pressure)"
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
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3z"
              />
            </svg>
            <span>{{ $t('components.weatherModal.pressure') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ pressure }}</p>
        </div>

        <!-- Dew Point -->
        <div
          v-if="!isNaN(weatherInfo.DewPoint)"
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
                d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0V2.75z"
              />
            </svg>
            <span>{{ $t('components.weatherModal.dewPoint') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ dewPoint }} {{ dewPointUnit }}</p>
        </div>

        <!-- Rain Rate -->
        <div
          v-if="!isNaN(Number(weatherInfo.RainRate))"
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <span>{{ $t('components.weatherModal.rainRate') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ rainRate }}</p>
        </div>

        <!-- Sky Quality -->
        <div
          v-if="!isNaN(Number(weatherInfo.SkyQuality))"
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
            <span>{{ $t('components.weatherModal.skyQuality') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ skyQuality }}</p>
        </div>

        <!-- Sky Temperature -->
        <div
          v-if="!isNaN(Number(weatherInfo.SkyTemperature))"
          class="bg-gray-700/20 p-5 rounded-xl hover:bg-gray-700/30 transition-colors duration-200"
        >
          <h3 class="font-semibold text-gray-100 mb-3 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
              />
            </svg>
            <span>{{ $t('components.weatherModal.skyTemperature') }}</span>
          </h3>
          <p class="text-gray-300 pl-7">{{ skyTemperature }} {{ skyTemperatureUnit }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSettingsStore } from '@/store/settingsStore';

const props = defineProps({
  weatherInfo: {
    type: Object,
    required: true,
  },
});

const settingsStore = useSettingsStore();

const temperature = computed(() => {
  if (isNaN(props.weatherInfo.Temperature)) {
    return 'N/A';
  }
  return settingsStore.useImperialUnits
    ? ((props.weatherInfo.Temperature * 9) / 5 + 32).toFixed(1)
    : props.weatherInfo.Temperature.toFixed(1);
});

const temperatureUnit = computed(() => {
  return settingsStore.useImperialUnits ? '°F' : '°C';
});

const windSpeed = computed(() => {
  if (isNaN(props.weatherInfo.WindSpeed)) {
    return 'N/A';
  }
  return settingsStore.useImperialUnits
    ? (props.weatherInfo.WindSpeed * 2.23694).toFixed(1)
    : props.weatherInfo.WindSpeed.toFixed(1);
});

const windDirection = computed(() => {
  if (isNaN(props.weatherInfo.WindDirection)) {
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
  const index = Math.round((props.weatherInfo.WindDirection % 360) / 22.5);
  return directions[index % 16];
});

const windSpeedUnit = computed(() => {
  return settingsStore.useImperialUnits ? 'mph' : 'km/h';
});

const cloudCover = computed(() => {
  return isNaN(props.weatherInfo.CloudCover) ? 'N/A' : `${props.weatherInfo.CloudCover}%`;
});

const humidity = computed(() => {
  return isNaN(props.weatherInfo.Humidity) ? 'N/A' : `${props.weatherInfo.Humidity}%`;
});

const pressure = computed(() => {
  return isNaN(props.weatherInfo.Pressure) ? 'N/A' : `${props.weatherInfo.Pressure} hPa`;
});

const dewPoint = computed(() => {
  if (isNaN(props.weatherInfo.DewPoint)) {
    return 'N/A';
  }
  return settingsStore.useImperialUnits
    ? ((props.weatherInfo.DewPoint * 9) / 5 + 32).toFixed(1)
    : props.weatherInfo.DewPoint.toFixed(1);
});

const dewPointUnit = computed(() => {
  return settingsStore.useImperialUnits ? '°F' : '°C';
});

const rainRate = computed(() => {
  const rate = Number(props.weatherInfo.RainRate);
  return isNaN(rate) ? 'N/A' : `${rate} mm/h`;
});

const skyQuality = computed(() => {
  const quality = Number(props.weatherInfo.SkyQuality);
  return isNaN(quality) ? 'N/A' : `${quality} mag/arcsec²`;
});

const skyTemperature = computed(() => {
  const temp = Number(props.weatherInfo.SkyTemperature);
  if (isNaN(temp)) {
    return 'N/A';
  }
  return settingsStore.useImperialUnits ? ((temp * 9) / 5 + 32).toFixed(1) : temp.toFixed(1);
});

const skyTemperatureUnit = computed(() => {
  return settingsStore.useImperialUnits ? '°F' : '°C';
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

/* Transition classes */
.scale-95 {
  transform: scale(0.95);
}

.scale-100 {
  transform: scale(1);
}

.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}

/* Card hover effects */
.bg-gray-700\/20:hover {
  background-color: rgba(55, 65, 81, 0.3);
}

/* Ensure SVG icons are properly sized */
.size-6 {
  width: 1.5rem;
  height: 1.5rem;
}

.h-5.w-5 {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
