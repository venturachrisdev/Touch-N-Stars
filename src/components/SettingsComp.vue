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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
          <div v-if="gpsError" class="mt-2 text-sm text-red-400">
            {{ gpsError }}
          </div>
          <button
            @click="saveCoordinates"
            class="w-full mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors"
          >
            {{ $t('components.settings.save') }}
          </button>
        </div>

        <!-- Connection Settings -->
        <div class="bg-gray-700 p-3 rounded-lg">
          <h3 class="text-lg font-medium mb-2 text-gray-300">
            {{ $t('components.settings.connection') }}
          </h3>

          <!-- Instance List -->
          <div class="mb-4">
            <div
              v-for="instance in instances"
              :key="instance.id"
              class="bg-gray-600 p-2 rounded mb-2"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">{{ instance.name }}</div>
                  <div class="text-sm text-gray-400">{{ instance.ip }}:{{ instance.port }}</div>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="selectInstance(instance)"
                    :class="[
                      'p-1 transition-colors',
                      selectedInstance === instance.id
                        ? 'text-green-500'
                        : 'text-gray-300 hover:text-green-500',
                    ]"
                    title="Select Instance"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    @click="editInstance(instance.id)"
                    class="p-1 text-gray-300 hover:text-cyan-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="removeInstance(instance.id)"
                    class="p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
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
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Add/Edit Instance Form -->
          <div class="space-y-2">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input
                v-model="tempInstance.name"
                type="text"
                class="w-full px-3 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Instance Name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">IP</label>
              <input
                v-model="tempInstance.ip"
                type="text"
                class="w-full px-3 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="192.168.x.x"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Port</label>
              <input
                v-model="tempInstance.port"
                type="text"
                class="w-full px-3 py-2 bg-gray-600 text-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="5000"
              />
            </div>
            <button
              @click="saveInstance"
              class="w-full mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors"
            >
              {{
                editingInstance ? $t('components.settings.update') : $t('components.settings.add')
              }}
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
import { ref, watchEffect, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { apiStore } from '@/store/store';

const { locale } = useI18n();
const settingsStore = useSettingsStore();
const store = apiStore();
const currentLanguage = ref(locale.value);
const latitude = ref('');
const longitude = ref('');
const altitude = ref('');
const gpsError = ref(null);

// Instance management
const instances = computed(() => settingsStore.connection.instances);
const editingInstance = ref(null);
const selectedInstance = ref(settingsStore.selectedInstanceId);

// Sync selected instance with store
watch(selectedInstance, (newId) => {
  settingsStore.setSelectedInstanceId(newId);
});
const tempInstance = ref({
  name: '',
  ip: '',
  port: '',
});

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
];

// Load stored settings on mount
onMounted(() => {
  const storedCoords = settingsStore.coordinates;
  if (storedCoords) {
    latitude.value = storedCoords.latitude;
    longitude.value = storedCoords.longitude;
    altitude.value = storedCoords.altitude || 0;
  }
});

watchEffect(() => {
  currentLanguage.value = locale.value;
});

// Load coordinates when backend is reachable
watch(
  () => store.isBackendReachable,
  async (newValue) => {
    if (newValue) {
      try {
        await store.fetchProfilInfos();
        latitude.value = store.profileInfo.AstrometrySettings.Latitude;
        longitude.value = store.profileInfo.AstrometrySettings.Longitude;
        altitude.value = store.profileInfo.AstrometrySettings.Elevation;
        settingsStore.setCoordinates({
          latitude: latitude.value,
          longitude: longitude.value,
          altitude: altitude.value,
        });
      } catch (error) {
        console.log('Error loading coordinates');
      }
    }
  }
);

function changeLanguage(lang) {
  locale.value = lang;
}

// Instance management methods
function saveInstance() {
  if (!tempInstance.value.name || !tempInstance.value.ip || !tempInstance.value.port) {
    return;
  }

  if (editingInstance.value) {
    // Update existing instance
    settingsStore.updateInstance(editingInstance.value, tempInstance.value);
  } else {
    // Add new instance
    settingsStore.addInstance({
      id: Date.now().toString(),
      ...tempInstance.value,
    });
  }

  // Reset form
  tempInstance.value = { name: '', ip: '', port: '' };
  editingInstance.value = null;
}

function editInstance(id) {
  const instance = instances.value.find((i) => i.id === id);
  if (instance) {
    tempInstance.value = { ...instance };
    editingInstance.value = id;
  }
}

function selectInstance(instance) {
  selectedInstance.value = instance.id;
  settingsStore.setConnection({
    ip: instance.ip,
    port: instance.port,
  });
  settingsStore.setSelectedInstanceId(instance.id);
}

function removeInstance(id) {
  settingsStore.removeInstance(id);
}

async function getCurrentLocation() {
  if (!window.__TAURI__) {
    gpsError.value = 'GPS only available in Tauri Android builds';
    return;
  }

  try {
    const { checkPermissions, requestPermissions, getCurrentPosition } = await import(
      '@tauri-apps/plugin-geolocation'
    );

    // Check and request permissions if needed
    let permissions = await checkPermissions();
    if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
      permissions = await requestPermissions(['location']);
    }

    if (permissions.location === 'granted') {
      const pos = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      latitude.value = pos.coords.latitude.toFixed(6);
      longitude.value = pos.coords.longitude.toFixed(6);
      altitude.value = pos.coords.altitude?.toFixed(3) || 0;

      settingsStore.setCoordinates({
        latitude: latitude.value,
        longitude: longitude.value,
        altitude: altitude.value,
      });

      // Update backend coordinates if connected
      if (store.isBackendReachable) {
        try {
          await store.updateCoordinates({
            latitude: latitude.value,
            longitude: longitude.value,
            altitude: altitude.value,
          });
        } catch (error) {
          console.error('Failed to update backend coordinates:', error);
        }
      }

      gpsError.value = null;
    } else {
      gpsError.value = 'Location permission not granted';
    }
  } catch (error) {
    gpsError.value = error.message || 'Failed to get GPS location';
  }
}
</script>
