<template>
    <div class="container flex tems-center justify-center">
      <div class="container max-w-md">
        <h5 class="text-xl font-bold text-white mb-4">Schwenken und Zentrieren</h5>
        <div class="flex flex-row space-x-4">
          <!-- Verwende v-model für die Bidirektionale Datenbindung -->
          <input
            type="text"
            v-model="localRAangleString"
            class="text-black w-full p-2 border border-gray-300 rounded"
            placeholder="RA 03:47:28.2"
          />
          <input
            type="text"
            v-model="localDECangleString"
            class="text-black w-full p-2 border border-gray-300 rounded"
            placeholder="Dec +24:06:19"
          />
        </div>
        <div class="mt-4">
          <button
            @click="slewAndCenter"
            class="flex h-10 w-full rounded-md text-white font-medium transition-colors bg-cyan-700 items-center justify-center disabled:opacity-50"
          >
            Schwenken
          </button>
        </div>
        
      </div>
    </div>
  </template>
  
  <script>
  import apiService from "@/services/apiService";
  
  export default {
    props: {
      RAangleString: String,
      DECangleString: String,
    },
    data() {
      return {
        localRAangleString: this.RAangleString, // Lokale Kopie erstellen
        localDECangleString: this.DECangleString, // Lokale Kopie erstellen
        RAangle: null,
        DECangle: null,
      };
    },
    watch: {
      // Wenn Props sich ändern, aktualisiere die lokalen Kopien
      RAangleString(newValue) {
        this.localRAangleString = newValue;
      },
      DECangleString(newValue) {
        this.localDECangleString = newValue;
      },
    },
    methods: {
      async slewAndCenter() {
        this.RAangle = this.hmsToDegrees(this.localRAangleString);
        this.DECangle = this.dmsToDegrees(this.localDECangleString);
        try {
          await apiService.slewAndCenter(this.RAangle, this.DECangle);
        } catch (error) {
          console.error("Framing API nicht erreicht", error);
        }
        // Änderungen an die Parent-Komponente melden
        this.$emit("update:RAangleString", this.localRAangleString);
        this.$emit("update:DECangleString", this.localDECangleString);
      },
      hmsToDegrees(hmsString) {
        const parts = hmsString.split(":");
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);
        return hours * 15 + minutes * (15 / 60) + seconds * (15 / 3600);
      },
      dmsToDegrees(dmsString) {
        const sign = dmsString.startsWith("-") ? -1 : 1;
        const stripped = dmsString.replace("-", "");
        const parts = stripped.split(":");
  
        if (parts.length !== 3) {
          throw new Error("Ungültiges Format. Erwartet: ±DD:MM:SS.s");
        }
  
        const degrees = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1]);
        const seconds = parseFloat(parts[2]);
  
        return sign * (degrees + minutes / 60 + seconds / 3600);
      },
    },
  };
  </script>
  