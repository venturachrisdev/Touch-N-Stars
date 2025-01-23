<template>
  <div v-for="WritableSwitche in store.switchInfo.WritableSwitches">
    <div v-if="WritableSwitche.Maximum === 1.0">
      <div
        class="flex flex-row items-center justify-between w-full border border-gray-500 p-2 rounded-lg"
      >
        <div>
          <p>{{ WritableSwitche.Name }}</p>
          <p class="text-xs italic text-gray-500">{{ WritableSwitche.Description }}</p>
        </div>
        <toggleButton
          @click="setBool(WritableSwitche.Id, WritableSwitche.Value)"
          :status-value="WritableSwitche.TargetValue === 1"
        />
      </div>
    </div>
  </div>
  <div v-for="WritableSwitche in store.switchInfo.WritableSwitches">
    <div v-if="WritableSwitche.Maximum > 1.0">
      <div
        class="flex flex-row items-center justify-between w-full border border-gray-500 p-2 rounded-lg"
      >
        <div>
          <p>{{ WritableSwitche.Name }}</p>
          <p class="text-xs italic text-gray-500">{{ WritableSwitche.Description }}</p>
        </div>
        <SetValue
          @blur="
            setValue(WritableSwitche.Id, $event, WritableSwitche.Minimum, WritableSwitche.Maximum)
          "
          :store-value="WritableSwitche.Value"
          :min="WritableSwitche.Minimum"
          :max="WritableSwitche.Maximum"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { apiStore } from '@/store/store';
import apiService from '@/services/apiService';
import toggleButton from '@/components/helpers/toggleButton.vue';
import SetValue from '@/components/switch/SetValue.vue';

const store = apiStore();

async function setBool(id, value) {
  try {
    //console.log('id: ', id, 'value: ', value)
    if (value === 1.0) {
      await apiService.setSwitch(id, 0);
      console.log('Switch on ID: ', id);
    } else {
      await apiService.setSwitch(id, 1);
      console.log('Switch off ID: ', id);
    }
  } catch (error) {
    console.log('Feher beim setzen des Switches ');
  }
}

async function setValue(id, value, valueMin, valueMax) {
  try {
    if (value < valueMin) {
      value = valueMin;
    }
    if (value > valueMax) {
      value = valueMax;
    }
    await apiService.setSwitch(id, value);
    console.log('Value set: ', value);
  } catch (error) {
    console.log('Feher beim setzen des Switches ');
  }
}
</script>
