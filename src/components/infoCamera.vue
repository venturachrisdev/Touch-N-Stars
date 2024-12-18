<template>

  <div v-if="!store.cameraInfo.Connected" class="text-red-500">
    <p>Bitte Kamera verbinden</p>
  </div>
  <div v-else-if="showAllInfo" class="gap-2">
    <StatusString :isEnabled="store.cameraInfo.Name" Name="Name:" :Value="store.cameraInfo.Name" />
    <StatusString :isEnabled="store.cameraInfo.Gain" Name="Gain:" :Value="store.cameraInfo.Gain" />
    <StatusString :isEnabled="store.cameraInfo.Offset" Name="Offset:" :Value="store.cameraInfo.Offset" />
    <StatusString :isEnabled="store.cameraInfo.XSize" Name="X-Size:" :Value="store.cameraInfo.XSize" />
    <StatusString :isEnabled="store.cameraInfo.YSize" Name="Y-Size:" :Value="store.cameraInfo.YSize" />
    <StatusString :isEnabled="store.cameraInfo.PixelSize" Name="Pixel-Size:" :Value="store.cameraInfo.PixelSize" />
    <StatusString :isEnabled="store.cameraInfo.CanSetTemperature" Name="Aktuelle Temperatur:"
      :Value="store.cameraInfo.Temperature" />
    <StatusBool class="col-start-1" :isEnabled="store.cameraInfo.IsExposing" enabledText="Aufnahme läuft"
      disabledText="Kamera standby" />
    <StatusBool v-if="store.cameraInfo.CanSetTemperature" :isEnabled="store.cameraInfo.CoolerOn"
      enabledText="Kühler aktiv" disabledText="Kühler aus" />
    <StatusBool v-if="store.cameraInfo.CanSetTemperature" :isEnabled="store.cameraInfo.DewHeaterOn"
      enabledText="Tauheizung aktiv" disabledText="Tauheizung aus" />
  </div>
  <div v-else-if="showOnlyExposing" class="gap-2">
    <StatusBool :isEnabled="IsExposing" enabledText="Aufnahme läuft" disabledText="Kamera standby" />
  </div>
</template>

<script setup>
import StatusBool from '../components/StatusBool.vue';
import StatusString from '../components/StatusString.vue';
import { apiStore } from '@/store/store';

// Props deklarieren
defineProps({
  showAllInfo: Boolean,
  showOnlyExposing: Boolean,
});

const store = apiStore();


</script>