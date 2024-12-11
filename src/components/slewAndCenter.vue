<template>
       <div class="container flex tems-center justify-center">
        <div class="container max-w-md ">
      <h5 class="text-xl  font-bold text-white mb-4">Schwenken und Zentrieren</h5>
        <div class="flex flex-row space-x-4">
            <input type="text" v-model="RAangleString" class="text-black w-full p-2 border border-gray-300 rounded">
            <input type="text" v-model="DECangleString" class="text-black w-full p-2 border border-gray-300 rounded">
        </div>
        <div class="mt-4">
            <button @click="slewAndCenter"
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
    components: {
  
    },
    data() {
      return {
        RAangle: null,
        RAangleString: "23:52:52",
        DECangle: null,
        DECangleString: "-53:02:07.7",
      };
    },
    async mounted() {
      
    },
    methods: {
        async slewAndCenter() {
           
            this.RAangle = this.hmsToDegrees(this.RAangleString);
            this.DECangle = this.dmsToDegrees(this.DECangleString);
            try {
                await apiService.slewAndCenter(this.RAangle, this.DECangle);
            } catch (error) {
                console.log("Framing API nicht erreicht", error);
            }
            },
        hmsToDegrees(hmsString) {
            const parts = hmsString.split(':');
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const seconds = parseInt(parts[2], 10);
            return (hours * 15) + (minutes * (15 / 60)) + (seconds * (15 / 3600));
        },
        dmsToDegrees(dmsString) {
            const sign = dmsString.startsWith('-') ? -1 : 1;
            const stripped = dmsString.replace('-', '');
            const parts = stripped.split(':');

            if (parts.length !== 3) {
                throw new Error("Ungültiges Format. Erwartet: ±DD:MM:SS.s");
            }

            const degrees = parseFloat(parts[0]);
            const minutes = parseFloat(parts[1]);
            const seconds = parseFloat(parts[2]);

            const decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);

            return sign * decimalDegrees;
            }

        }
  };
  </script>
  