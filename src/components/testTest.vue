<template>
  <div>
    <input 
    class=" text-black"
      type="text" 
      v-model="framingStore.fov" 
      min="1" 
      max="50" 
      step="1" 
      @blur="reloadFraming" 
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
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useFramingStore } from '@/store/framingStore'

const framingStore = useFramingStore();

// Reaktive Variable, die steuert, ob FramingTest angezeigt werden soll
const showFraming = ref(true)

// Reaktive Variable für den Key der Komponente
const componentKey = ref(0)

// Asynchrone Definition der Komponente über defineAsyncComponent:
const AsyncFramingTest = defineAsyncComponent(() =>
  import('./framing/FramingTest.vue')
)

// Dynamischer Komponentenname
const currentComponent = computed(() => {
  return showFraming.value ? AsyncFramingTest : null
})

// Funktion zum Neu-Laden der Komponente
function reloadFraming() {
  // Key ändern, um die Komponente neu zu laden
  componentKey.value++
}
</script>
