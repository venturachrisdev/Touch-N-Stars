<template>
    <div >
      <p class="text-white mb-2 ">{{ statusText }}</p>
      <button
        @click="toggleConnection"
        class="min-w-64 min-h-10 rounded-md text-white font-medium transition-colors"
        :class="isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
      >
        {{ isConnected ? disconnectText : connectText }}
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isConnected: {
        type: Boolean,
        required: true,
      },
      statusText: {
        type: String,
        required: true,
      },
      connectText: {
        type: String,
        default: "Verbinden",
      },
      disconnectText: {
        type: String,
        default: "Trennen",
      },
      onToggle: {
        type: Function,
        required: true,
      },
    },
    methods: {
      toggleConnection() {
        this.onToggle();
      },
    },
  };
  </script>
  