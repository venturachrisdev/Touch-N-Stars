<template>
    <div class="container flex tems-center justify-center">
        <div class="container max-w-md">
            <h5 class="text-xl font-bold text-white mb-4">Schwenken und Zentrieren</h5>
            <div class="flex flex-row justify-center items-center space-x-4">
                <!-- Verwende v-model für die Bidirektionale Datenbindung -->
                <p>RA:</p>
                <input type="text" v-model="localRAangleString" @blur="handleBlurRA" @keyup.enter="handleBlurRA"
                    class="text-black w-full p-2 border border-gray-300 rounded" placeholder="RA 03:47:28.2" />
                <p>Dec:</p>
                <input type="text" v-model="localDECangleString" @blur="handleBlurDEC" @keyup.enter="handleBlurDEC"
                    class="text-black w-full p-2 border border-gray-300 rounded" placeholder="Dec +24:06:19" />
            </div>
            <div class="mt-4 grid sm:grid-cols-2 space-y-2  sm:space-x-2 sm:space-y-0 ">
                <button @click="slew"
                    class="default-button-cyan">
                    Schwenken
                </button>
                <button @click="slewAndCenter"
                    class="default-button-cyan">
                    Schwenken und Zentrieren
                </button>
            </div>
        </div>

    </div>
</template>

<script>
import apiService from "@/services/apiService";

export default {
    props: {
        RAangleString: String,
        DECangleString: String,
    },
    data() {
        return {
            localRAangleString: this.RAangleString, // Lokale Kopie erstellen
            localDECangleString: this.DECangleString, // Lokale Kopie erstellen
            RAangle: null,
            DECangle: null,
            Info: null,
        };
    },
    async mounted() {
        this.startFetchingInfo();
    },
    watch: {
        // Wenn Props sich ändern, aktualisiere die lokalen Kopien
        RAangleString(newValue) {
            this.localRAangleString = newValue;
        },
        DECangleString(newValue) {
            this.localDECangleString = newValue;
        },
    },
    methods: {
        validateRA(raString) {
            const raPattern = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9](\.\d+)?)$/;
            return raPattern.test(raString);
        },
        validateDEC(decString) {
            const decPattern = /^(\+|-)?(90|[0-8]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9](\.\d+)?)$/;
            return decPattern.test(decString);
        },
        checkValidity() {
            const isRAValid = this.validateRA(this.localRAangleString);
            const isDECValid = this.validateDEC(this.localDECangleString);

            if (!isRAValid) {
                alert("Ungültiges RA-Format. Bitte verwenden Sie HH:MM:SS.");
            }
            if (!isDECValid) {
                alert("Ungültiges DEC-Format. Bitte verwenden Sie ±DD:MM:SS.");
            }

            return isRAValid && isDECValid;
        },
        handleBlurRA() {
            if (this.validateRA(this.localRAangleString)) {
                this.updateRA();
            } else {
                alert("Ungültige RA-Eingabe.");
            }
        },
        handleBlurDEC() {
            if (this.validateDEC(this.localDECangleString)) {
                this.updateDec();
            } else {
                alert("Ungültige DEC-Eingabe.");
            }
        },
        updateRA() {
            this.$emit("update:RAangleString", this.localRAangleString);
        },
        updateDec() {
            this.$emit("update:DECangleString", this.localDECangleString);
        },
        async slew() {
            this.RAangle = this.hmsToDegrees(this.localRAangleString);
            this.DECangle = this.dmsToDegrees(this.localDECangleString);
            try {
                await apiService.slewAndCenter(this.RAangle, this.DECangle, false);
            } catch (error) {
                console.error("Framing API nicht erreicht", error);
            }

        },
        async slewAndCenter() {
            this.RAangle = this.hmsToDegrees(this.localRAangleString);
            this.DECangle = this.dmsToDegrees(this.localDECangleString);
            try {
                await apiService.slewAndCenter(this.RAangle, this.DECangle, true);
            } catch (error) {
                console.error("Framing API nicht erreicht", error);
            }
            // Änderungen an die Parent-Komponente melden
            this.$emit("update:RAangleString", this.localRAangleString);
            this.$emit("update:DECangleString", this.localDECangleString);
        },
        hmsToDegrees(hmsString) {
            const parts = hmsString.split(":");
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const seconds = parseInt(parts[2], 10);
            return hours * 15 + minutes * (15 / 60) + seconds * (15 / 3600);
        },
        dmsToDegrees(dmsString) {
            const sign = dmsString.startsWith("-") ? -1 : 1;
            const stripped = dmsString.replace("-", "");
            const parts = stripped.split(":");

            if (parts.length !== 3) {
                throw new Error("Ungültiges Format. Erwartet: ±DD:MM:SS.s");
            }

            const degrees = parseFloat(parts[0]);
            const minutes = parseFloat(parts[1]);
            const seconds = parseFloat(parts[2]);

            return sign * (degrees + minutes / 60 + seconds / 3600);
        },
        async fetchInfo() {
            try {
                const response = await apiService.framingAction("info"); // API-Aufruf
                if (response.Success) {
                    this.Info = response.Response;

                } else {
                    console.error("Fehler in der API-Antwort:", response.Error);
                }
            } catch (error) {
                console.error("Fehler beim Abrufen der Mount-Informationen:", error);
            }
        },
        startFetchingInfo() {
            this.fetchInfo(true); // Perform an initial fetch
            this.intervalId = setInterval(() => this.fetchInfo(false), 1000); // Set up the interval
        },
        stopFetchingInfo() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },
    },
    beforeUnmount() {
        // Ensure interval is cleared when the component is destroyed
        this.stopFetchingInfo();
    },
};
</script>