<template>
  <div v-if="!store.rotatorInfo.Connected" class="text-red-500">
    <p>{{ $t('components.rotator.notConnected') }}</p>
  </div>
  <div v-else class="gap-2">
    <StatusString
      :isEnabled="store.rotatorInfo.MechanicalPosition !== null"
      :Name="$t('components.rotator.currentPosition')"
      :Value="store.rotatorInfo.MechanicalPosition"
    />
    <StatusBool
      :isEnabled="store.rotatorInfo.IsMoving"
      :enabledText="$t('components.rotator.moving')"
    />
  </div>
</template>

<script setup>
//import { computed } from 'vue';
import StatusBool from '@/components/helpers/StatusBool.vue';
import StatusString from '@/components/helpers/StatusString.vue';
import { apiStore } from '@/store/store';
const store = apiStore();
</script>
