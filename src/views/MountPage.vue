<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md landscape:max-w-xl">
      <h5 class="text-xl text-center font-bold text-white mb-4">{{ $t('components.mount.title') }}</h5>
      <infoMount v-model="store.mountInfo.Connected" class="grid grid-cols-2 landscape:grid-cols-3" />
      <infoCamera :show-only-exposing="showTppa" class="grid grid-cols-2 landscape:grid-cols-3 mt-2" />
      <div v-if="store.mountInfo.Connected">
        <div class="mt-4 border border-gray-600 rounded-b-lg bg-gray-800/10">
          <div class="text-sm">
            <button
              class="border-2 border-gray-500 rounded-b-md w-24 h-10"
              :class="{ 'bg-gray-600': showMount, 'bg-gray-800': !showMount }"
              @click="toggleShowMount"
            >
              {{ $t('components.mount.title') }}
            </button>
            <button
              class="border-2 border-gray-500 rounded-b-md w-24 h-10"
              :class="{ 'bg-gray-600': showSlew, 'bg-gray-800': !showSlew }"
              @click="toggleShowSlew"
            >
              {{ $t('components.mount.slew') }}
            </button>
            <button
              class="border-2 border-gray-500 rounded-b-md w-24 h-10"
              :class="{ 'bg-gray-600': showTppa, 'bg-gray-800': !showTppa }"
              @click="toggleShowTppa"
            >
              {{ $t('components.tppa.title') }}
            </button>
          </div>
          <div class="container pl-5 pb-5 pr-5">
            <div v-if="showMount" class="mt-5">
              <controlMount />
            </div>
            <div v-if="showTppa" class="mt-5">
              <TppaPage />
            </div>
            <div v-if="showSlew" class="mt-5">
              <TargetSearch />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TppaPage from '@/components/tppa/TppaPage.vue';
import TargetSearch from '@/components/framing/TargetSearch.vue';
import infoMount from '@/components/mount/infoMount.vue';
import infoCamera from '@/components/camera/infoCamera.vue';
import controlMount from '@/components/mount/controlMount.vue';
import { apiStore } from '@/store/store';

const store = apiStore();
const showTppa = ref(false);
const showSlew = ref(false);
const showMount = ref(true);

function toggleShowMount() {
  showMount.value = !showMount.value;
  if (showMount.value) {
    showSlew.value = false;
    showTppa.value = false;
  }
}

function toggleShowSlew() {
  showSlew.value = !showSlew.value;
  if (showSlew.value) {
    showTppa.value = false;
    showMount.value = false;
  }
}

function toggleShowTppa() {
  showTppa.value = !showTppa.value;
  if (showTppa.value) {
    showSlew.value = false;
    showMount.value = false;
  }
}
</script>

<style scoped></style>
