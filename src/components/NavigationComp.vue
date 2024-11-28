<template>
  <div
    :class="{
      'fixed top-0 left-0 w-full h-16 flex justify-around': isPortrait, /* Horizontale Navigation */
      'fixed top-0 right-0 w-16 h-full flex flex-col items-center': !isPortrait /* Vertikale Navigation */
    }"
    class="bg-gray-800 shadow-md"
  >
    <router-link to="/equipment" class="nav-button" title="Ausrüstung">
      <HomeIcon class="icon" />
    </router-link>
    <router-link to="/camera" class="nav-button" title="Kamera">
      <CameraIcon class="icon" />
    </router-link>
    <router-link to="/tppa" class="nav-button" title="TPPA">
      <MapIcon class="icon" />
    </router-link>
    <router-link to="/autofocus" class="nav-button" title="Autofokus">
      <AdjustmentsHorizontalIcon class="icon" />
    </router-link>
    <router-link to="/sequencer" class="nav-button" title="Sequenzer">
      <Squares2X2Icon class="icon" />
    </router-link>
    <router-link to="/misc" class="nav-button" title="Sonstiges">
      <Cog6ToothIcon class="icon" />
    </router-link>
  </div>
</template>

<script>
import {
  HomeIcon,
  CameraIcon,
  MapIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline';

export default {
  components: {
    HomeIcon,
    CameraIcon,
    MapIcon,
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    Cog6ToothIcon,
  },
  data() {
    return {
      isPortrait: window.matchMedia('(orientation: portrait)').matches,
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isPortrait = window.matchMedia('(orientation: portrait)').matches;
    },
  },
};
</script>

<style scoped>
.nav-button {
  @apply w-12 h-12 bg-gray-700 text-white rounded-full hover:bg-gray-600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
}
.icon {
  @apply w-6 h-6;
}
</style>
