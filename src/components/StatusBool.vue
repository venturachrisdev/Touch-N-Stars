<template>
    /*
    Beispiel zum einfügen
    <StatusBool
      :isEnabled="TrackingEnabled"
      enabledText="Tracking ist aktiv"
      disabledText="Tracking wurde deaktiviert"
      enabledClass="text-blue-500"
      disabledClass="text-red-500"
    />
    */
    <p class="text-white" :class="isEnabled ? enabledClass : disabledClass">
      {{ isEnabled ? enabledText : disabledText }}
    </p>
  </template>
  
  <script>
  export default {
    props: {
      isEnabled: {
        type: Boolean,
        required: true,
      },
      enabledText: {
        type: String,
        default: 'Ein', // Standardtext für aktives 
      },
      disabledText: {
        type: String,
        default: 'Aus', // Standardtext für inaktives 
      },
      enabledClass: {
        type: String,
        default: 'text-green-500', // Standardklasse für aktives 
      },
      disabledClass: {
        type: String,
        default: 'text-gray-600/50', // Standardklasse für inaktives 
      },
    },
  };
  </script>
  
  <style scoped>

  </style>
  