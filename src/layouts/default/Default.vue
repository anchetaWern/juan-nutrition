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
  // todo: how to access the current category from here
  // the problem is that it always defaults to 1
  // maybe just remove the category when searching
  router.push({ 
    name: 'Search', 
    query: { 
      q, 
    }
  });
}


</script>