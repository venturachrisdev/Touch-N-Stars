<template>
    
            <div class="w-64 flex items-center ">
                <label class="mr-2" for="profileDropdown">Profil: </label>
                <select id="profileDropdown" class="default-inputfield" @change="updateProfile">
                    <option v-for="profile in profiles" :key="profile.Id" :value="profile.Id">
                        {{ profile.Name }}
                    </option>
                </select>
            </div>

  
 
</template>


<script>
import apiService from "@/services/apiService";

export default {
    data() {
        return {
            profiles: [], // Liste der Profile
            selectedProfileId: null, // ID des ausgewählten Profils
        };
    },
    methods: {
        // Lade Profile von der API
        async fetchProfiles() {
            try {
                const response = await apiService.profileAction("show");
                if (response && response.Response) {
                    this.profiles = response.Response;
                    // Standardprofil setzen
                    const activeProfile = this.profiles.find(profile => profile.IsActive);
                    if (activeProfile) {
                        this.selectedProfileId = activeProfile.Id;
                    }
                }
            } catch (error) {
                console.error('Fehler beim Laden der Profile:', error);
            }
        },

        // Aktualisiere das ausgewählte Profil
        async updateProfile() {
            try {
                const response = await apiService.profileSwitch(this.selectedProfileId);
                if (response && response.Success) {
                    console.log('Profil erfolgreich aktualisiert');
                } else {
                    alert('Fehler beim Aktualisieren des Profils');
                }
            } catch (error) {
                console.error('Fehler beim Aktualisieren des Profils:', error);
                alert('Fehler beim Aktualisieren des Profils');
            }
        },
    },
    // Lade Profile, wenn die Komponente gemountet wird
    mounted() {
        this.fetchProfiles();
    },
};
</script>

<style scoped>

</style>