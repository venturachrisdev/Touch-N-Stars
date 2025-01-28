<template>
  <div class="flex flex-col items-center justify-center">
    <!-- Mit Suspense können wir einen "Loading"-Fallback anzeigen -->
    <Suspense>
      <template #default>
        <!-- Dynamische Komponente mit einem Key, um das Neu-Laden zu erzwingen -->
        <component :is="currentComponent" :key="componentKey" />
      </template>

      <template #fallback>
        <div>Lade Komponente...</div>
      </template>
    </Suspense>
    <div
      class="flex-col w-full space-y-2 mt-4 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg p-5"
    >
      <!-- FovParameter-Komponente -->
      <fovParameter />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, watch } from 'vue';
import { useFramingStore } from '@/store/framingStore';
import fovParameter from '@/components/framing/fovParameter.vue';

const framingStore = useFramingStore();

// Reaktive Variable, die steuert, ob FramingTest angezeigt werden soll
const showFraming = ref(true);

// Reaktive Variable für den Key der Komponente
const componentKey = ref(0);

// Asynchrone Definition der Komponente über defineAsyncComponent:
const AsyncFramingTest = defineAsyncComponent(
  () => import('@/components/framing/FramingAssitantImg.vue')
);

// Dynamischer Komponentenname
const currentComponent = computed(() => {
  return showFraming.value ? AsyncFramingTest : null;
});

// Funktion zum Neu-Laden der Komponente
function reloadFraming() {
  if (framingStore.fov < 1 || framingStore.fov > 50) {
    return;
  }
  // Key ändern, um die Komponente neu zu laden
  componentKey.value++;
}

let debounceTimeout;

function debounceLoadImage() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    reloadFraming();
  }, 500); // Wartezeit in Millisekunden
}

watch(
  () => framingStore.fov,
  () => {
    debounceLoadImage();
  }
);
</script>
