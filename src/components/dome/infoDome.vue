<template>
  <div v-if="!store.domeInfo.Connected" class="text-red-500">
    <p>{{$t('components.dome.please_connect_dome')}}</p>
  </div>
  <div v-else class="gap-2">
      <StatusString :isEnabled="store.domeInfo.Azimuth !== undefined && !isNaN(store.domeInfo.Azimuth)" :Name="$t('components.focuser.azimuth')" :Value="store.focuserInfo.Azimuth" />
      <StatusBool :isEnabled="store.focuserInfo.IsMoving" :enabledText="$t('components.focuser.moving')" :disabledText="$t('components.focuser.stopped')" />
 />    
  </div>
</template>

<script setup>

import StatusBool from '@/components/helpers/StatusBool.vue';
import StatusString from '@/components/helpers/StatusString.vue';
import { apiStore } from '@/store/store';

const store = apiStore();


</script>
