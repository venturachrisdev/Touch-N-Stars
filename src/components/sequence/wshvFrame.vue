<template>
  <div class="flex justify-center items-center w-full h-screen bg-gray-100">
    <iframe
      :src="iframeSrc"
      class="w-full h-full max-w-screen max-h-screen border border-gray-300"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>
  <script setup>
  const iframeSrc = "http://192.168.2.129:5001/dist"; // URL für das iframe
  </script>
  
  <style>
  /* Keine zusätzlichen Styles notwendig, da Tailwind CSS verwendet wird */
  </style>