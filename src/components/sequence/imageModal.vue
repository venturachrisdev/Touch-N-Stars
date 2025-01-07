<template>
  <!-- Nur anzeigen, wenn showModal true ist -->
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center ">
    <!-- Halbtransparenter Overlay-Hintergrund -->
    <div class="absolute inset-0 bg-black bg-opacity-70" @click="closeModal"></div>
    
    <!-- Inhalt der Modal -->
    <div class="relative max-w-4xl w-full max-h-full p-4 bg-gray-900 rounded-xl   z-60 flex items-center justify-center">
      <button 
        class="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-extrabold z-70"
        @click="closeModal"
        aria-label="Schließen"
      >
        ✕
      </button>
      <div ref="imageContainer" class="overflow-hidden relative w-full h-full flex items-center justify-center shadow-md shadow-cyan-900 border border-cyan-700 rounded-md">
        <img 
          v-if="imageData"
          :src="imageData" 
          ref="image"
          @load="onImageLoad"
          class="max-w-full max-h-full object-contain cursor-move"
          alt="Vergrößertes Bild"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import Panzoom from 'panzoom';

// Props definieren
const props = defineProps({
  showModal: {
    type: Boolean,
    default: false,
  },
  imageData: {
    type: String,
    default: null,
  },
});

// Emits definieren
const emits = defineEmits(['close']);

/**
 * Schließt die Modal, indem ein "close"-Event emittiert wird
 */
function closeModal() {
  emits('close');
}

// Refs für Panzoom
const image = ref(null);
let panzoomInstance = null;

/**
 * Initialisiert Panzoom auf dem Bild
 */
const initializePanzoom = () => {
  if (image.value) {
    panzoomInstance = Panzoom(image.value, {
      maxZoom: 10, 
      minZoom: 1,
      bounds: true,
      boundsPadding: 0.1,
      contain: 'inside',
      startTransform: 'scale(1)',
      // Optional: Aktiviere Gesten, falls auf Touch-Geräten
      touchAction: 'none',
    });
  }
};

/**
 * Bereinigt die Panzoom-Instanz
 */
const destroyPanzoom = () => {
  if (panzoomInstance) {
    panzoomInstance.dispose();
    panzoomInstance = null;
  }
};

// Handler für das Laden des Bildes
const onImageLoad = () => {
  // Warte, bis das Bild vollständig geladen ist
  nextTick(() => {
    destroyPanzoom(); // Vorherige Instanz bereinigen
    initializePanzoom(); // Neue Instanz initialisieren
  });
};

// Beobachte Änderungen an showModal, um Panzoom zu initialisieren oder zu bereinigen
watch(
  () => props.showModal,
  (newVal) => {
    if (newVal) {
      // Wenn das Modal geöffnet wird, Panzoom initialisieren nach dem Laden des Bildes
      // Der @load-Handler im img-Tag kümmert sich darum
    } else {
      // Wenn das Modal geschlossen wird, Panzoom bereinigen
      destroyPanzoom();
    }
  }
);

// Bereinige Panzoom-Instanz, wenn die Komponente zerstört wird
onBeforeUnmount(() => {
  destroyPanzoom();
});
</script>

<style scoped>
/* Sicherstellen, dass der Modal-Container die volle Höhe nutzt */
.modal-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Container für das Bild */
.image-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Bild selbst */
.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: move;
  /* Stellen Sie sicher, dass das Bild zentriert ist */
  display: block;
  margin: auto;
}

/* Schließen-Button spezifische Stile */
button[aria-label="Schließen"] {
  z-index: 70; /* Höher als der Container */
}
</style>
