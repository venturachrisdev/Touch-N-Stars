<template>
  <div>
    <p>
      {{ $t('components.flatassistant.completed_recordings') }}
      {{ flatassistantStore.status.CompletedIterations }}
    </p>
  </div>
</template>
<script setup>
import { useFlatassistantStore } from '@/store/flatassistantStore';
import { onMounted, onBeforeUnmount } from 'vue';

const flatassistantStore = useFlatassistantStore();

onMounted(() => {
  flatassistantStore.startFetchingFlats();
});

onBeforeUnmount(() => {
  flatassistantStore.stopFetchingFlats();
});
</script>
