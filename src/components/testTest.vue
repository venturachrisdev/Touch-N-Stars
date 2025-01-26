<template>
  <div class="flex flex-col items-center justify-center">
    <div class="p-4">
      <input
        class="text-black"
        type="number"
        v-model="framingStore.fov"
        min="1"
        max="50"
        step="1"
        @input="reloadFraming"
      />
    </div>

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
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue';
import { useFramingStore } from '@/store/framingStore';

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
</script>
