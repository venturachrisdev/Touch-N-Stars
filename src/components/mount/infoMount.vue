<template>
    <div v-if="!store.mountInfo.Connected" class="text-red-500">
      <p>{{ $t('components.mount.info.notConnected') }}</p>
    </div>
    <div v-else class="gap-2">
      <StatusBool 
        :isEnabled="!store.mountInfo.AtPark" 
        :enabledText="$t('components.mount.info.unparked')" 
        :disabledText="$t('components.mount.info.parked')" />
      <StatusBool 
        :isEnabled="store.mountInfo.TrackingEnabled" 
        :enabledText="$t('components.mount.info.trackingActive')" 
        :disabledText="$t('components.mount.info.trackingDisabled')" />
      <StatusBool 
        :isEnabled="store.mountInfo.Slewing" 
        :enabledText="$t('components.mount.info.slewing')" 
        :disabledText="$t('components.mount.info.notSlewing')" />
    </div>
</template>

<script setup>
import StatusBool from '@/components/helpers/StatusBool.vue';
import { apiStore } from '@/store/store';
const store = apiStore();

defineProps({
  modelValue: Boolean,
});
</script>
