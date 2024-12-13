<template>
    <div class="flex gap-x-2">
        <button @click="parkMount"
            class=" min-w-32 min-h-10 bg-cyan-900 rounded-md text-white font-medium transition-colors w-full">
            Parken
        </button>
        <button @click="unparkMount"
            class="min-w-32 min-h-10 bg-red-800 rounded-md text-white font-medium transition-colors w-full">
            Ausparken
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
        }
    }
    };
</script>