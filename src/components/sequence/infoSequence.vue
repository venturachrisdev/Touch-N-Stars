<template>
  <div class="p-4 space-y-4">
    <!-- Schleife über die Haupt-Container (store.response) -->
    <div v-for="(container, containerIndex) in store.sequenceInfo" :key="containerIndex"
      class="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg mb-4 p-6 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <button 
            @click="store.toggleCollapsedState(container.Name)"
            class="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            :title="store.isCollapsed(container.Name) ? 'Expand' : 'Collapse'"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-90': store.isCollapsed(container.Name) }"
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <h2 class="font-bold text-xl text-gray-100">{{ container.Name }}</h2>
        </div>
        <span :class="`${statusColor(container.Status)} font-medium px-3 py-1 rounded-full bg-opacity-20`">
          {{ container.Status }}
        </span>
      </div>

      <div 
        v-if="!store.isCollapsed(container.Name)"
        class="overflow-hidden transition-all duration-300 ease-in-out"
      >

        <!-- Wenn Unterelemente (Items) vorhanden sind, zeige die rekursive Komponente -->
        <div v-if="container.Items && container.Items.length" class="pl-4 mt-4">
          <RecursiveItem :items="container.Items" />
        </div>
        
        <div v-if="container.GlobalTriggers && container.GlobalTriggers.length" class="pl-4 mt-4">
          <RecursiveItem :items="container.GlobalTriggers" />
        </div>
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
      return 'bg-green-500 text-green-100'
    case 'RUNNING':
      return 'bg-blue-500 text-blue-100'
    case 'CREATED':
      return 'bg-yellow-500 text-yellow-100'
    case 'SKIPPED':
      return 'bg-gray-500 text-gray-100'
    default:
      return 'bg-gray-600 text-gray-100'
  }
}

</script>

<style scoped></style>
