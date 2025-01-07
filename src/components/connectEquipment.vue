<template>
    <div class="flex flex-col gap-2">
        <!-- Toggle All Connections Button -->
        <button 
            class="px-4 py-2 rounded transition-colors"
            :class="allConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
            @click="toggleAllConnections"
        >
            {{ allConnected ? $t('components.connectEquipment.disconnectAll') : $t('components.connectEquipment.connectAll') }}
        </button>

        <template v-for="device in store.existingEquipmentList" :key="device.type">
            <!-- Camera Control -->
            <ConnectionButton v-if="device.apiName === 'camera'"
                :isConnected="store.cameraInfo.Connected" 
                :connectText="$t('components.connectEquipment.camera.connect')"
                :disconnectText="$t('components.connectEquipment.camera.disconnect')" 
                :onToggle="toggleCameraConnection" />

            <!-- Filter Control -->
            <ConnectionButton v-if="device.apiName === 'filter'"
                :isConnected="store.filterInfo.Connected" 
                :connectText="$t('components.connectEquipment.filter.connect')"
                :disconnectText="$t('components.connectEquipment.filter.disconnect')" 
                :onToggle="toggleFilterConnection" />

            <!-- Mount Control -->
            <ConnectionButton v-if="device.apiName === 'mount'"
                :isConnected="store.mountInfo.Connected" 
                :connectText="$t('components.connectEquipment.mount.connect')"
                :disconnectText="$t('components.connectEquipment.mount.disconnect')" 
                :onToggle="toggleMountConnection" />

            <!-- Focuser Control -->
            <ConnectionButton v-if="device.apiName === 'focuser'"
                :isConnected="store.focuserInfo.Connected" 
                :connectText="$t('components.connectEquipment.focuser.connect')"
                :disconnectText="$t('components.connectEquipment.focuser.disconnect')" 
                :onToggle="toggleFocuserConnection" />

            <!-- Rotator Control -->
            <ConnectionButton v-if="device.apiName === 'rotator'"
                :isConnected="store.rotatorInfo.Connected" 
                :connectText="$t('components.connectEquipment.rotator.connect')"
                :disconnectText="$t('components.connectEquipment.rotator.disconnect')" 
                :onToggle="toggleRotatorConnection" />

            <!-- Guider Control -->
            <ConnectionButton v-if="device.apiName === 'guider'"
                :isConnected="store.guiderInfo.Connected" 
                :connectText="$t('components.connectEquipment.guider.connect')"
                :disconnectText="$t('components.connectEquipment.guider.disconnect')" 
                :onToggle="toggleGuiderConnection" />

            <!-- Safety Control -->
            <ConnectionButton v-if="device.apiName === 'safety'"
                :isConnected="store.safetyInfo.Connected" 
                :connectText="$t('components.connectEquipment.safety.connect')"
                :disconnectText="$t('components.connectEquipment.safety.disconnect')" 
                :onToggle="toggleSafetyConnection" />

            <!-- Flat Control -->
            <ConnectionButton v-if="device.apiName === 'flatdevice'"
                :isConnected="store.flatdeviceInfo.Connected" 
                :connectText="$t('components.connectEquipment.flat.connect')"
                :disconnectText="$t('components.connectEquipment.flat.disconnect')" 
                :onToggle="toggleFlatConnection" />

            <!-- Dome Control -->
            <ConnectionButton v-if="device.apiName === 'dome'"
                :isConnected="store.domeInfo.Connected" 
                :connectText="$t('components.connectEquipment.dome.connect')"
                :disconnectText="$t('components.connectEquipment.dome.disconnect')" 
                :onToggle="toggleDomeConnection" />
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { apiStore } from '../store/store';
import apiService from '../services/apiService';
import ConnectionButton from './helpers/ConnectionButton.vue';

const { t } = useI18n();
const store = apiStore();

