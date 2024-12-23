<template>
  <div class="h-screen">
    <div class="h-1/2 flex items-center justify-center">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>
    <div class="text-center mt-4">
      <p>{{ timestamp }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";
import apiService from "@/services/apiService";

// Registriere alle Chart.js Komponenten
Chart.register(...registerables);

const chartCanvas = ref(null);
const timestamp = ref(""); // Timestamp für die Anzeige
let chartInstance = null;

// Funktion, um die Größe des Charts beim Fenster-Resize anzupassen
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// Funktion zum Parsen der Quadratischen Fitting-Formel
function parseQuadraticFormula(formula) {
  // Normalisiere die Formel, um "+ -" zu "-"
  const normalizedFormula = formula.replace(/\+\s*-/g, '- ').replace(/-\s*-/g, '+ ');

  console.log("Normalisierte Quadratische Formel:", normalizedFormula); // Debugging

  // Neuer Regex für Exponentialnotation
  const regex = /y\s*=\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*\*\s*x\^2\s*([+-]?\s*\d*\.?\d+(?:[eE][+-]?\d+)?)\s*\*\s*x\s*([+-]?\s*\d*\.?\d+(?:[eE][+-]?\d+)?)/i;
  const match = normalizedFormula.match(regex);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2].replace(/\s+/g, ""));
    const c = parseFloat(match[3].replace(/\s+/g, ""));
    return { a, b, c };
  }
  return null;
}


// Funktion zum Parsen der Hyperbolischen Fitting-Formel
function parseHyperbolicFormula(formula) {
  console.log("Hyperbolic Fitting Formel:", formula); // Debugging

  // Neuer Regex für Exponentialnotation und Hyperbolische Funktion
  const regex = /y\s*=\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*\*\s*cosh\s*\(\s*asinh\s*\(\s*\(\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*-\s*x\s*\)\s*\/\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*\)\s*\)/i;
  const match = formula.match(regex);
  if (match) {
    const A = parseFloat(match[1]);
    const B = parseFloat(match[2]);
    const C = parseFloat(match[3]);
    return { A, B, C };
  }
  return null;
}


// Daten von der API abrufen und Chart aktualisieren
async function fetchLastAf() {
  try {
    const response = await apiService.focusAction("last-af");

    const apiData = response.Response;
    const measurePoints = apiData.MeasurePoints || [];

    // Neue Daten extrahieren
    const positions = measurePoints.map((point) => point.Position);
    const values = measurePoints.map((point) => parseFloat(point.Value.toFixed(2)));

    //console.log("Positions:", positions);
    //console.log("Values:", values);

    // `hyperbolicMinimum` und `quadraticMinimum` aus Intersections
    const hyperbolicMinimum = {
      position: apiData.Intersections?.HyperbolicMinimum?.Position,
      value: apiData.Intersections?.HyperbolicMinimum?.Value,
    };

    const quadraticMinimum = {
      position: apiData.Intersections?.QuadraticMinimum?.Position,
      value: apiData.Intersections?.QuadraticMinimum?.Value,
    };

    //console.log("Hyperbolic Minimum:", hyperbolicMinimum);
    //console.log("Quadratic Minimum:", quadraticMinimum);

    // `Timestamp` aus API speichern
    timestamp.value = apiData.Timestamp;

    // Fittings aus API extrahieren
    const fittings = apiData.Fittings;

    // Quadratische Fitting-Parameter parsen
    const quadraticParams = parseQuadraticFormula(fittings.Quadratic);
    if (!quadraticParams) {
      throw new Error("Quadratic Fitting-Formel konnte nicht geparst werden.");
    }

    // Hyperbolische Fitting-Parameter parsen
    const hyperbolicParams = parseHyperbolicFormula(fittings.Hyperbolic);
    if (!hyperbolicParams) {
      throw new Error("Hyperbolic Fitting-Formel konnte nicht geparst werden.");
    }

    // Funktionen basierend auf den geparsten Parametern definieren
    const quadraticFunction = (x) =>
      quadraticParams.a * Math.pow(x, 2) + quadraticParams.b * x + quadraticParams.c;

    const hyperbolicFunction = (x) =>
      hyperbolicParams.A * Math.cosh(Math.asinh((hyperbolicParams.B - x) / hyperbolicParams.C));

    // Berechne die y-Werte für die Trendlinien basierend auf den Positionen
    const quadraticTrendline = positions.map((x) => quadraticFunction(x));
    const hyperbolicTrendline = positions.map((x) => hyperbolicFunction(x));

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
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
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
