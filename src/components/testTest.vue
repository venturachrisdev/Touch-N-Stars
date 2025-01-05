<template>
    <div>

    <SubNav :links="subnavLinks" />

  </div>


</template>

<script setup>
import SubNav from './SubNav.vue';
const subnavLinks = [
  { name: 'Overview', path: '/section/overview' },
  { name: 'Details', path: '/section/details' },
  { name: 'Settings', path: '/section/settings' }
];
</script>
