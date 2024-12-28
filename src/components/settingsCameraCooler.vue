<template>

    <div class="flex items-center gap-2">

        <div v-if="store.cameraInfo.CanSetTemperature">

            <div class=" flex flex-col border border-gray-500 p-1 pb-2 rounded-lg  ">
                <label for="Cooler" class="text-xs mb-1 text-gray-400">Kamerakühlung </label>
                <div class="flex gap-2">
                    <div class="flex flex-col col-span-2  border border-gray-500 p-1 pb-2 rounded-lg">
                        <label for="TemperatureSetPoint" class="text-xs mb-1 text-gray-400">Solltemperatur </label>
                        <div class="flex space-x-2">
                            <input id="TemperatureSetPoint" v-model="cameraStore.coolingTemp" type="number"
                                class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
                                placeholder="1" step="1" />
                        </div>
                    </div>
                    <div class="flex flex-col col-span-2  border border-gray-500 p-1 pb-2 rounded-lg">
                        <label for="TemperatureDurationTime" class="text-xs mb-1 text-gray-400">Abkühlzeit </label>
                        <input id="TemperatureDurationTime" v-model="cameraStore.coolingTime" type="number"
                            class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
                            placeholder="1" step="1" />
                    </div>
                    <div class="flex flex-col col-span-2  border border-gray-500 p-1 pb-2 rounded-lg">
                        <label for="TemperatureDurationTime" class="text-xs mb-1 text-gray-400">Aufwärmzeit </label>
                        <input id="TemperatureDurationTime" v-model="cameraStore.warmingTime" type="number"
                            class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700"
                            placeholder="1" step="1" />
                    </div>

                    <toggleButton @click="toggleCooling" :status-value="store.cameraInfo.CoolerOn" />
                </div>
            </div>
            
        </div>
        <div v-if="store.cameraInfo.HasDewHeater">
            <div class="flex flex-col min-w-44 border border-gray-500 p-1 pb-2 rounded-lg">
                <label for="DewHeater" class="text-xs mb-1 text-gray-400">Tauheizung </label>
                <div class="flex space-x-2">
                    <toggleButton @click="toggleDewHeater" :status-value="store.cameraInfo.DewHeaterOn" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
//import { ref } from 'vue';
import { apiStore } from '@/store/store';
import { useCameraStore } from '@/store/cameraStore';
import apiService from '@/services/apiService';
import toggleButton from './toggleButton.vue';

const store = apiStore();
const cameraStore = useCameraStore();

//let TemperatureSetPoint = ref(store.cameraInfo?.TemperatureSetPoint || 0);

function toggleDewHeater() {
    if (store.cameraInfo.DewHeaterOn) {
        try {
            const data = apiService.startStoppDewheater(false);
            console.log(data)
        } catch (error) {
            console.log("Fehler:", error);
        }
    } else {
        try {
            const data = apiService.startStoppDewheater(true);
            console.log(data)
        } catch (error) {
            console.log("Fehler:", error);
        }
    }
}

function toggleCooling() {
    if (store.cameraInfo.CoolerOn) {
        stoppCooling();
        console.log("stopp")
    } else {
        startCooling();
        console.log("start")
    }
}

async function startCooling() {
    try {
        const dataWarm = await apiService.startStoppWarming(true);
        Promise.all([dataWarm]);
        console.log("Antwort warming:", dataWarm);

        const dataCool = apiService.startCooling(cameraStore.coolingTemp, cameraStore.coolingTime);
        console.log("Antwort cooling:", dataCool);
        console.log("SollTemp:", cameraStore.coolingTemp);

    } catch (error) {
        console.log("Fehler:", error);
    }
}
async function stoppCooling() {
    try {
        const dataCool = await apiService.stoppCooling();
        Promise.all([dataCool]);
        console.log("Antwort cooling:", dataCool);
        const dataWarm = apiService.startStoppWarming(false, cameraStore.warmingTime);
        console.log("Antwort warming:", dataWarm);

    } catch (error) {
        console.log("Fehler:", error);
    }
}



</script>
