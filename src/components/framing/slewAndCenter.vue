<template>
  <div class="container flex items-center justify-center">
    <div class="container max-w-md">
      <h5 class="text-xl font-bold text-white mb-4">{{ $t('components.slewAndCenter.title') }}</h5>

      <div
        v-if="store.profileInfo.FramingAssistantSettings.LastSelectedImageSource !== 'SKYATLAS'"
        class="flex justify-center items-center pb-2"
      >
        <div class="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p class="text-red-400 text-center font-medium">
            {{ $t('components.slewAndCenter.LastSelectedImageSource_wrong') }}
          </p>
        </div>
      </div>
      <div v-else>
        <!-- Star Selection Dropdown -->
        <div class="mb-4">
          <label for="visibleStars" class="block text-white text-sm font-bold mb-2">{{
            $t('components.slewAndCenter.visibleStars')
          }}</label>
          <select
            id="visibleStars"
            v-model="selectedStar"
            class="text-black w-full p-2 border border-gray-300 rounded"
            @change="updateRaDec"
          >
            <option v-for="star in visibleStars" :key="star.name" :value="star">
              {{ star.name }} (Mag: {{ star.magnitude }})
            </option>
          </select>
        </div>

        <div class="flex flex-row justify-center items-center space-x-4">
          <p>{{ $t('components.slewAndCenter.ra') }}</p>
          <input
            type="text"
            v-model="localRAangleString"
            @blur="handleBlurRA"
            @keyup.enter="handleBlurRA"
            class="text-black w-full p-2 border border-gray-300 rounded"
            :placeholder="$t('components.slewAndCenter.ra_placeholder')"
          />
          <p>{{ $t('components.slewAndCenter.dec') }}</p>
          <input
            type="text"
            v-model="localDECangleString"
            @blur="handleBlurDEC"
            @keyup.enter="handleBlurDEC"
            class="text-black w-full p-2 border border-gray-300 rounded"
            :placeholder="$t('components.slewAndCenter.dec_placeholder')"
          />
        </div>
        <div class="mt-4 flex gap-2">
          <button
            @click="slew"
            :disabled="
              framingStore.isSlewing ||
              framingStore.isSlewingAndCentering ||
              framingStore.isRotating
            "
            class="default-button-cyan flex items-center justify-center disabled:opacity-50"
          >
            <span v-if="framingStore.isSlewing" class="loader mr-2"></span>
            {{ $t('components.slewAndCenter.slew') }}
          </button>

          <button
            @click="slewAndCenter"
            :disabled="
              framingStore.isSlewing ||
              framingStore.isSlewingAndCentering ||
              framingStore.isRotating
            "
            class="default-button-cyan flex items-center justify-center disabled:opacity-50"
          >
            <span v-if="framingStore.isSlewingAndCentering" class="loader mr-2"></span>
            {{ $t('components.slewAndCenter.slew_and_center') }}
          </button>
        </div>
        <div v-if="store.rotatorInfo.Connected && true" class="mt-2">
          <button
            @click="cameraRotate"
            :disabled="
              framingStore.isSlewing ||
              framingStore.isSlewingAndCentering ||
              framingStore.isRotating
            "
            class="default-button-cyan flex items-center justify-center disabled:opacity-50"
          >
            <span v-if="framingStore.isRotating" class="loader mr-2"></span>
            {{ $t('components.slewAndCenter.rotate') }}
          </button>
        </div>
        <div class="w-full">
          <setSequenceTarget class="mt-3" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import Papa from 'papaparse';
import apiService from '@/services/apiService';
import { apiStore } from '@/store/store';
import { useFramingStore } from '@/store/framingStore';
import { useI18n } from 'vue-i18n';
import setSequenceTarget from '@/components/framing/setSequenceTarget.vue';

const { t } = useI18n();
const store = apiStore();
const framingStore = useFramingStore();
const props = defineProps({
  RAangleString: String,
  DECangleString: String,
});
const emit = defineEmits(['update:RAangleString', 'update:DECangleString']);

const stars = ref([]);
const selectedStar = ref(null);
const localRAangleString = ref(props.RAangleString);
const localDECangleString = ref(props.DECangleString);
const RAangle = ref(null);
const DECangle = ref(null);
const Info = ref(null);

// Tokyo coordinates
const latitude = ref(35.69);
const longitude = ref(139.69);
const currentSiderealTime = ref(0);

// Computed property to filter visible stars
const visibleStars = computed(() => {
  return stars.value.filter((star) => {
    const hourAngle = (currentSiderealTime.value - star.raDeg + 360) % 360;
    const alt = calculateAltitude(star.decDeg, hourAngle);
    return alt > 0;
  });
});

watch(
  () => framingStore.RAangleString,
  (newValue) => {
    localRAangleString.value = newValue;
  }
);
watch(
  () => framingStore.DECangleString,
  (newValue) => {
    localDECangleString.value = newValue;
  }
);

function validateRA(raString) {
  const raPattern = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):(60(\.0+)?|[0-5]?[0-9](\.\d+)?)$/;
  return raPattern.test(raString);
}

function validateDEC(decString) {
  const decPattern = /^(\+|-)?(90:00:00(\.0+)?|([0-8]?[0-9]):([0-5]?[0-9]):([0-5][0-9](\.\d+)?))$/;
  return decPattern.test(decString);
}

function handleBlurRA() {
  if (!localRAangleString.value) {
    return;
  }
  if (validateRA(localRAangleString.value)) {
    updateRA();
  } else {
    alert(t('components.slewAndCenter.errors.invalidRAInput'));
  }
}

