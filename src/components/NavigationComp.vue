<template>
  <div class="top-0 h-16 bg-gray-800 shadow-md">
    <div class="flex mx-auto max-w-md h-16 items-center justify-center">
      <div v-if="store.isBackendReachable">
        <router-link
          to="/equipment"
          class="nav-button"
          active-class="active-nav-button"
          :title="$t('components.navigation.equipment')"
        >
          <LinkIcon class="icon" />
        </router-link>
      </div>
      <div v-if="store.cameraInfo.Connected">
        <router-link
          to="/camera"
          class="nav-button"
          active-class="active-nav-button"
          :title="$t('components.navigation.camera')"
        >
          <CameraIcon class="icon" />
        </router-link>
      </div>
      <div v-if="store.focuserInfo.Connected">
        <router-link
          to="/autofocus"
          class="nav-button"
          active-class="active-nav-button"
          :title="$t('components.navigation.autofocus')"
        >
          <EyeIcon class="icon" />
        </router-link>
      </div>
      <div v-if="store.mountInfo.Connected">
        <router-link
          to="/mount"
          class="nav-button"
          active-class="active-nav-button"
          :title="$t('components.navigation.mount')"
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
            class="icon"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 21l6 -5l6 5" />
            <path d="M12 13v8" />
            <path
              d="M3.294 13.678l.166 .281c.52 .88 1.624 1.265 2.605 .91l14.242 -5.165a1.023 1.023 0 0 0 .565 -1.456l-2.62 -4.705a1.087 1.087 0 0 0 -1.447 -.42l-.056 .032l-12.694 7.618c-1.02 .613 -1.357 1.897 -.76 2.905z"
            />
            <path d="M14 5l3 5.5" />
          </svg>
        </router-link>
      </div>
      <div v-if="store.domeInfo.Connected">
        <router-link
          to="/dome"
          class="nav-button"
          active-class="active-nav-button"
          :title="$t('components.navigation.dome')"
        >
          <svg
            fill="#FFFFFF"
            height="24"
            width="24"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 512 512"
            xml:space="preserve"
          >
            <path
              d="M256,114.383c-22.526,0-40.851,18.325-40.851,40.851s18.325,40.851,40.851,40.851s40.851-18.325,40.851-40.851
			S278.526,114.383,256,114.383z M256,179.745c-13.516,0-24.511-10.995-24.511-24.511c0-13.516,10.995-24.511,24.511-24.511
			s24.511,10.995,24.511,24.511C280.511,168.75,269.516,179.745,256,179.745z"
            />
            <path
              d="M495.66,283.234h-2.723v-38.128h2.723c4.512,0,8.17-3.658,8.17-8.17c0-4.512-3.658-8.17-8.17-8.17h-2.878
			c-2.027-60.223-26.424-116.55-69.243-159.369c-26.822-26.822-58.948-46.412-94.006-57.812V8.45c0-4.512-3.658-8.17-8.17-8.17
			c-3.999,0-7.322,2.876-8.026,6.671C294.802,2.366,275.583,0,256,0c-19.714,0-39.059,2.393-57.707,7.038
			c-1.154-3.113-4.141-5.337-7.655-5.337c-4.512,0-8.17,3.658-8.17,8.17v1.714c-35.06,11.399-67.184,30.989-94.008,57.812
			c-42.82,42.818-67.215,99.144-69.242,159.368H16.34c-4.512,0-8.17,3.658-8.17,8.17c0,4.512,3.658,8.17,8.17,8.17h2.723v38.128
			H16.34c-4.512,0-8.17,3.658-8.17,8.17c0,4.512,3.658,8.17,8.17,8.17h2.723V503.83c0,4.512,3.658,8.17,8.17,8.17h457.532
			c4.512,0,8.17-3.658,8.17-8.17V299.574h2.723c4.512,0,8.17-3.658,8.17-8.17C503.83,286.892,500.172,283.234,495.66,283.234z
			M198.809,23.874c18.248-4.903,37.417-7.534,57.191-7.534c19.774,0,38.944,2.631,57.191,7.534v41.487H198.809V23.874z
			M182.468,28.958v175.297c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17V81.702h114.383v122.553
			c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17V28.958C412.68,58.443,473.049,136.45,476.429,228.766H35.571
			C38.951,136.45,99.32,58.443,182.468,28.958z M247.83,495.66h-49.021V343.149h49.021V495.66z M313.191,495.66H264.17V343.149
			h49.021V495.66z M476.596,283.234h-367.66c-4.512,0-8.17,3.658-8.17,8.17c0,4.512,3.658,8.17,8.17,8.17h367.66V495.66H329.532
			V334.979c0-4.512-3.658-8.17-8.17-8.17H190.638c-4.512,0-8.17,3.658-8.17,8.17V495.66H35.404V299.574h40.851
			c4.512,0,8.17-3.658,8.17-8.17c0-4.512-3.658-8.17-8.17-8.17H35.404v-38.128h49.021v13.617c0,4.512,3.658,8.17,8.17,8.17
			s8.17-3.658,8.17-8.17v-13.617h49.021v13.617c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17v-13.617h49.021v13.617
			c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17v-13.617h49.021v13.617c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17
			v-13.617h49.021v13.617c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17v-13.617h49.021v13.617c0,4.512,3.658,8.17,8.17,8.17
			c4.512,0,8.17-3.658,8.17-8.17v-13.617h49.021V283.234z"
            />
            <path
              d="M354.043,359.489c-4.512,0-8.17,3.658-8.17,8.17v43.574c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17V367.66 
          C362.213,363.147,358.555,359.489,354.043,359.489z"
            />
            <path
              d="M157.957,359.489c-4.512,0-8.17,3.658-8.17,8.17v43.574c0,4.512,3.658,8.17,8.17,8.17s8.17-3.658,8.17-8.17V367.66
			C166.128,363.147,162.47,359.489,157.957,359.489z"
            />
          </svg>
        </router-link>
      </div>
      <div v-if="store.guiderInfo.Connected">
        <router-link
          to="/guider"
          class="nav-button"
          active-class="active-nav-button"
          :title="$t('components.navigation.guider')"
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
            class="icon icon-tabler icons-tabler-outline icon-tabler-viewfinder"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 3l0 4" />
            <path d="M12 21l0 -3" />
            <path d="M3 12l4 0" />
            <path d="M21 12l-3 0" />
            <path d="M12 12l0 .01" />
          </svg>
        </router-link>
      </div>
      <div v-if="store.sequenceIsLoaded">
        <router-link
          to="/sequence"
          class="nav-button"
          active-class="active-nav-button"
          :title="$t('components.navigation.sequence')"
        >
          <ListBulletIcon class="icon" />
        </router-link>
      </div>
      <router-link
        to="/settings"
        class="nav-button"
        active-class="active-nav-button"
        :title="$t('components.navigation.settings')"
      >
        <Cog6ToothIcon class="icon" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
import {
  LinkIcon,
  CameraIcon,
  EyeIcon,
  ListBulletIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline';
import { apiStore } from '@/store/store';

const store = apiStore();
</script>

<style scoped>
.nav-button {
  @apply w-12 h-12 border border-cyan-500/20 bg-gray-700 text-white rounded-full hover:bg-gray-600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
  transition:
    border-radius 0.2s ease,
    background-color 0.2s ease;
}

.active-nav-button {
  @apply border border-cyan-300/30 bg-cyan-700 rounded-lg;
}

.icon {
  @apply w-6 h-6;
}
</style>
