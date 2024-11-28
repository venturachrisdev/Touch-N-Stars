<template>
  <div :class="navClass">
    <router-link
      to="/equipment"
      class="nav-button"
      :class="{ 'active-button': $route.path === '/equipment' }"
      title="Ausrüstung"
    >
      <HomeIcon class="icon w-6 h-6" />
    </router-link>
    <router-link
      to="/camera"
      class="nav-button"
      :class="{ 'active-button': $route.path === '/camera' }"
      title="Kamera"
    >
      <CameraIcon class="icon w-6 h-6" />
    </router-link>
    <router-link
      to="/tppa"
      class="nav-button"
      :class="{ 'active-button': $route.path === '/tppa' }"
      title="TPPA"
    >
      <MapIcon class="icon w-6 h-6" />
    </router-link>
    <router-link
      to="/autofocus"
      class="nav-button"
      :class="{ 'active-button': $route.path === '/autofocus' }"
      title="Autofokus"
    >
      <CubeIcon class="icon w-6 h-6" />
    </router-link>
    <router-link
      to="/sequencer"
      class="nav-button"
      :class="{ 'active-button': $route.path === '/sequencer' }"
      title="Sequenzer"
    >
      <EyeIcon class="icon w-6 h-6" />
    </router-link>
    <router-link
      to="/misc"
      class="nav-button"
      :class="{ 'active-button': $route.path === '/misc' }"
      title="Sonstiges"
    >
      <CogIcon class="icon w-6 h-6" />
    </router-link>
  </div>
</template>

  
  <script>
import {
  HomeIcon,
  CameraIcon,
  MapIcon,
  CubeIcon,
  EyeIcon,
  CogIcon,
} from '@heroicons/vue/24/outline';

export default {
  components: {
    HomeIcon,
    CameraIcon,
    MapIcon,
    EyeIcon,
    CubeIcon,
    CogIcon,
  },
  data() {
    return {
      isPortrait: window.matchMedia("(orientation: portrait)").matches,
    };
  },
  computed: {
    navClass() {
      return this.isPortrait
        ? 'flex justify-around p-2 bg-gray-800'
        : 'flex flex-col items-center p-2 bg-gray-800 fixed right-0 top-0 h-full';
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isPortrait = window.matchMedia("(orientation: portrait)").matches;
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
  transition: all 0.1s ease-in-out;
}

.active-button {
  @apply rounded-md bg-gray-600; /* Eckig und eine dunklere Farbe */
}
</style>

  