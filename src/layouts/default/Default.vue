<template>
  <v-app>
    <default-bar :updateItems="updateItems" />

    <default-view :items="items" />
  </v-app>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router'

import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'

const router = useRouter();

const currentRoute = computed(() => router.currentRoute.value);

const updateItems = (q) => {
  
  const category = currentRoute.value.query.category;

  router.push({ 
    name: 'Search', 
    query: { 
      category,
      q, 
    }
  });
}


</script>