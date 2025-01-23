<script setup>
import Moveable from "vue3-moveable";
import { ref } from "vue";

// Breite und Höhe speichern
const width = ref("100px");
const height = ref("100px");

// Moveable Eigenschaften
const draggable = true;
const throttleDrag = 1;
const edgeDraggable = false;
const startDragRotate = 0;
const throttleDragRotate = 0;
const rotatable = true;
const throttleRotate = 0;
const rotationPosition = "top";
const targetRef = ref(null);
const moveableRef = ref(null);

const onDrag = (e) => {
    e.target.style.transform = e.transform;
};

const onRotate = (e) => {
    e.target.style.transform = e.drag.transform;
};
</script>

<template>
  <div class="root">
      <div class="container">
          <div
              class="target"
              ref="targetRef"
              :style="`width: ${width}; height: ${height};`"
          >
              Target
          </div>
          <Moveable
              ref="moveableRef"
              :target="targetRef"
              :draggable="draggable"
              :throttleDrag="throttleDrag"
              :edgeDraggable="edgeDraggable"
              :startDragRotate="startDragRotate"
              :throttleDragRotate="throttleDragRotate"
              :rotatable="rotatable"
              :throttleRotate="throttleRotate"
              :rotationPosition="rotationPosition"
              @drag="onDrag"
              @rotate="onRotate"
          />
      </div>
  </div>
</template>

<style>

</style>
