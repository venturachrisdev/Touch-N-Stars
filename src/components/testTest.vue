<template>
    <div class="container ">
        <h1>Test</h1>
        <img v-if="store.imageData" ref="image" :src="store.imageData" alt="Aufgenommenes Bild" class="block" />

       
       
    </div>
</template>

<script setup>

import { apiStore } from '@/store/store';


const store = apiStore();

</script>