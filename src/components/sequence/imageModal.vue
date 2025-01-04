<template>
    <!-- Nur anzeigen, wenn showModal true ist -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Halbtransparenter Overlay-Hintergrund -->
      <div class="absolute inset-0 bg-black bg-opacity-70" @click="closeModal"></div>
      
      <!-- Inhalt der Modal -->
      <div class="relative max-w-4xl p-4 bg-gray-900 rounded shadow-lg z-50">
        <button 
          class="absolute top-2 right-2 text-white hover:text-gray-300"
          @click="closeModal"
        >
          ✕
        </button>
        <img 
          v-if="imageData"
          :src="imageData" 
          class="block mx-auto max-h-screen object-contain"
          alt="Vergrößertes Bild"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  /* eslint-disable */
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    showModal: {
      type: Boolean,
      default: false,
    },
    imageData: {
      type: String,
      default: null,
    },
  });
  
  const emits = defineEmits(['close']);
  
  /**
   * Schließt die Modal, indem ein "close"-Event emittiert wird
   */
  function closeModal() {
    emits('close');
  }
  </script>
  
  <style scoped>

  </style>
  