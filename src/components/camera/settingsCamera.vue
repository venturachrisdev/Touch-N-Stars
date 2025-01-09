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
        <div v-if="store.cameraInfo.CanSetOffset" class="flex flex-col  border border-gray-500  p-1 pb-2 rounded-lg ">
            <label for="offset" class="text-xs mb-1 text-gray-400">{{ $t('components.camera.offset') }}</label>
            <div v-if="store.cameraInfo.Offset && store.cameraInfo.Offset.length > 0">
                <select id="offset" v-model.number="cameraStore.offset"
                    class="w-28 text-black px-3 h-8  border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-cyan-700">
                    <option v-for="(value, key) in store.cameraInfo.Offset" :key="key" :value="key" @change="setOffset">
                        {{ value }}
                    </option>
                </select>
            </div>
            <div v-else>
                <input id="offset" v-model.number="cameraStore.offset" type="number"
                    class="w-28 text-black px-3 h-8 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    placeholder="0" 
                    @blur="setOffset"
                    :min="store.cameraInfo.OffsetMin"
                    :max="store.cameraInfo.OffsetMax"
                    />
            </div>
        </div>
    </div>
</template>

<script setup>
//import { ref } from 'vue';
import { apiStore } from '@/store/store';
import { useCameraStore } from '@/store/cameraStore';
import apiService from '@/services/apiService';

const store = apiStore();
const cameraStore = useCameraStore();

async function setOffset() {
    console.log(cameraStore.offset)
    if(store.cameraInfo.OffsetMin > cameraStore.offset) {
        cameraStore.offset = store.cameraInfo.OffsetMin;
        console.log('Offset zu klein min: ', store.cameraInfo.OffsetMin )
    }
    if(store.cameraInfo.OffsetMax < cameraStore.offset) {
        cameraStore.offset = store.cameraInfo.OffsetMax;
        console.log('Offset zu groß, Max: ' , store.cameraInfo.OffsetMax)
    }
    try{
       const data = await apiService.profileChangeValue("CameraSettings-Offset",cameraStore.offset);
       console.log(data);
    }catch(error){
        console.log("Fehler beim setzten des Offset")
    }
}





</script>
