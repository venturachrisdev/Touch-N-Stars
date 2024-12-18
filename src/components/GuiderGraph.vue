<template>
  <div>
    <canvas ref="rmsGraph"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Chart from "chart.js/auto";
import apiService from "@/services/apiService";

const RADistanceRaw = ref([]);
const DECDistanceRaw = ref([]);
const intervalId = ref(null);
const rmsGraph = ref(null);
let chart = null; // Nicht reaktiv

const initGraph = () => {
  const ctx = rmsGraph.value.getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Array(50).fill(""),
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
        duration: 0,
      },
      scales: {
        x: {
          grid: {
            color: "rgba(248, 248, 255, 0.1)",
          },
        },
        y: {
          suggestedMin: -3,
          suggestedMax: 3,
          grid: {
            color: "rgba(248, 248, 255, 0.1)",
          },
        },
      },
    },
  });
};

const fetchData = async () => {
  try {
    const response = await apiService.fetchGuiderChartData();
    if (response.success) {
      const data = response.data;

      if (
        !Array.isArray(data.RADistanceRaw) ||
        !Array.isArray(data.DECDistanceRaw)
      ) {
        console.error("Ungültige Datenstruktur:", data);
        return;
      }

      if (data.RADistanceRaw.length === 0 || data.DECDistanceRaw.length === 0) {
        console.warn("Leere Arrays empfangen:", data);
        return;
      }

      const sanitizedRA = data.RADistanceRaw.map((value) =>
        typeof value === "number" ? value : 0
      );
      const sanitizedDec = data.DECDistanceRaw.map((value) =>
        typeof value === "number" ? value : 0
      );

      RADistanceRaw.value = sanitizedRA;
      DECDistanceRaw.value = sanitizedDec;

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

const startFetching = () => {
  intervalId.value = setInterval(async () => {
    await fetchData();
  }, 1000);
};

const stopFetching = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

onMounted(() => {
  initGraph();
  fetchData();
  startFetching();
});

onBeforeUnmount(() => {
  stopFetching();
  if (chart) {
    chart.destroy();
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 200px;
}
</style>
