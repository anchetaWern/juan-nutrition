<template>

  <v-card class="pt-0 pb-2 pl-0 pr-0 card text-center">
    <template v-slot:title>
      <v-icon v-if="arrow(nutrient.name, nutrient.amount)" :icon="`${arrow(nutrient.name, nutrient.amount)}`" size="x-small" :color="`${arrowColor(nutrient.name, nutrient.amount)}`"></v-icon>
      <span :class="`text-body-2 font-weight-bold ${valueColor(nutrient.name, nutrient.amount)}`">{{ wholeNumber(nutrient.amount) }}{{ nutrient.unit }}</span>
      
    </template>


    <v-card-text class="text-caption pa-1">
    {{ nutrient.name }}
    </v-card-text>

  </v-card>

</template>

<style scoped>
.card {
  width: 110px;
}
</style>

<script>
import { wholeNumber } from '@/helpers/Numbers';

const good_nutrients = ['dietary fiber', 'protein'];
const bad_nutrients = ['sodium', 'saturated fat', 'cholesterol', 'sugar'];

export default {
  props: {
    nutrient: {
      type: Object,
      required: false,
    },

    limits: {
      type: Object,
      required: false,
    }
  
  },

  setup(props) {

    const arrowColor = (name, amount) => {
      const limit = props.limits[name];

      // deficient: down red arrow
      // over-consumed: up red arrow
      // good coverage: none

      if (good_nutrients.includes(name)) {
        if (amount <= limit) {
          return 'red'; 
        } else if (amount > limit && amount <= limit * 1.2) {
          return ''; 
        } else if (amount > limit * 1.2) {
          return 'red'; 
        }
      }

      if (bad_nutrients.includes(name)) {
        const bufferAmount = limit * 0.2; 

        if (amount > limit) {
          return 'red'; 
        } else if (amount > limit - bufferAmount) {
          return 'orange'; 
        } else {
          return ''; 
        }
      }

      return '';
    }

    const arrow = (name, amount) => {
      const limit = props.limits[name];

      // deficient: down red arrow
      // over-consumed: up red arrow
      // good coverage: none

      if (good_nutrients.includes(name)) {
        if (amount <= limit) {
          return 'mdi-menu-down'; 
        } else if (amount > limit && amount <= limit * 1.2) {
          return ''; 
        } else if (amount > limit * 1.2) {
          return 'mdi-menu-up'; 
        }
      }

      if (bad_nutrients.includes(name)) {
        const bufferAmount = limit * 0.2; 

        if (amount > limit) {
          return 'mdi-menu-up'; 
        } else if (amount > limit - bufferAmount) {
          return 'mdi-menu-up'; 
        } else {
          return ''; 
        }
      }

      return '';
    }

    const valueColor = (name, amount) => {
      const limit = props.limits[name];

      if (good_nutrients.includes(name)) {
        if (amount <= limit) {
          return 'text-red'; 
        } else if (amount > limit && amount <= limit * 1.2) {
          return 'text-green'; 
        } else if (amount > limit * 1.2) {
          return 'text-red'; 
        }
      }

      if (bad_nutrients.includes(name)) {
        const bufferAmount = limit * 0.2; 

        if (amount > limit) {
          return 'text-red'; 
        } else if (amount > limit - bufferAmount) {
          return 'text-orange'; 
        } else {
          return ''; 
        }
      }

      return '';
    };

    return {
      valueColor,
      arrow,
      arrowColor
    }
  },

  data() {
    return {
      wholeNumber
    };
  },
  
}
</script>