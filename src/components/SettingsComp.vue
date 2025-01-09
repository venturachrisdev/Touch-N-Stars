<template>
  <div class="p-4 max-w-md mx-auto">
    <div class="bg-gray-800 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-4 text-white">
        {{ $t('components.settings.title') }}
      </h2>
      
      <div class="space-y-4">
        <!-- Language Selection -->
        <div class="bg-gray-700 p-3 rounded-lg">
          <h3 class="text-lg font-medium mb-2 text-gray-300">
            {{ $t('components.settings.language') }}
          </h3>
          <div class="space-y-2">
            <button 
              v-for="lang in languages" 
              :key="lang.code" 
              @click="changeLanguage(lang.code)"
              class="w-full px-4 py-2 text-left rounded-md transition-colors"
              :class="{
                'bg-cyan-700 text-white': lang.code === currentLanguage,
                'bg-gray-600 text-gray-300 hover:bg-gray-500': lang.code !== currentLanguage
              }"
            >
              {{ lang.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const currentLanguage = ref(locale.value);

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }
];

watchEffect(() => {
  currentLanguage.value = locale.value;
});

function changeLanguage(lang) {
  locale.value = lang;
}
</script>
