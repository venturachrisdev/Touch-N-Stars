<template>
    <div v-if="!isConnected" class="text-red-500 ">
        <p>Bitte Kamera verbinden</p>
    </div>
    <div v-else-if="showInfo" class=" gap-2 ">
       
        <StatusString :isEnabled="Name" Name="Name:" :Value=Name />
        <StatusString :isEnabled="Gain" Name="Gain:" :Value=Gain />
        <StatusString :isEnabled="Offset" Name="Offset:" :Value=Offset />
        <StatusString :isEnabled="XSize" Name="X-Size:" :Value=XSize />
        <StatusString :isEnabled="YSize" Name="Y-Size:" :Value=YSize />
        <StatusString :isEnabled="PixelSize" Name="Pixel-Size:" :Value=PixelSize />
        <StatusString :isEnabled="CanSetTemperature" Name="Aktuelle Temperatur:" :Value=Temperature />
        <StatusBool class="col-start-1" :isEnabled="IsExposing" enabledText="Aufnahme läuft" disabledText="Kamera standby" />
        <StatusBool v-if="CanSetTemperature" :isEnabled="CoolerOn" enabledText="Kühler aktiv" disabledText="Kühler aus" />
        <StatusBool v-if="CanSetTemperature" :isEnabled="DewHeaterOn" enabledText="Tauheizung aktiv" disabledText="Tauheizung aus" />
       
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
            isConnected: false, // Verbindungsstatus
            CanSetTemperature: false,
            CoolerOn: false,
            DewHeaterOn: false,
            IsExposing:	false,
            Temperature	: null,
            Gain : null,
            Offset: null,
            XSize: null,	
            YSize: null,
            PixelSize: null,
            TemperatureSetPoint: null,
            ExposureEndTime: null,
            Name: null,	
        };
    },
    props: {
        modelValue: Boolean,
        showInfo: {
        type: Boolean,
        required: false,
      },
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
                const response = await apiService.cameraAction("info"); // API-Aufruf
                if (response.Success) {
                    const data = response.Response;
                    this.isConnected = data.Connected;   
                    this.CanSetTemperature = data.CanSetTemperature; 
                    this.CoolerOn = data.CoolerOn;
                    this.DewHeaterOn = data.DewHeaterOn;
                    this.IsExposing = data.IsExposing;
                    this.Temperature = data.Temperature;
                    this.Gain = data.Gain;
                    this.Offset = data.Offset;
                    this.XSize = data.XSize;
                    this.YSize = data.YSize;
                    this.PixelSize = data.PixelSize;
                    this.TemperatureSetPoint = data.TemperatureSetPoint;
                    this.ExposureEndTime = data.ExposureEndTime;
                    this.Name = data.Name;

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