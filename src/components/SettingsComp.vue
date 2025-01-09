<template>
  <div class="p-4 max-w-md mx-auto">
    <div class="bg-gray-800 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-4 text-white">
        {{ $t('components.settings.title') }}
      </h2>
      
      <div class="space-y-4">
        <!-- GPS Coordinates -->
        <div class="bg-gray-700 p-3 rounded-lg">
          <h3 class="text-lg font-medium mb-2 text-gray-300">
            {{ $t('components.settings.coordinates') }}
          </h3>
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-400 mb-1">Latitude</label>
              <input
                v-model="latitude"
                type="text"
                class="w-full px-3 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Latitude"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-400 mb-1">Longitude</label>
              <input
                v-model="longitude"
                type="text"
                class="w-full px-3 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Longitude"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-400 mb-1">Altitude</label>
              <input
                v-model="altitude"
                type="text"
                class="w-full px-3 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Altitude"
              />
            </div>
            <button
              @click="getCurrentLocation"
              class="mt-6 p-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
              title="Get current location"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div v-if="gpsError" class="mt-2 text-sm text-red-400">
            {{ gpsError }}
          </div>
        </div>

        <!-- Connection Settings -->
        <div class="bg-gray-700 p-3 rounded-lg">
          <h3 class="text-lg font-medium mb-2 text-gray-300">
            {{ $t('components.settings.connection') }}
          </h3>
          <div class="space-y-2">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">IP</label>
              <input
                v-model="tempIp"
                type="text"
                class="w-full px-3 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="192.168.x.x"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Port</label>
              <input
                v-model="tempPort"
                type="text"
                class="w-full px-3 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="5000"
              />
            </div>
            <button
              @click="saveConnection"
              class="w-full mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors"
            >
            {{ $t('components.settings.save') }}
            </button>
          </div>
        </div>

        <!-- Language Selection -->
        <div class="bg-gray-700 p-3 rounded-lg">
          <h3 class="text-lg font-medium mb-2 text-gray-300">
            {{ $t('components.settings.language') }}
          </h3>
          <select
            v-model="currentLanguage"
            @change="changeLanguage($event.target.value)"
            class="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          >
            <option 
              v-for="lang in languages" 
              :key="lang.code" 
              :value="lang.code"
              class="bg-gray-700"
            >
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/store/settingsStore';

const { locale } = useI18n();
const settingsStore = useSettingsStore();
const currentLanguage = ref(locale.value);
const latitude = ref('');
const longitude = ref('');
const altitude = ref('');
const ip = ref('');
const port = ref('');
const gpsError = ref(null);
const tempIp = ref('');
const tempPort = ref('');

// Initialize temp values on mount
onMounted(() => {
  const storedConnection = settingsStore.connection;
  if (storedConnection) {
    ip.value = storedConnection.ip;
    port.value = storedConnection.port;
    tempIp.value = storedConnection.ip;
    tempPort.value = storedConnection.port;
  }
});

function saveConnection() {
  settingsStore.setConnection({
    ip: tempIp.value,
    port: tempPort.value
  });
  ip.value = tempIp.value;
  port.value = tempPort.value;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }
];

// Load stored settings on mount
onMounted(() => {
  const storedCoords = settingsStore.coordinates;
  if (storedCoords) {
    latitude.value = storedCoords.latitude;
    longitude.value = storedCoords.longitude;
    altitude.value = storedCoords.altitude || 0;
  }
  
  const storedConnection = settingsStore.connection;
  if (storedConnection) {
    ip.value = storedConnection.ip;
    port.value = storedConnection.port;
  }
});

watchEffect(() => {
  currentLanguage.value = locale.value;
});

function changeLanguage(lang) {
  locale.value = lang;
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    gpsError.value = 'Geolocation is not supported by your browser';
    return;
  }

  gpsError.value = null;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude.toFixed(6);
      longitude.value = position.coords.longitude.toFixed(6);
      altitude.value = position.coords.altitude !== null 
      ? position.coords.altitude.toFixed(3) 
      : 0;
      settingsStore.setCoordinates({
        latitude: latitude.value,
        longitude: longitude.value,
        altitude: altitude.value,
      });
    },
    (error) => {
      gpsError.value = error.message;
    }
  );
}
</script>