async function toggleCameraConnection() {
    try {
        if (store.cameraInfo.Connected) {
            await apiService.cameraAction("disconnect");
        } else {
            await apiService.cameraAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.camera.error'), error.response?.data || error);
    }
}

async function toggleMountConnection() {
    try {
        if (store.mountInfo.Connected) {
            await apiService.mountAction("disconnect");
        } else {
            await apiService.mountAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.mount.error'), error.response?.data || error);
    }
}

async function toggleFilterConnection() {
    try {
        if (store.filterInfo.Connected) {
            await apiService.filterAction("disconnect");
        } else {
            await apiService.filterAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.filter.error'), error.response?.data || error);
    }
}

async function toggleFocuserConnection() {
    try {
        if (store.focuserInfo.Connected) {
            await apiService.focusAction("disconnect");
        } else {
            await apiService.focusAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.focuser.error'), error.response?.data || error);
    }
}

async function toggleRotatorConnection() {
    try {
        if (store.rotatorInfo.Connected) {
            await apiService.rotatorAction("disconnect");
        } else {
            await apiService.rotatorAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.rotator.error'), error.response?.data || error);
    }
}

async function toggleGuiderConnection() {
    try {
        if (store.guiderInfo.Connected) {
            await apiService.guiderAction("disconnect");
        } else {
            await apiService.guiderAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.guider.error'), error.response?.data || error);
    }
}

async function toggleSafetyConnection() {
    try {
        if (store.safetyInfo.Connected) {
            await apiService.safetyAction("disconnect");
        } else {
            await apiService.safetyAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.safety.error'), error.response?.data || error);
    }
}

async function toggleFlatConnection() {
    try {
        if (store.flatdeviceInfo.Connected) {
            await apiService.flatdeviceAction("disconnect");
        } else {
            await apiService.flatdeviceAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.flat.error'), error.response?.data || error);
    }
}

async function toggleDomeConnection() {
    try {
        if (store.domeInfo.Connected) {
            await apiService.domeAction("disconnect");
        } else {
            await apiService.domeAction("connect");
        }
    } catch (error) {
        console.error(t('components.connectEquipment.dome.error'), error.response?.data || error);
    }
}

const allConnected = computed(() => {
    return store.existingEquipmentList.every(device => {
        switch(device.apiName) {
            case 'camera': return store.cameraInfo.Connected;
            case 'mount': return store.mountInfo.Connected;
            case 'filter': return store.filterInfo.Connected;
            case 'focuser': return store.focuserInfo.Connected;
            case 'rotator': return store.rotatorInfo.Connected;
            case 'guider': return store.guiderInfo.Connected;
            case 'safety': return store.safetyInfo.Connected;
            case 'flatdevice': return store.flatdeviceInfo.Connected;
            case 'dome': return store.domeInfo.Connected;
            default: return false;
        }
    });
});

async function toggleAllConnections() {
    try {
        if (allConnected.value) {
            for (const device of store.existingEquipmentList) {
                switch(device.apiName) {
                    case 'camera': await apiService.cameraAction("disconnect"); break;
                    case 'mount': await apiService.mountAction("disconnect"); break;
                    case 'filter': await apiService.filterAction("disconnect"); break;
                    case 'focuser': await apiService.focusAction("disconnect"); break;
                    case 'rotator': await apiService.rotatorAction("disconnect"); break;
                    case 'guider': await apiService.guiderAction("disconnect"); break;
                    case 'safety': await apiService.safetyAction("disconnect"); break;
                    case 'flatdevice': await apiService.flatdeviceAction("disconnect"); break;
                    case 'dome': await apiService.domeAction("disconnect"); break;
                }
            }
        } else {
            for (const device of store.existingEquipmentList) {
                switch(device.apiName) {
                    case 'camera': await apiService.cameraAction("connect"); break;
                    case 'mount': await apiService.mountAction("connect"); break;
                    case 'filter': await apiService.filterAction("connect"); break;
                    case 'focuser': await apiService.focusAction("connect"); break;
                    case 'rotator': await apiService.rotatorAction("connect"); break;
                    case 'guider': await apiService.guiderAction("connect"); break;
                    case 'safety': await apiService.safetyAction("connect"); break;
                    case 'flatdevice': await apiService.flatdeviceAction("connect"); break;
                    case 'dome': await apiService.domeAction("connect"); break;
                }
            }
        }
    } catch (error) {
        console.error(allConnected.value 
            ? t('components.connectEquipment.disconnectAllError')
            : t('components.connectEquipment.connectAllError'), 
        error);
    }
}
</script>
