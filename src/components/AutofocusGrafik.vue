<template>
    <div>
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { Chart } from "chart.js";
  
  // Referenz für das Canvas-Element
  const chartCanvas = ref(null);
  
  onMounted(() => {
    // Messdaten
    const positions = [3976, 4056, 4136, 4216, 4296, 4376, 4456];
    const values = [15.25, 9.88, 4.63, 3.73, 7.85, 13.28, 19.52];
  
    // Werte von HyperbolicMinimum und QuadraticMinimum
    const hyperbolicMinimum = {
      position: 4189, // X-Wert
      value: 2.8746860398499523, // Y-Wert
    };
  
    const quadraticMinimum = {
      position: 4198, // X-Wert
      value: 4.579738066634491, // Y-Wert
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
  
    // Chart.js Diagramm erstellen
    const ctx = chartCanvas.value.getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: positions, // X-Achse: Positionen
        datasets: [
          {
            label: "Measure Points",
            data: values, // Y-Achse: Werte
            borderColor: "blue",
            borderWidth: 2,
            fill: false,
            pointRadius: 5, // Zeige die Messpunkte an
          },
          {
            label: "Quadratic Trendline",
            data: quadraticTrendline, // Quadratische Trendlinie
            borderColor: "red",
            borderWidth: 2,
            fill: false,
            tension: 0.4, // Geschwungene Linie
          },
          {
            label: "Hyperbolic Trendline",
            data: hyperbolicTrendline, // Hyperbolische Trendlinie
            borderColor: "green",
            borderWidth: 2,
            fill: false,
            tension: 0.4, // Geschwungene Linie
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
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            type: "linear", // Ermöglicht beliebige X-Werte
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
  });
  </script>
  
  <style scoped>
  canvas {
    max-width: 100%;
    height: auto;
  }
  </style>
  