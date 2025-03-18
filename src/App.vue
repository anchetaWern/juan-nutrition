<template>

  <router-view></router-view>
  
  <Loader />
  
</template>

<script setup>
import { ref, provide, watch } from 'vue';
import Loader from '@/components/Loader.vue';


const tourModeEnabled = ref(localStorage.getItem("tourModeEnabled") === 'yes' ? true : false || false);

watch(tourModeEnabled, (newValue) => {
  console.log("setting new value for tour mode: ", newValue);
  localStorage.setItem("tourModeEnabled", newValue);
});

provide("tourModeEnabled", tourModeEnabled);
</script>