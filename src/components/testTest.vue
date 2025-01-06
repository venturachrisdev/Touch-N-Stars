<template>
    <div>

    <SubNav :links="subnavLinks" />
    <infoDome :links="subnavLinks" />

  </div>


</template>

<script setup>
import SubNav from './SubNav.vue';
import infoDome from './dome/infoDome.vue';
const subnavLinks = [
  { name: 'Overview', path: '/section/overview' },
  { name: 'Details', path: '/section/details' },
  { name: 'Settings', path: '/section/settings' }
];

</script>
