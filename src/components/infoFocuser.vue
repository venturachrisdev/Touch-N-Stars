<template>
    <div v-if="!isConnected" class="text-red-500 ">
        <p>Bitte Fokusierer verbinden</p>
    </div>
    <div v-else class=" gap-2 ">
        <StatusString :isEnabled="currentPosition" Name="Aktuelle Poistion:" :Value=currentPosition />
        <StatusString :isEnabled="temperature" Name="Temperatur:" :Value=temperature />
        <StatusBool class="col-start-1" :isEnabled="!isMoving" enabledText="Beweg sich" disabledText="Steht" />
        <StatusBool :isEnabled="isSettling" enabledText="Backlash Korrektur" disabledText="Backlash Korrektur" />

    </div>
</template>

<script>

import apiService from "@/services/apiService";
import StatusBool from '../components/StatusBool.vue';
import StatusString from '../components/StatusString.vue';

export default {
    components: {
        StatusBool,
        StatusString,
    },
    data() {
        return {
            currentPosition: null, // Aktuelle Position vom Server
            temperature: null, // Aktuelle Temperatur
            isMoving: false, // Status: Bewegt sich
            isSettling: false, // Status: Wird eingestellt
            isConnected: false, // Verbindungsstatus
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
        async fetchInfo() {
            try {
                const response = await apiService.focusAction("info"); // API-Aufruf
                if (response.Success) {
                    const data = response.Response;
                    this.isConnected = data.Connected; // Verbindungsstatus setzen
                    this.currentPosition = data.Position; // Setze aktuelle Position
                    this.temperature = data.Temperature.toFixed(2); // Setze Temperatur
                    this.isMoving = data.IsMoving; // Setze Bewegung-Status
                    this.isSettling = data.IsSettling; // Setze Einstellungs-Status

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