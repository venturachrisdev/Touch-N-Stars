<template>

    <div class="flex items-center space-x-3">
        <div class="flex flex-col">
            <label for="exposure" class="text-xs mb-1 text-gray-400">Belichtungszeit:</label>
            <input id="exposure" v-model.number="store.exposureTime" type="number"
                class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
                placeholder="sek" />
        </div>
        <div class="flex flex-col  ">
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
                <input id="gain" v-model.number="gain" type="number"
                    class="w-28 text-black px-3 h-8 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="1" />
            </div>

        </div>
    </div>

    <!--
    <div v-if="store.cameraInfo.CanSetTemperature">
        <div>
            <label for="TemperatureSetPoint">Solltemperatur: </label>
            <input id="TemperatureSetPoint" v-model="TemperatureSetPoint" type="number"
                class="text-black px-4 h-10 w-40 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
                placeholder="1" step="1" />
        </div>
        <button @click="startCooling" class="default-button-cyan"> Kühlen </button>
        <button @click="stoppCooling" class="default-button-cyan"> Stopp </button>
    </div>-->
</template>

<script setup>
/* eslint-disable */
import { ref } from 'vue';
import { apiStore } from '@/store/store';
import apiService from '@/services/apiService';
//import apiService from "@/services/apiService";

const store = apiStore();

let TemperatureSetPoint = ref(store.cameraInfo?.TemperatureSetPoint || 0);

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
