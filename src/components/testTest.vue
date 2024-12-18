<template>
    <div>
        <h1>Test</h1>
        <p>{{ store.age }}</p>
        <p>{{ name }}</p>
        <button @click="store.testFunktion">klick</button>
        <p>a</p>
        <button @click="store.startFetchingInfo">start</button>
        <button @click="store.stopFetchingInfo">stop</button>
        <div>
            <p>{{ store.Temperature }}</p>
        </div>
    </div>
</template>

<script setup>
//import { inject } from 'vue';
import { apiStore } from '@/store/store';

const store = apiStore();
const name = "huhu";
console.log(store);
</script>