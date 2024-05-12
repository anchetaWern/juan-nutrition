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

const updateItems = (description) => {
  
  router.push({ 
    name: 'Home', 
    query: { 
      description, 
    }
  });
}


</script>