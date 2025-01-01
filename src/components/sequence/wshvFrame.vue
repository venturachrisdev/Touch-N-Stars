<template>
  <div class="flex justify-center items-center w-full h-screen bg-gray-100">
    <iframe
      :src="src"
      class="w-full h-full max-w-screen max-h-screen border border-gray-300"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// Definiere ein Prop für die URL
defineProps({
  src: {
    type: String, // Der Typ ist ein String
    required: true, // Dieses Prop ist erforderlich
  },
});
</script>

<style>
/* Keine zusätzlichen Styles notwendig, da Tailwind CSS verwendet wird */
</style>
