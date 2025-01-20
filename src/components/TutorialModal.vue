<template>
  <transition name="modal">
    <div v-if="showModal" class="tutorial-modal" @click.self="closeTutorial">
      <div class="modal-content">
        <!-- Progress Indicator -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }"
          ></div>
        </div>

        <!-- Header -->
        <div class="tutorial-header">
          <h2 class="text-xl font-semibold mb-4">{{ currentStep.title[$i18n.locale] }}</h2>
        </div>

        <!-- Body -->
        <div class="tutorial-body">
          <p class="text-gray-300 leading-relaxed">{{ currentStep.content[$i18n.locale] }}</p>
        </div>

        <!-- Footer -->
        <div class="tutorial-footer">
          <div class="flex justify-between items-center mt-6">
            <button v-if="currentStepIndex > 0" @click="previousStep" class="btn-prev">
              {{ $t('components.tutorial.previous') }}
            </button>
            <span v-else></span>

            <button v-if="currentStepIndex < steps.length - 1" @click="nextStep" class="btn-next">
              {{ $t('components.tutorial.next') }}
            </button>

            <button v-else @click="closeTutorial" class="btn-close">
              {{ $t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import tutorialData from '@/assets/tutorial.json';

export default {
  name: 'TutorialModal',
  data() {
    return {
      steps: tutorialData.steps,
      currentStepIndex: 0,
      showModal: true,
    };
  },
  computed: {
    currentStep() {
      return this.steps[this.currentStepIndex];
    },
  },
  methods: {
    nextStep() {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
      }
    },
    previousStep() {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
      }
    },
    closeTutorial() {
      this.showModal = false;
      this.$emit('close');
      localStorage.setItem('tutorialCompleted', 'true');
    },
  },
  mounted() {
    this.currentStepIndex = 0;
  },
};
</script>

<style scoped>
/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.tutorial-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: #1f2937;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  margin: 1rem;
  position: relative;
}

/* Progress Bar */
.progress-bar {
  height: 4px;
  background-color: #374151;
  border-radius: 2px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

/* Buttons */
button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-prev {
  background-color: #374151;
  color: white;
}

.btn-prev:hover {
  background-color: #4b5563;
}

.btn-next,
.btn-close {
  background-color: #3b82f6;
  color: white;
}

.btn-next:hover,
.btn-close:hover {
  background-color: #2563eb;
}

/* Responsive Design */
@media (max-width: 640px) {
  .modal-content {
    padding: 1rem;
    margin: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    min-width: 80px;
  }

  .tutorial-header h2 {
    font-size: 1.25rem;
  }

  .tutorial-body p {
    font-size: 0.9rem;
  }
}
</style>
