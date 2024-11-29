<template>
  <div
    class="top-0 h-16 bg-gray-800 shadow-md"
  >
  <div class="inset-x-0 mx-auto max-w-sm h-16 flex items-center justify-around">
    <router-link
      to="/equipment"
      class="nav-button"
      active-class="active-nav-button"
      title="Ausrüstung"
    >
      <HomeIcon class="icon" />
    </router-link>
    <router-link
      to="/camera"
      class="nav-button"
      active-class="active-nav-button"
      title="Kamera"
    >
      <CameraIcon class="icon" />
    </router-link>
    <router-link
      to="/tppa"
      class="nav-button"
      active-class="active-nav-button"
      title="TPPA"
    >
      <MapIcon class="icon" />
    </router-link>
    <router-link
      to="/autofocus"
      class="nav-button"
      active-class="active-nav-button"
      title="Autofokus"
    >
      <AdjustmentsHorizontalIcon class="icon" />
    </router-link>
    <router-link
      to="/sequencer"
      class="nav-button"
      active-class="active-nav-button"
      title="Sequenzer"
    >
      <Squares2X2Icon class="icon" />
    </router-link>
    <router-link
      to="/misc"
      class="nav-button"
      active-class="active-nav-button"
      title="Sonstiges"
    >
      <Cog6ToothIcon class="icon" />
    </router-link>
  </div>
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
 
    };
  },
  mounted() {

  },
  beforeUnmount() {
  
  },
  methods: {

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
  transition: border-radius 0.2s ease, background-color 0.2s ease;
}
.nav-button:active {
  @apply rounded-lg bg-gray-500;
}
.active-nav-button {
  @apply bg-cyan-700 rounded-lg;
}
.icon {
  @apply w-6 h-6;
}

</style>
