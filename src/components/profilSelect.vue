<template>
    <div class="w-64 flex items-center">
      <label class="mr-2" for="profileDropdown">Profil: </label>
      <select
        id="profileDropdown"
        class="default-inputfield"
        v-model="selectedProfileId"
        @change="updateProfile"
      >
        <option v-for="profile in profiles" :key="profile.Id" :value="profile.Id">
          {{ profile.Name }}
        </option>
      </select>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import apiService from "@/services/apiService";
  
  const profiles = ref([]);
  const selectedProfileId = ref(null);
  
  async function fetchProfiles() {
    try {
      const response = await apiService.profileAction("show");
      if (response && response.Response) {
        profiles.value = response.Response;
        const activeProfile = profiles.value.find(profile => profile.IsActive);
        if (activeProfile) {
          selectedProfileId.value = activeProfile.Id;
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Profile:', error);
    }
  }
  
  async function updateProfile() {
    try {
      const response = await apiService.profileSwitch(selectedProfileId.value);
      if (response && response.Success) {
        console.log('Profil erfolgreich aktualisiert');
      } else {
        alert('Fehler beim Aktualisieren des Profils');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Profils:', error);
      alert('Fehler beim Aktualisieren des Profils');
    }
  }
  
  onMounted(() => {
    fetchProfiles();
  });
  </script>
  
  <style scoped></style>
  