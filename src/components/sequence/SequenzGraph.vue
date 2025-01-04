<template>
    <div class=" h-96">
        <canvas  ref="rmsGraph"></canvas>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Chart } from "chart.js/auto";
import { apiStore } from "@/store/store";

const store = apiStore();
const rmsGraph = ref(null);
let chart = null;

onMounted(() => {
    initGraph();
});

onBeforeUnmount(() => {
    if (chart) {
        chart.destroy();
    }
});

function initGraph() {
    if (!store.imageHistoryInfo) {
        console.log("Keine Daten vorhanden");
        return;
    }

    const responseData = store.imageHistoryInfo;

    // X-Achse (Labels)
    const labels = responseData.map(item =>
        new Date(item.Date).toLocaleTimeString()
    );

    // Y-Achse (Daten) für Stars
    const starsData = responseData.map(item => item.Stars);

    // Y-Achse (Daten) für HFR
    const hfrData = responseData.map(item => item.HFR);

    // Chart.js-Instanz erzeugen
    chart = new Chart(rmsGraph.value, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Stars",
                    data: starsData,
                    borderColor: "blue",
                    fill: false,
                    yAxisID: "yStars",  // <--- Wichtig: ID der linken Y-Achse
                },
                {
                    label: "HFR",
                    data: hfrData,
                    borderColor: "red",
                    fill: false,
                    yAxisID: "yHfr",    // <--- Wichtig: ID der rechten Y-Achse
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Zeit",
                    },
                },
                // Linke Y-Achse
                yStars: {
                    type: "linear",
                    display: true,
                    position: "left",
                    title: {
                        display: true,
                        text: "Stars",
                    },
                },
                // Rechte Y-Achse
                yHfr: {
                    type: "linear",
                    display: true,
                    position: "right",
                    title: {
                        display: true,
                        text: "HFR",
                    },
                    // Verhindert Überlagerung der Gitterlinien
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                },
            },
        },
    });
}

watch(
    () => store.imageHistoryInfo,
    (newVal, oldVal) => {
        //Prüfen, ob es mehr Elemente als vorher gibt
        if (newVal.length > oldVal.length) {
            console.log("Neuer Datensatz hinzugekommen!");
            if (chart && newVal) {
                console.log("Daten aktualisieren");
                const newLabels = newVal.map(item =>
                    new Date(item.Date).toLocaleTimeString()
                );
                const newStarsData = newVal.map(item => item.Stars);
                const newHfrData = newVal.map(item => item.HFR);

                chart.data.labels = newLabels;
                chart.data.datasets[0].data = newStarsData; // Stars
                chart.data.datasets[1].data = newHfrData;   // HFR
                chart.update();
            }
        }
    },
    {
        immediate: false,
    }
);
</script>

<style scoped>
</style>