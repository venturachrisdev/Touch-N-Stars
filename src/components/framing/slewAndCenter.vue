<template>
    <div class="container flex items-center justify-center">
      <div class="container max-w-md">
        <h5 class="text-xl font-bold text-white mb-4">{{ $t('components.framing.slewAndCenter.title') }}</h5>
        <div class="flex flex-row justify-center items-center space-x-4">
          <p>{{ $t('components.framing.slewAndCenter.ra') }}</p>
          <input
            type="text"
            v-model="localRAangleString"
            @blur="handleBlurRA"
            @keyup.enter="handleBlurRA"
            class="text-black w-full p-2 border border-gray-300 rounded"
            placeholder="RA 03:47:28.2"
          />
          <p>{{ $t('components.framing.slewAndCenter.dec') }}</p>
          <input
            type="text"
            v-model="localDECangleString"
            @blur="handleBlurDEC"
            @keyup.enter="handleBlurDEC"
            class="text-black w-full p-2 border border-gray-300 rounded"
            placeholder="Dec +24:06:19"
          />
        </div>
        <div class="mt-4 grid sm:grid-cols-2 space-y-2 sm:space-x-2 sm:space-y-0">
          <button @click="slew" class="default-button-cyan">
            {{ $t('components.framing.slewAndCenter.slew') }}
          </button>
          <button @click="slewAndCenter" class="default-button-cyan">
            {{ $t('components.framing.slewAndCenter.slewAndCenter') }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  /* eslint-disable */ 
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
  import apiService from "@/services/apiService";
  import { useI18n } from 'vue-i18n';
  
  const { t } = useI18n();
  
  const props = defineProps({
    RAangleString: String,
    DECangleString: String
  });
  
  const emit = defineEmits(["update:RAangleString", "update:DECangleString"]);
  
  const localRAangleString = ref(props.RAangleString);
  const localDECangleString = ref(props.DECangleString);
  const RAangle = ref(null);
  const DECangle = ref(null);
  const Info = ref(null);
  
  watch(() => props.RAangleString, (newValue) => {
    localRAangleString.value = newValue;
  });
  watch(() => props.DECangleString, (newValue) => {
    localDECangleString.value = newValue;
  });
  
  function validateRA(raString) {
    const raPattern = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9](\.\d+)?)$/;
    return raPattern.test(raString);
  }
  
  function validateDEC(decString) {
    const decPattern = /^(\+|-)?(90|[0-8]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9](\.\d+)?)$/;
    return decPattern.test(decString);
  }
  
  function checkValidity() {
    const isRAValid = validateRA(localRAangleString.value);
    const isDECValid = validateDEC(localDECangleString.value);
  
    if (!isRAValid) {
      alert(t('components.framing.slewAndCenter.errors.invalidRAFormat'));
    }
    if (!isDECValid) {
      alert(t('components.framing.slewAndCenter.errors.invalidDECFormat'));
    }
  
    return isRAValid && isDECValid;
  }
  
  function handleBlurRA() {
    if (validateRA(localRAangleString.value)) {
      updateRA();
    } else {
      alert(t('components.framing.slewAndCenter.errors.invalidRAInput'));
    }
  }
  
  function handleBlurDEC() {
    if (validateDEC(localDECangleString.value)) {
      updateDec();
    } else {
      alert(t('components.framing.slewAndCenter.errors.invalidDECInput'));
    }
  }
  
  function updateRA() {
    emit("update:RAangleString", localRAangleString.value);
  }
  
  function updateDec() {
    emit("update:DECangleString", localDECangleString.value);
  }
  
  async function slew() {
    RAangle.value = hmsToDegrees(localRAangleString.value);
    DECangle.value = dmsToDegrees(localDECangleString.value);
    try {
      await apiService.slewAndCenter(RAangle.value, DECangle.value, false);
    } catch (error) {
      console.error(t('components.framing.slewAndCenter.errors.apiUnreachable'), error);
    }
  }
  
  async function slewAndCenter() {
    RAangle.value = hmsToDegrees(localRAangleString.value);
    DECangle.value = dmsToDegrees(localDECangleString.value);
    try {
      await apiService.slewAndCenter(RAangle.value, DECangle.value, true);
    } catch (error) {
      console.error(t('components.framing.slewAndCenter.errors.apiUnreachable'), error);
    }
    emit("update:RAangleString", localRAangleString.value);
    emit("update:DECangleString", localDECangleString.value);
  }
  
  function hmsToDegrees(hmsString) {
    const parts = hmsString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 15 + minutes * (15 / 60) + seconds * (15 / 3600);
  }
  
  function dmsToDegrees(dmsString) {
    const sign = dmsString.startsWith("-") ? -1 : 1;
    const stripped = dmsString.replace("-", "");
    const parts = stripped.split(":");
  
    if (parts.length !== 3) {
      throw new Error(t('components.framing.slewAndCenter.errors.invalidFormat'));
    }
  
    const degrees = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
  
    return sign * (degrees + minutes / 60 + seconds / 3600);
  }
  
  async function fetchInfo() {
    try {
      const response = await apiService.framingAction("info");
      if (response.Success) {
        Info.value = response.Response;
      } else {
        console.error(t('components.framing.slewAndCenter.errors.apiResponseError'), response.Error);
      }
    } catch (error) {
      console.error(t('components.framing.slewAndCenter.errors.mountInfoError'), error);
    }
  }
  
  let intervalId = null;
  
  function startFetchingInfo() {
    fetchInfo();
    intervalId = setInterval(() => fetchInfo(), 1000);
  }
  
  function stopFetchingInfo() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
  
  onMounted(async () => {
    startFetchingInfo();
    await apiService.applicatioTabSwitch("framing");
  });
  
  onBeforeUnmount(() => {
    stopFetchingInfo();
  });
  </script>
