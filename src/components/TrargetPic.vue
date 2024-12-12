<template>
    <div class="container text-center">
        <h5 class="text-xl  font-bold text-white mb-4">Bild</h5>

        <button @click="getTargetPic">laden</button>
        <img v-if="targetPic" :src="targetPic" alt="Bild konnte nicht geladen werden">
    </div>
</template>

<script>

import apiService from "@/services/apiService";

export default {
    components: {

    },
    data() {
        return {
            targetPic: null,
        };
    },
    async mounted() {

    },
    methods: {
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
        async getTargetPic() {
            try {
                const ra = this.hmsToDegrees("00:42:44.35");
                const dec = this.dmsToDegrees("+41:16:08.6");

                if (this.targetPic) {
                    URL.revokeObjectURL(this.targetPic);
                }

                this.targetPic = await apiService.searchTargetPic(200, 200, 2, ra, dec);
            } catch (error) {
                console.error("Fehler beim Abrufen des Bildes:", error);
            }
        },
    },
};
</script>