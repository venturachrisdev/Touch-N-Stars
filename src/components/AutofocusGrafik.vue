<template>
  <div class="h-screen">
    <div class="h-2/3 flex items-center justify-center">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>
    <div class="text-center mt-4">
      <p>{{ timestamp }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Chart } from "chart.js";
import apiService from "@/services/apiService";

const chartCanvas = ref(null);
const timestamp = ref(""); // Timestamp für die Anzeige
let chartInstance = null;

// Funktion, um die Größe des Charts beim Fenster-Resize anzupassen
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// Daten von der API abrufen und Chart aktualisieren
async function fetchLastAf() {
  try {
    const response = await apiService.focusAction("last-af");

    const apiData = response.Response;
    const measurePoints = apiData.MeasurePoints || [];

    // Neue Daten extrahieren
    const positions = measurePoints.map((point) => point.Position);
    const values = measurePoints.map((point) => parseFloat(point.Value.toFixed(2)));

    console.log("Positions:", positions);
    console.log("Values:", values);

    // `hyperbolicMinimum` und `quadraticMinimum` aus Intersections
    const hyperbolicMinimum = {
      position: apiData.Intersections?.HyperbolicMinimum?.Position,
      value: apiData.Intersections?.HyperbolicMinimum?.Value,
    };

    const quadraticMinimum = {
      position: apiData.Intersections?.QuadraticMinimum?.Position,
      value: apiData.Intersections?.QuadraticMinimum?.Value,
    };

    console.log("Hyperbolic Minimum:", hyperbolicMinimum);
    console.log("Quadratic Minimum:", quadraticMinimum);

    // `Timestamp` aus API speichern
    timestamp.value = apiData.Timestamp;

    // Trendlinien berechnen
    const quadraticFunction = (x, a, b, c) => a * x ** 2 + b * x + c;
    const quadraticTrendline = positions.map((x) =>
      quadraticFunction(x, 0.0002335525970479781, -1.9609514027076933, 4120.708664127215)
    );

    const hyperbolicFunction = (x, A, B, C) =>
      A * Math.cosh(Math.asinh((B - x) / C));
    const hyperbolicTrendline = positions.map((x) =>
      hyperbolicFunction(x, 2.8746860398499523, 4188.625, 40.39624980612077)
    );

    // Aktualisiere Chart-Daten
    if (chartInstance) {
      chartInstance.data.labels = positions;
      chartInstance.data.datasets[0].data = values;
      chartInstance.data.datasets[1].data = quadraticTrendline;
      chartInstance.data.datasets[2].data = hyperbolicTrendline;

      // Aktualisiere die Punkte für Minima
      chartInstance.data.datasets[3].data = [
        { x: quadraticMinimum.position, y: quadraticMinimum.value },
      ];
      chartInstance.data.datasets[4].data = [
        { x: hyperbolicMinimum.position, y: hyperbolicMinimum.value },
      ];

      chartInstance.update();
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
  }
}

onMounted(() => {
  const ctx = chartCanvas.value.getContext("2d");

  // Initialer Chart
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: [], // Initial leer
      datasets: [
        {
          label: "Measure Points",
          data: [],
          borderColor: "blue",
          borderWidth: 2,
          fill: false,
          pointRadius: 5,
        },
        {
          label: "Quadratic Trendline",
          data: [],
          borderColor: "red",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Hyperbolic Trendline",
          data: [],
          borderColor: "green",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Quadratic Min",
          data: [], // Dynamisch aktualisiert
          borderColor: "red",
          backgroundColor: "red",
          pointRadius: 6,
          pointStyle: "circle",
          showLine: false,
        },
        {
          label: "Hyperbolic Min",
          data: [], // Dynamisch aktualisiert
          borderColor: "green",
          backgroundColor: "green",
          pointRadius: 6,
          pointStyle: "circle",
          showLine: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Position",
          },
        },
        y: {
          title: {
            display: true,
            text: "Value",
          },
        },
      },
    },
  });

  // Daten laden
  fetchLastAf();

  // Event Listener hinzufügen
  window.addEventListener("resize", resizeChart);
});

onUnmounted(() => {
  // Event Listener entfernen
  window.removeEventListener("resize", resizeChart);

  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
/* Keine spezifischen Stile benötigt, da Tailwind verwendet wird */
</style>
