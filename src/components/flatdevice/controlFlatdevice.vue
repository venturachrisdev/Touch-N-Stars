<template>
  <div class="flex flex-col gap-y-1 w-full">
    <div v-if="store.flatdeviceInfo.SupportsOnOff">
      <div class="flex min-w-36 w-full border border-gray-500 p-2 rounded-lg">
        <label for="toggle_light" class="text-gray-400"
          >{{ $t('components.flat.toggle_light') }}
        </label>
        <div class="flex space-x-2 justify-center ml-auto">
          <toggleButton @click="flatdeviceSetLight" :status-value="store.flatdeviceInfo.LightOn" />
        </div>
      </div>
    </div>

    <div v-if="store.flatdeviceInfo.SupportsOpenClose">
      <div class="flex min-w-36 w-full border border-gray-500 p-2 rounded-lg">
        <label for="toggle_cover" class="text-gray-400"
          >{{ $t('components.flat.toggle_cover') }}
        </label>
        <div class="flex space-x-2 justify-center ml-auto">
          <toggleButton
            @click="flatdeviceSetCover"
            :status-value="store.flatdeviceInfo.CoverState === 3"
          />
        </div>
      </div>
    </div>

    <div
      v-if="store.flatdeviceInfo.LightOn"
      class="flex min-w-36 w-full border border-gray-500 p-1 rounded-lg items-center"
    >
      <label for="SetBrightness" class="text mr-1 text-gray-400"
        >{{ $t('components.flat.brightness') }}
      </label>
      <input
        id="SetBrightness"
        v-model="flatStore.brightness"
        type="number"
        class="w-28 text-black ml-auto px-3 h-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
        placeholder="1"
        step="1"
        @blur="SetBrightness"
      />
    </div>
  </div>
</template>

<script setup>
import apiService from '@/services/apiService';
import { apiStore } from '@/store/store';
import { useFlatStore } from '@/store/flatdeviceStore';
import toggleButton from '@/components/helpers/toggleButton.vue';

const store = apiStore();
const flatStore = useFlatStore();

async function flatdeviceSetLight() {
  try {
    if (store.flatdeviceInfo.LightOn) {
      await apiService.flatdeviceSetLight(false);
      console.log('Flat Licht aus');
    } else {
      flatStore.brightness = 100;
      await apiService.flatdeviceSetLight(true);
      console.log('Flat Licht ein');
    }
  } catch (error) {
    console.log('Fehler beim steuern des Flatlichts');
  }
}

async function flatdeviceSetCover() {
  try {
    if (store.flatdeviceInfo.CoverState === 2) {
      await apiService.flatdeviceSetCover(false);
      console.log('Flat cover auf');
    } else {
      await apiService.flatdeviceSetCover(true);
      console.log('Flat cover zu');
    }
  } catch (error) {
    console.log('Feher beim steuern des Flatcover ');
  }
}

async function SetBrightness() {
  try {
    if (store.flatdeviceInfo.LightOn) {
      if (store.flatdeviceInfo.MinBrightness > flatStore.brightness) {
        flatStore.brightness = store.flatdeviceInfo.MinBrightness;
      } else if (store.flatdeviceInfo.MaxBrightness < flatStore.brightness) {
        flatStore.brightness = store.flatdeviceInfo.MaxBrightness;
      }
      await apiService.flatdeviceSetBrightness(flatStore.brightness);
      console.log('Helligkeit gesetzt');
    }
  } catch (error) {
    console.log('Feher beim steuern des Flatcover ');
  }
}
</script>
