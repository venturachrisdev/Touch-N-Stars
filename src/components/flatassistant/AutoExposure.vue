<template></template>
<script setup>
import { onMounted } from 'vue';
import apiService from '@/services/apiService';
import { apiStore } from '@/store/store';
import { useFlatassistantStore } from '@/store/flatassistantStore';
import { useCameraStore } from '@/store/cameraStore';

const store = apiStore();
const flatsStore = useFlatassistantStore();
const cameraStore = useCameraStore();

onMounted(() => {
  flatsStore.count = store.profileInfo.FlatWizardSettings.FlatCount;
  flatsStore.minExposureTime = store.profileInfo.CameraSettings.MinFlatExposureTime;
  flatsStore.maxExposureTime = store.profileInfo.CameraSettings.MaxFlatExposureTime;
  flatsStore.histogramMean = store.profileInfo.FlatWizardSettings.HistogramMeanTarget;
  flatsStore.meanTolerance = store.profileInfo.FlatWizardSettings.HistogramTolerance;
  flatsStore.binning = cameraStore.binningMode;
  flatsStore.gain = cameraStore.gain;
  flatsStore.offset = cameraStore.offset;
});

async function startAutoExposure() {
  console.log('Flats startAutoExposure: ');
  try {
    const data = await apiService.flatAutoExposure(
      flatsStore.count,
      flatsStore.minExposureTime,
      flatsStore.maxExposureTime,
      flatsStore.histogramMean,
      flatsStore.meanTolerance,
      flatsStore.binning,
      flatsStore.gain,
      flatsStore.offset
    );
    console.log(data);
  } catch (error) {
    console.log('Error startAutoExposure');
  }
}
</script>
