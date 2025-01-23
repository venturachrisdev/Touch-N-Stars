<template>
  <div v-for="ReadonlySwitche in store.switchInfo.ReadonlySwitches">
    <div
      class="flex flex-row items-center justify-between w-full border border-gray-500 p-2 pl-5 pr-5 rounded-full"
    >
      <div>
        <p>{{ ReadonlySwitche.Name }}</p>
        <p class="text-xs italic text-gray-500">{{ ReadonlySwitche.Description }}</p>
      </div>
      <div>
        <strong>{{ ReadonlySwitche.Value }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { apiStore } from '@/store/store';

const store = apiStore();
</script>
