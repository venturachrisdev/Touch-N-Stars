<template>
  <div class="dark min-h-screen bg-gray-900 text-white">
    <div v-if="!store.isBackendReachable">
      <div
        class="flex flex-col w-full min-h-screen items-center justify-center text-2xl text-red-700 text-center"
      >
        <div class="flex flex-col items-center mb-8">
          <button
            @click="showSettings = true"
            class="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
        <p>{{ t('app.unreachable') }}</p>
        <p>{{ t('app.connecting') }}</p>
        <!--Spinner-->
        <div role="status" class="mt-4">
          <svg
            aria-hidden="true"
            class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">{{ $t('components.loading') }}</span>
        </div>
      </div>
    </div>
    <div v-else>
      <!-- Navigation -->
      <nav>
        <div class="z-20">
          <NavigationComp />
        </div>
      </nav>
      <!-- Main content -->
      <div class="container mx-auto p-0.5 transition-all">
        <router-view />
      </div>
      <!-- Footer -->
      <div>
        <button @click="showLogsModal = true" class="fixed bottom-0 w-full">
          <LastMessage class="fixed bottom-0 w-full" />
        </button>
      </div>
    </div>

    <!-- Settings Modal -->
    <div
      v-if="showSettings"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-gray-900 rounded-lg p-4 sm:p-6 w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 scrollbar-hide"
      >
        <SettingsPage />
        <button
          @click="showSettings = false"
          class="fixed sm:absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-white bg-gray-900 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Logs Modal -->
    <div
      v-if="showLogsModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-gray-900 rounded-lg p-4 sm:p-6 w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 scrollbar-hide"
      >
        <LastLogs />
        <button
          @click="showLogsModal = false"
          class="fixed sm:absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-white bg-gray-900 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted, onBeforeUnmount } from 'vue';
import { apiStore } from '@/store/store';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import NavigationComp from '@/components/NavigationComp.vue';
import LastMessage from '@/components/LastMessage.vue';
import SettingsPage from '@/views/SettingsPage.vue';
import LastLogs from '@/components/LastLogs.vue';
import { useSettingsStore } from '@/store/settingsStore';
import { useLogStore } from '@/store/logStore';

const { t } = useI18n();
const store = apiStore();
const logStore = useLogStore();
const showSettings = ref(false);
const showLogsModal = ref(false);
/* eslint-disable */
const settingsStore = useSettingsStore();

useHead({
  title: 'TouchNStars',
});

function handleVisibilityChange() {
  if (document.hidden) {
    store.stopFetchingInfo();
    logStore.stopFetchingLog();
  } else {
    store.startFetchingInfo();
    logStore.startFetchingLog();
  }
}

onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  store.startFetchingInfo();
  logStore.startFetchingLog();
});

onBeforeUnmount(() => {
  store.stopFetchingInfo();
  logStore.stopFetchingLog();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped></style>
