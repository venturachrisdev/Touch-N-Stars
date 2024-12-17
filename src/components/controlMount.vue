<template>
    <div class="flex gap-x-2">
        <button @click="parkMount" class="default-button-red ">
            Parken
        </button>
        <button @click="unparkMount" class="default-button-cyan">
            Ausparken
        </button>
        <button @click="homeMount" class="default-button-cyan">
            Home
        </button>
    </div>
    <div class=" flex mt-4 justify-center items-center">
        <div class=" w-3 mr-2 h-[1px] bg-gray-700">
        </div>
        <p class=" text-xs">Tracking Mode</p>
        <div class="flex-grow ml-2 h-[1px] bg-gray-700"></div>
    </div>
    <div class="flex gap-x-2 mt-2">
        <button @click="setTrackingMode(1)"
            class="min-w-15 min-h-10 bg-cyan-900 rounded-md text-white font-medium transition-colors w-full">
            Siderial
        </button>
        <button @click="setTrackingMode(1)" class="min-w-15 min-h-10 bg-cyan-900 rounded-md text-white font-medium transition-colors w-full ">
            Lunar
        </button>
        <button @click="setTrackingMode(2)" class="min-w-15 min-h-10 bg-cyan-900 rounded-md text-white font-medium transition-colors w-full ">
            Solar
        </button>
        <button @click="setTrackingMode(3)" class="min-w-15 min-h-10 bg-cyan-900 rounded-md text-white font-medium transition-colors w-full ">
            King
        </button>
        <button @click="setTrackingMode(4)" class="min-w-15 min-h-10 bg-red-800 rounded-md text-white font-medium transition-colors w-full ">
            Stopp
        </button>
    </div>

</template>

<script>

import apiService from "@/services/apiService";

export default {
    components: {

    },
    data() {
        return {

        };
    },
    props: {

    },
    watch: {

    },
    async mounted() {
    },
    beforeUnmount() {

    },
    methods: {
        async parkMount() {
            try {
                await apiService.mountAction("park");
                console.log("Montierung parken");
            }
            catch (error) {
                console.log("Fehler beim parken der Montierung")
            }
        },
        async unparkMount() {
            try {
                await apiService.mountAction("unpark");
                console.log("Montierung ausparken");
            }
            catch (error) {
                console.log("Fehler beim ausparken der Montierung")
            }
        },
        async homeMount() {
            try {
                await apiService.mountAction("home");
                console.log("Montierung ausparken");
            }
            catch (error) {
                console.log("Fehler beim ausparken der Montierung")
            }
        },
        async setTrackingMode(mode) {
            //0=Siderial, 1=Lunar, 2=Solar, 3=King, 4=Stopped)
            try {
                await apiService.setTrackingMode(mode);
                console.log("Tracking Mode gesetzt");
            }
            catch (error) {
                console.log("Fehler beim setzten des Tracking Mode")
            }
        },
    }
};
</script>