<template>
    <div v-if="!store.sequenceIsLoaded" class="text-red-500">
        <p>{{ $t('components.sequence.noSequenceLoaded') }}</p>
    </div>
    <div v-else class="flex items-center justify-center w-full">
        <div class="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <button 
                    :class="[
                        'btn-primary bg-blue-500',
                        store.sequenceRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                    ]"
                    @click="startSequence"
                    :disabled="store.sequenceRunning"
                >
                    <span v-if="store.sequenceRunning" class="animate-spin mr-2">&#9696;</span>
                    {{ store.sequenceRunning ? 'RUNNING' : $t('components.sequence.startSequence') }}
                </button>
            
            <button 
                class="btn-primary bg-red-500 hover:bg-red-600"
                @click="stopSequence"
            >
                {{ $t('components.sequence.stopSequence') }}
            </button>
            
            <button 
                class="btn-primary bg-pink-500 hover:bg-pink-600"
                @click="showResetConfirmation = true"
                :disabled="store.sequenceRunning"
            >
                {{ $t('components.sequence.resetSequence') }}
            </button>
        </div>

        <!-- Reset Confirmation Dialog -->
        <transition name="fade">
          <div 
            v-if="showResetConfirmation" 
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            @click.self="showResetConfirmation = false"
            @keydown.esc="showResetConfirmation = false"
          >
            <transition name="scale">
              <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 class="text-xl font-semibold mb-4">{{ $t('components.sequence.resetConfirmationTitle') }}</h3>
                <p class="mb-6">{{ $t('components.sequence.resetConfirmationMessage') }}</p>
                <div class="flex justify-end space-x-4">
                    <button 
                        class="btn-secondary"
                        @click="showResetConfirmation = false"
                    >
                        {{ $t('general.cancel') }}
                    </button>
                    <button 
                        class="btn-danger"
                        @click="confirmReset"
                    >
                        {{ $t('general.confirm') }}
                    </button>
                </div>
              </div>
            </transition>
          </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import apiService from '../../services/apiService';
import { apiStore } from '../../store/store';

const store = apiStore();
const showResetConfirmation = ref(false);
const isLoading = computed(() => store.sequenceRunning);

async function startSequence() {
    console.log("Starting sequence");
    store.setSequenceRunning(true);
    try {
        const data = await apiService.sequenceAction("start");
        console.log("Antwort:", data);
    } catch (error) {
        console.log("Fehler:", error);
        store.setSequenceRunning(false);
    }
}

async function stopSequence() {
    try {
        const data = await apiService.sequenceAction("stop");
        console.log("Antwort:", data);
        
        // Only stop if the API confirms success
        if (data.Success) {
            store.setSequenceRunning(false);
        } else {
            console.error("Failed to stop sequence:", data.Error);
        }
    } catch (error) {
        console.log("Fehler:", error);
        store.setSequenceRunning(false);
    }
}

async function confirmReset() {
    isLoading.value = true;
    showResetConfirmation.value = false;
    try {
        const data = await apiService.sequenceAction("reset");
        console.log("Antwort:", data);
        
        // Handle reset response similar to other actions
        if (data.Success) {
            // Reset successful
            isLoading.value = false;
        } else {
            console.error("Failed to reset sequence:", data.Error);
            // Allow retry on error
            isLoading.value = false;
        }
    } catch (error) {
        console.log("Fehler:", error);
        // Allow retry on error
        isLoading.value = false;
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

.btn-primary {
    @apply px-6 py-3 rounded-lg text-white font-medium transition-all duration-200;
    @apply flex items-center justify-center min-w-[160px];
    @apply shadow-lg hover:shadow-xl;
}

.btn-secondary {
    @apply px-4 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors;
}

.btn-danger {
    @apply px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors;
}
</style>
