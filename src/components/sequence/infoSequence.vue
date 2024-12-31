<template>
    <div class="p-4">
      <!-- Schleife über die Haupt-Container (store.response) -->
      <div
        v-for="(container, containerIndex) in store.sequenceInfo"
        :key="containerIndex"
        class="border border-gray-400 rounded-md mb-4 p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-bold ">{{ container.Name }}</h2>
          <span :class="statusColor(container.Status)">
            {{ container.Status }}
          </span>
        </div>
  
        <!-- Wenn Unterelemente (Items) vorhanden sind, zeige die rekursive Komponente -->
        <div v-if="container.Items && container.Items.length" class="pl-4">
          <RecursiveItem :items="container.Items" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { apiStore } from '@/store/store';

  import RecursiveItem from './RecursiveItem.vue'
  
   const store = apiStore();

  function statusColor(status) {
    switch (status) {
      case 'FINISHED':
        return 'text-green-600'
      case 'RUNNING':
        return 'text-blue-600'
      case 'CREATED':
        return 'text-yellow-500'
      case 'SKIPPED':
        return 'text-gray-400'
      default:
        return 'text-white'
    }
  }
  </script>
  
  <style scoped>

  </style>
  