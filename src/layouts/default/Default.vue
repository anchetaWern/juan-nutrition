<template>
  <v-app>
    <default-bar :updateItems="updateItems" />

    <default-view :items="items" />
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router'

import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'

const router = useRouter();

const updateItems = (q) => {
  
  router.push({ 
    name: 'Home', 
    query: { 
      q, 
    }
  });
}


</script>