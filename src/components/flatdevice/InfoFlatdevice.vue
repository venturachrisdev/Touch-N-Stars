<template>
  <div v-if="!store.flatdeviceInfo.Connected" class="text-red-500">
    <p>{{ $t('components.flat.please_connect_flatDevice') }}</p>
  </div>
  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
    <StatusString
      :isEnabled="store.flatdeviceInfo.Name !== undefined"
      :Name="$t('components.flat.device_name')"
      :Value="store.flatdeviceInfo.Name"
    />
    <StatusString
      :isEnabled="store.flatdeviceInfo.LocalizedCoverState !== undefined"
      :Name="$t('components.flat.cover_state')"
      :Value="store.flatdeviceInfo.LocalizedCoverState"
    />
    <StatusString
      :isEnabled="store.flatdeviceInfo.LocalizedLightOnState !== undefined"
      :Name="$t('components.flat.light_state')"
      :Value="store.flatdeviceInfo.LocalizedLightOnState"
    />
    <StatusString
      :isEnabled="
        store.flatdeviceInfo.Brightness !== undefined && !isNaN(store.flatdeviceInfo.Brightness)
      "
      :Name="$t('components.flat.brightness')"
      :Value="store.flatdeviceInfo.Brightness"
    />
  </div>
</template>

<script setup>
import StatusString from '@/components/helpers/StatusString.vue';
import { apiStore } from '@/store/store';

const store = apiStore();
</script>
