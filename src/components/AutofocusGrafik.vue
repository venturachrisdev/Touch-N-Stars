<template>
  <div class=" h-screen">
    <div class=" h-2/3 flex items-center justify-center">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Chart } from "chart.js";

const chartCanvas = ref(null);
let chartInstance = null;

// Funktion, um die Größe des Charts beim Fenster-Resize anzupassen
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onMounted(() => {
  // Messdaten
  const positions = [3976, 4056, 4136, 4216, 4296, 4376, 4456];
  const values = [15.25, 9.88, 4.63, 3.73, 7.85, 13.28, 19.52];

  // Werte von HyperbolicMinimum und QuadraticMinimum
  const hyperbolicMinimum = {
    position: 4189,
    value: 2.8746860398499523,
  };

  const quadraticMinimum = {
    position: 4198,
    value: 4.579738066634491,
  };

  // Quadratische Trendlinie berechnen
  const quadraticFunction = (x, a, b, c) => a * x ** 2 + b * x + c;
  const quadraticTrendline = positions.map((x) =>
    quadraticFunction(x, 0.0002335525970479781, -1.9609514027076933, 4120.708664127215)
  );

  // Hyperbolische Trendlinie berechnen
  const hyperbolicFunction = (x, A, B, C) =>
    A * Math.cosh(Math.asinh((B - x) / C));
  const hyperbolicTrendline = positions.map((x) =>
    hyperbolicFunction(x, 2.8746860398499523, 4188.625, 40.39624980612077)
  );

  const ctx = chartCanvas.value.getContext("2d");

  // Chart.js erstellen
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: positions,
      datasets: [
        {
          label: "Measure Points",
          data: values,
          borderColor: "blue",
          borderWidth: 2,
          fill: false,
          pointRadius: 5,
        },
        {
          label: "Quadratic Trendline",
          data: quadraticTrendline,
          borderColor: "red",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Hyperbolic Trendline",
          data: hyperbolicTrendline,
          borderColor: "green",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Quadratic Min",
          data: [{ x: quadraticMinimum.position, y: quadraticMinimum.value }],
          borderColor: "red",
          backgroundColor: "red",
          pointRadius: 6,
          pointStyle: "circle",
          showLine: false,
        },
        {
          label: "Hyperbolic Min",
          data: [{ x: hyperbolicMinimum.position, y: hyperbolicMinimum.value }],
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