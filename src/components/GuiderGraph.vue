<template>
  <div>
    <canvas id="rmsGraph"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['RADistanceRaw', 'DECDistanceRaw']),
  },
  mounted() {
    this.initGraph();

    // Starte das regelmäßige Abrufen der Daten
    this.$store.dispatch('startFetching');

    // Beobachte Vuex-Datenänderungen
    this.$watch(
      () => [this.RADistanceRaw.slice(), this.DECDistanceRaw.slice()],
      ([newRawRA, newRawDec]) => {
        this.updateGraph(newRawRA, newRawDec);
      },
      { deep: true } // Beobachte Änderungen innerhalb der Arrays
    );
  },
  beforeUnmount() {
    // Stoppe das regelmäßige Abrufen der Daten
    this.$store.dispatch('stopFetching');
  },
  methods: {
    initGraph() {
      const ctx = document.getElementById('rmsGraph').getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array(50).fill(''), // Placeholder-Labels
          datasets: [
            {
              label: 'RA "',
              borderColor: 'rgba(70, 130, 180, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.5,
              pointRadius: 0, // Punktgröße hier einstellen
              data: [], // Start ohne Daten
            },
            {
              label: 'Dec "',
              borderColor: 'rgba(220, 20, 60, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              tension: 0.5,
              pointRadius: 0, // Punktgröße hier einstellen
              data: [], // Start ohne Daten
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
                color: 'rgba(248, 248, 255, 0.1)', // Gitterfarbe auf Weiß setzen
              },
            },
            y: {
              suggestedMin: -3,
              suggestedMax: 3,
              grid: {
                color: 'rgba(248, 248, 255, 0.1)', // Gitterfarbe auf Weiß setzen
              },
            },
          },
        },
      });
    },

    updateGraph(newRawRA, newRawDec) {
      if (this.chart) {
        // Update Graph-Daten ohne direkte Bindung an Vuex
        this.chart.data.datasets[0].data = [...newRawRA];
        this.chart.data.datasets[1].data = [...newRawDec];
        this.chart.update(); // Aktualisiere den Graphen
      }
    },
  },
};
</script>