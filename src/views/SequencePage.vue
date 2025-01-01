<template>
  <div class="container ">
    <h1 class="text-xl text-center font-bold mb-5">Sequenz</h1>

    <controlSequence />
    <infoSequence />
    <wshvFrame v-if="false"/>
    


  </div>
</template>

<script setup>

import infoSequence from '@/components/sequence/infoSequence.vue';
import controlSequence from '@/components/sequence/controlSequence.vue';
import wshvFrame from '@/components/sequence/wshvFrame.vue';

</script>