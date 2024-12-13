<template>
  <div>
    <canvas ref="rmsGraph"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Chart from "chart.js/auto";
import apiService from "@/services/apiService";

export default {
  name: "RmsGraph",
  setup() {
    // Reaktive Daten für die Rohdaten
    const RADistanceRaw = ref([]);
    const DECDistanceRaw = ref([]);
    const intervalId = ref(null); // Referenz für den Intervall
    const rmsGraph = ref(null); // Referenz zum Canvas-Element
    let chart = null; // Chart.js Instanz (nicht reaktiv)

    // Initialisiert das Chart
    const initGraph = () => {
      const ctx = rmsGraph.value.getContext("2d");
      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array(50).fill(""), // Platzhalter-Labels
          datasets: [
            {
              label: 'RA "',
              borderColor: "rgba(70, 130, 180, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.5,
              pointRadius: 0,
              data: [0],
            },
            {
              label: 'Dec "',
              borderColor: "rgba(220, 20, 60, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              tension: 0.5,
              pointRadius: 0,
              data: [0],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0, // Animation deaktivieren
          },
          scales: {
            x: {
              grid: {
                color: "rgba(248, 248, 255, 0.1)", // Gitterfarbe auf Weiß setzen
              },
            },
            y: {
              suggestedMin: -3,
              suggestedMax: 3,
              grid: {
                color: "rgba(248, 248, 255, 0.1)", // Gitterfarbe auf Weiß setzen
              },
            },
          },
        },
      });
    };

    // Holt die Daten von der API
    const fetchData = async () => {
      try {
        const response = await apiService.fetchGuiderChartData();
        if (response.success) {
          const data = response.data;

          // Sicherstellen, dass die Arrays gültig sind
          if (
            !Array.isArray(data.RADistanceRaw) ||
            !Array.isArray(data.DECDistanceRaw)
          ) {
            console.error("Ungültige Datenstruktur:", data);
            return;
          }

          if (
            data.RADistanceRaw.length === 0 ||
            data.DECDistanceRaw.length === 0
          ) {
            console.warn("Leere Arrays empfangen:", data);
            return;
          }

          // Daten sanitieren
          const sanitizedRA = data.RADistanceRaw.map((value) =>
            typeof value === "number" ? value : 0
          );
          const sanitizedDec = data.DECDistanceRaw.map((value) =>
            typeof value === "number" ? value : 0
          );

          RADistanceRaw.value = sanitizedRA;
          DECDistanceRaw.value = sanitizedDec;

          // Aktualisiere die gesamten Datenarrays
          if (chart) {
            chart.data.datasets[0].data = RADistanceRaw.value;
            chart.data.datasets[1].data = DECDistanceRaw.value;
            chart.update();
          }
        } else {
          console.warn("Fehler beim Abrufen der Daten:", response.message);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Guider-Daten:", error);
      }
    };

    // Startet das periodische Abrufen der Daten
    const startFetching = () => {
      intervalId.value = setInterval(async () => {
        await fetchData();
      }, 1000); // Daten jede Sekunde abrufen
    };

    // Stoppt das periodische Abrufen der Daten
    const stopFetching = () => {
      if (intervalId.value) {
        clearInterval(intervalId.value);
        intervalId.value = null;
      }
    };

    // Lifecycle-Hooks
    onMounted(() => {
      initGraph();
      fetchData(); // Erste Datenabruf
      startFetching(); // Periodisches Abrufen starten
    });

    onBeforeUnmount(() => {
      stopFetching(); // Periodisches Abrufen stoppen
      if (chart) {
        chart.destroy(); // Chart-Instanz zerstören, um Speicherlecks zu vermeiden
      }
    });

    return {
      rmsGraph,
    };
  },
};
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 200px;
}
</style>
