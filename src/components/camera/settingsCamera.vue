<template>

    <div class="flex items-center gap-2 ">
        <div class="flex flex-col  border border-gray-500  p-1 pb-2 rounded-lg">
            <label for="exposure" class="text-xs mb-1 text-gray-400">{{ $t('components.camera.exposure_time') }}</label>
            <input id="exposure" v-model.number="cameraStore.exposureTime" type="number"
                class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
                placeholder="sek" />
        </div>
        <div class="flex flex-col  border border-gray-500  p-1 pb-2 rounded-lg ">
            <label for="gain" class="text-xs mb-1 text-gray-400">{{ $t('components.camera.gain_iso') }}</label>
            <div v-if="store.cameraInfo.Gains && store.cameraInfo.Gains.length > 0">
                <select id="gain" v-model.number="cameraStore.gain"
                    class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-cyan-700">
                    <option v-for="(value, key) in store.cameraInfo.Gains" :key="key" :value="key">
                        {{ value }}
                    </option>
                </select>
            </div>
            <div v-else>
                <input id="gain" v-model.number="cameraStore.gain" type="number"
                    class="w-28 text-black px-3 h-8 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="1" />
            </div>
        </div>
    </div>
</template>

<script setup>
//import { ref } from 'vue';
import { apiStore } from '@/store/store';
import { useCameraStore } from '@/store/cameraStore';

const store = apiStore();
const cameraStore = useCameraStore();






</script>
