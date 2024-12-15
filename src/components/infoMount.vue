<template>
    <div v-if="!isConnected" class="text-red-500 ">
        <p>Bitte Montierung verbinden</p>
    </div>


    <div v-else class=" gap-2 ">
        <StatusBool :isEnabled="!parkPosition" enabledText="Ausgeparkt" disabledText="Geparkt" />
        <StatusBool :isEnabled="TrackingEnabled" enabledText="Tracking ist aktiv" disabledText="Tracking deaktiviert" />
        <StatusBool :isEnabled="Slewing" enabledText="Montierung Schwenkt" disabledText="Schwenkt nicht" />
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
        // Hole die aktuelle Position beim Laden der Komponente
        await this.fetchInfo(true);
        // Starte das regelmäßige Abrufen der Informationen
        this.startFetchingInfo();
    },
    beforeUnmount() {
        // Stoppe den Intervall, wenn die Komponente zerstört wird
        this.stopFetchingInfo();
    },
    methods: {
        async fetchInfo(initialFetch = false) {
            try {
                const response = await apiService.mountAction("info"); // API-Aufruf
                if (response.Success) {
                    const data = response.Response;
                    this.isConnected = data.Connected; // Verbindungsstatus setzen
                    this.parkPosition = data.AtPark; // Setze aktuelle Position
                    this.TrackingEnabled = data.TrackingEnabled;
                    this.Slewing = data.Slewing;

                    // Setze die Eingabeposition nur beim ersten Aufruf
                    if (initialFetch && this.isConnected) {
                        this.parkPosition = data.AtPark;
                    }
                } else {
                    console.error("Fehler in der API-Antwort:", response.Error);
                }
            } catch (error) {
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