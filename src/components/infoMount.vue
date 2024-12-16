<template>
    <div v-if="!isConnected" class="text-red-500 ">
        <p>Bitte Montierung verbinden</p>
    </div>
    <div v-else class=" gap-2 ">
        <StatusBool :isEnabled="!parkPosition" enabledText="Ausgeparkt" disabledText="Geparkt" />
        <StatusBool :isEnabled="TrackingEnabled" enabledText="Tracking ist aktiv" disabledText="Tracking deaktiviert" />
        <StatusBool :isEnabled="Slewing" enabledText="Montierung schwenkt" disabledText="Schwenkt nicht" />
    </div>
</template>

<script>

import apiService from "@/services/apiService";
import StatusBool from '../components/StatusBool.vue';

export default {
    components: {
        StatusBool,
    },
    data() {
        return {
            parkPosition: true,
            TrackingEnabled: false,
            Slewing: false,
            isConnected: false,
        };
    },
    props: {
        modelValue: Boolean,
    },
    watch: {
        isConnected(newVal) {
            this.$emit("update:modelValue", newVal); // Bidirektionales Update
        },
    },
    async mounted() {
        this.isConnected = true;
        await this.fetchInfo();
        this.startFetchingInfo();
    },
    beforeUnmount() {
        // Stoppe den Intervall, wenn die Komponente zerstört wird
        this.stopFetchingInfo();
    },
    methods: {
        async fetchInfo() {
            try {
                const response = await apiService.mountAction("info"); 
                if (response.Success) {
                    const data = response.Response;
                    this.isConnected = data.Connected;
                    this.parkPosition = data.AtPark; 
                    this.TrackingEnabled = data.TrackingEnabled;
                    this.Slewing = data.Slewing;

                } else {
                    this.isConnected = false;
                    console.error("Fehler in der API-Antwort:", response.Error);
                }
            } catch (error) {
                this.isConnected = false;
                console.error("Fehler beim Abrufen der Mount-Informationen:", error);
            }
        },
        startFetchingInfo() {
            // Starte das Intervall für regelmäßige Abrufe
            this.intervalId = setInterval(this.fetchInfo, 1000);
        },
        stopFetchingInfo() {
            // Stoppe das Intervall
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },
    },
};
</script>