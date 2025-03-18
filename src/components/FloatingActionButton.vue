<template>
 
    <v-fab 
        v-if="tourModeEnabled"
        text="Exit Tour"
        color="surface-variant"
        size="small"
        absolute
        @click="handleExit"
        class="fab"
    />

</template>

<style>
.fab {
  position: fixed !important;
  bottom: 20px;
  right: 20px;
  z-index: 1000; 
}
</style>

<script setup>
import { inject } from 'vue';

const tourModeEnabled = inject("tourModeEnabled");

const handleExit = () => {
    console.log("FAB Clicked!");
    tourModeEnabled.value = 'no';
};
</script>
