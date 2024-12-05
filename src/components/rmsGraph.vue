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
      ...mapGetters(['rmsValuesRA', 'rmsValuesDec', 'rmsValuesTotal']),
    },
    mounted() {
      this.initGraph();
  
      // Starte das regelmäßige Abrufen der Daten
      this.$store.dispatch('startFetching');
  
      // Beobachte Vuex-Datenänderungen
      this.$watch(
        () => [this.rmsValuesRA.slice(), this.rmsValuesDec.slice(), this.rmsValuesTotal.slice()],
        ([newRA, newDec, newTotal]) => {
          this.updateGraph(newRA, newDec, newTotal);
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
                label: 'RMS RA',
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                data: [], // Start ohne Daten
              },
              {
                label: 'RMS Dec',
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                data: [], // Start ohne Daten
              },
              {
                label: 'RMS Total',
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                data: [], // Start ohne Daten
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      },
      updateGraph(newRA, newDec, newTotal) {
        if (this.chart) {
          // Update Graph-Daten ohne direkte Bindung an Vuex
          this.chart.data.datasets[0].data = [...newRA];
          this.chart.data.datasets[1].data = [...newDec];
          this.chart.data.datasets[2].data = [...newTotal];
          this.chart.update(); // Aktualisiere den Graphen
        }
      },
    },
  };
  </script>
  