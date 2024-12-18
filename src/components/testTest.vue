<template>
    <div>
        <h1>Test</h1>

        <button @click="store.startFetchingInfo">start</button>
        <p></p>
        <button @click="store.stopFetchingInfo">stop</button>
        <div>
            <p>{{ store.cameraInfo.Temperature }}</p>
        </div>
    </div>
</template>

<script setup>
import { apiStore } from '@/store/store';
const store = apiStore();

</script>