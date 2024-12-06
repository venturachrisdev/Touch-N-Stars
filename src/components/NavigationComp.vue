<template>
  
  <div
    class="top-0 h-16 bg-gray-800 shadow-md"
  >
  <div class="flex inset-x-0 mx-auto max-w-sm h-16  items-center justify-around">
    <router-link
      to="/equipment"
      class="nav-button"
      active-class="active-nav-button"
      title="Ausrüstung"
    >
      <LinkIcon class="icon" />
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
      to="/autofocus"
      class="nav-button"
      active-class="active-nav-button"
      title="Autofokus"
    >
    <EyeIcon class="icon" />
    </router-link>

    <router-link
      to="/mount"
      class="nav-button"
      active-class="active-nav-button"
      title="Montierung"
    >
    <svg 
       xmlns="http://www.w3.org/2000/svg"  
       width="24"  
       height="24"  
       viewBox="0 0 24 24"  
       fill="none"  
       stroke="currentColor"  
       stroke-width="2"  
       stroke-linecap="round"  
       stroke-linejoin="round"  
       class="icon ">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
       <path d="M6 21l6 -5l6 5" />
       <path d="M12 13v8" />
       <path d="M3.294 13.678l.166 .281c.52 .88 1.624 1.265 2.605 .91l14.242 -5.165a1.023 1.023 0 0 0 .565 -1.456l-2.62 -4.705a1.087 1.087 0 0 0 -1.447 -.42l-.056 .032l-12.694 7.618c-1.02 .613 -1.357 1.897 -.76 2.905z" />
       <path d="M14 5l3 5.5" />
    </svg>
    </router-link>

    <router-link
      to="/guider"
      class="nav-button"
      active-class="active-nav-button"
      title="Sequenzer"
      
    >
    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-target"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>
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
  LinkIcon,
  CameraIcon,
  EyeIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline';

export default {
  components: {
    LinkIcon,
    CameraIcon,
    EyeIcon,
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
  @apply rounded-lg bg-cyan-500;
}
.active-nav-button {
  @apply bg-cyan-700 rounded-lg;
}
.icon {
  @apply w-6 h-6;
}


</style>
