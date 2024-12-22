<template>

    <div class="flex items-center gap-2">
        <div class="flex flex-col  border border-gray-500  p-1 pb-2 rounded-lg">
            <label for="exposure" class="text-xs mb-1 text-gray-400">Belichtungszeit:</label>
            <input id="exposure" v-model.number="store.exposureTime" type="number"
                class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
                placeholder="sek" />
        </div>
        <div class="flex flex-col  border border-gray-500  p-1 pb-2 rounded-lg ">
            <label for="gain" class="text-xs mb-1 text-gray-400">Gain / Iso:</label>
            <div v-if="store.cameraInfo.Gains && store.cameraInfo.Gains.length > 0">
                <select id="gain" v-model.number="store.gain"
                    class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-cyan-700">
                    <option v-for="(value, key) in store.cameraInfo.Gains" :key="key" :value="key">
                        {{ value }}
                    </option>
                </select>
            </div>
            <div v-else>
                <input id="gain" v-model.number="store.gain" type="number"
                    class="w-28 text-black px-3 h-8 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="1" />
            </div>

        </div>
        <div v-if="store.cameraInfo.CanSetTemperature">
                <div class="flex flex-col min-w-44 border border-gray-500 p-1 pb-2 rounded-lg">
                    <label for="TemperatureSetPoint" class="text-xs mb-1 text-gray-400">Kühler </label>
                    <div class="flex space-x-2">
                        <input id="TemperatureSetPoint" v-model="TemperatureSetPoint" type="number"
                            class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
                            placeholder="1" step="1" />
                        <toggleButton @click="toggloCooling" :status-value="store.cameraInfo.CoolerOn" />
                    </div>
                </div>
            </div>
        </div>
</template>

<script setup>
import { ref } from 'vue';
import { apiStore } from '@/store/store';
import apiService from '@/services/apiService';
import toggleButton from './toggleButton.vue';

const store = apiStore();

let TemperatureSetPoint = ref(store.cameraInfo?.TemperatureSetPoint || 0);


function toggloCooling() {
    if (store.cameraInfo.CoolerOn) {
        stoppCooling();
        console.log("stopp")
    } else {
        startCooling();
        console.log("startg")
    }
}

async function startCooling() {
    try {
        const data = apiService.startCooling(TemperatureSetPoint.value);
        console.log("Antwort:", data);
        console.log("SollTemp:", TemperatureSetPoint.value);
    } catch (error) {
        console.log("Fehler:", error);
    }
}
async function stoppCooling() {
    try {
        const data = apiService.stoppCooling();
        console.log("Antwort:", data);

    } catch (error) {
        console.log("Fehler:", error);
    }
}


</script>
