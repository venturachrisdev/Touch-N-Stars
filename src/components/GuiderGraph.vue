<template>
  <div>
    <canvas id="rmsGraph"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { mapGetters } from 'vuex';

/*
    RADistanceRaw: [],
  DECDistanceRaw: [],
  RADuration: [],
  DECDuration: [],
  */

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
          labels: Array(100).fill(''), // Placeholder-Labels
          datasets: [
            {
              label: 'RA',
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              data: [], // Start ohne Daten
            },
            {
              label: 'Dec',
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              data: [], // Start ohne Daten
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
  
        scales: {
            y: {
                suggestedMin: -2,
                suggestedMax: 2
            }
        },
    
          datasets: {
            line: {
              pointRadius: 0 // disable for all `'line'` datasets
            }
          }
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