function handleBlurDEC() {
  if (!localDECangleString.value) {
    return;
  }
  if (validateDEC(localDECangleString.value)) {
    console.log('Lokal DEC', localDECangleString.value);
    updateDec();
  } else {
    alert(t('components.slewAndCenter.errors.invalidDECInput'));
  }
}

function updateRA() {
  framingStore.RAangle = hmsToDegrees(localRAangleString.value);
}

function updateDec() {
  framingStore.DECangle = dmsToDegrees(localDECangleString.value);
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function unparkMount() {
  if (store.mountInfo.AtPark) {
    try {
      await apiService.mountAction('unpark');
      await wait(2000);
      console.log(t('components.mount.control.unpark'));
    } catch (error) {
      console.log(t('components.mount.control.errors.unpark'));
    }
  }
}

async function slew() {
  await unparkMount();
  RAangle.value = hmsToDegrees(localRAangleString.value);
  DECangle.value = dmsToDegrees(localDECangleString.value);
  framingStore.slew(RAangle.value, DECangle.value);
}

async function slewAndCenter() {
  RAangle.value = hmsToDegrees(localRAangleString.value);
  DECangle.value = dmsToDegrees(localDECangleString.value);
  await unparkMount();
  framingStore.slewAndCenter(RAangle.value, DECangle.value);
  emit('update:RAangleString', localRAangleString.value);
  emit('update:DECangleString', localDECangleString.value);
}

async function cameraRotate() {
  framingStore.cameraRotate();
}

function hmsToDegrees(hmsString) {
  const parts = hmsString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);
  return hours * 15 + minutes * (15 / 60) + seconds * (15 / 3600);
}

function dmsToDegrees(dmsString) {
  const sign = dmsString.startsWith('-') ? -1 : 1;
  const stripped = dmsString.replace('-', '');
  const parts = stripped.split(':');

  if (parts.length !== 3) {
    throw new Error(t('components.slewAndCenter.errors.invalidFormat'));
  }

  const degrees = parseFloat(parts[0]);
  const minutes = parseFloat(parts[1]);
  const seconds = parseFloat(parts[2]);

  return sign * (degrees + minutes / 60 + seconds / 3600);
}

async function fetchInfo() {
  try {
    const response = await apiService.framingAction('info');
    if (response.Success) {
      Info.value = response.Response;
    } else {
      console.error(t('components.slewAndCenter.errors.apiResponseError'), response.Error);
    }
  } catch (error) {
    console.error(t('components.slewAndCenter.errors.mountInfoError'), error);
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
  await loadStarData();
  startFetchingInfo();
  await apiService.applicatioTabSwitch('framing');
  await apiService.setFramingImageSource('SKYATLAS');
  updateSiderealTime();
  setInterval(updateSiderealTime, 1000);
});

onBeforeUnmount(() => {
  stopFetchingInfo();
});

async function loadStarData() {
  try {
    const response = await fetch('/stars.csv');
    const csvData = await response.text();

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        stars.value = results.data.map((star) => ({
          name: star.name,
          magnitude: parseFloat(star.magnitude),
          ra: formatRA(star.ra),
          dec: formatDEC(star.dec),
          raDeg: convertRAtoDegrees(star.ra),
          decDeg: convertDECtoDegrees(star.dec),
        }));
      },
    });
  } catch (error) {
    console.error('Error loading star data:', error);
  }
}

function formatRA(ra) {
  const matches = ra.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
  if (!matches) return '00:00:00.0';
  return `${matches[1].padStart(2, '0')}:${matches[2].padStart(2, '0')}:${matches[3].padStart(5, '0')}`;
}

function formatDEC(dec) {
  const matches = dec.match(/([+-]?)(\d+)°\s*(\d+)′\s*([\d.]+)″/);
  if (!matches) return '+00:00:00.0';
  return `${matches[1]}${matches[2].padStart(2, '0')}:${matches[3].padStart(2, '0')}:${matches[4].padStart(5, '0')}`;
}

function convertRAtoDegrees(ra) {
  const matches = ra.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
  return (
    15 *
    ((parseInt(matches[1]) || 0) +
      (parseInt(matches[2]) || 0) / 60 +
      (parseFloat(matches[3]) || 0) / 3600)
  );
}

function convertDECtoDegrees(dec) {
  const matches = dec.match(/([+-]?)(\d+)°\s*(\d+)′\s*([\d.]+)″/);
  const sign = matches[1] === '-' ? -1 : 1;
  return (
    sign *
    ((parseInt(matches[2]) || 0) +
      (parseInt(matches[3]) || 0) / 60 +
      (parseFloat(matches[4]) || 0) / 3600)
  );
}

function calculateAltitude(decDeg, hourAngleDeg) {
  const latRad = (latitude.value * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;
  const haRad = (hourAngleDeg * Math.PI) / 180;

  return (
    (Math.asin(
      Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad)
    ) *
      180) /
    Math.PI
  );
}

function updateSiderealTime() {
  const now = new Date();
  const JD = now / 86400000 - now.getTimezoneOffset() / 1440 + 2440587.5;
  const GMST = 18.697374558 + 24.06570982441908 * (JD - 2451545.0);
  currentSiderealTime.value = (GMST % 24) * 15 + longitude.value / 15;
}

function updateRaDec() {
  if (selectedStar.value) {
    localRAangleString.value = selectedStar.value.ra;
    localDECangleString.value = selectedStar.value.dec;
    updateRA();
    updateDec();
  }
}
</script>

<style scoped>
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
