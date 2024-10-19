<template>

  <v-card class="pt-0 pb-2 pl-0 pr-0 card text-center">
    <template v-slot:title>
      <v-icon v-if="arrow(nutrient.name, nutrient.amount)" :icon="`${arrow(nutrient.name, nutrient.amount)}`" size="x-small" :color="`${arrowColor(nutrient.name, nutrient.amount)}`"></v-icon>
      <span :class="`text-body-2 font-weight-bold ${valueColor(nutrient.name, nutrient.amount)}`">{{ wholeNumber(nutrient.amount) }}{{ nutrient.unit }}</span>
      
    </template>


    <v-card-text class="text-caption pa-1">
    {{ nutrient_short_names.hasOwnProperty(nutrient.name) ? nutrient_short_names[nutrient.name] : nutrient.name }}
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

const good_nutrients = ['dietary fiber', 'protein', 'total carbohydrates', 'total fat'];
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

/* 
Excessive = > 125% DV (over-consumed)
Adequate = 75 to 125% DV (good coverage)
Fair / Inadequate = 50 to 74% DV (deficient)
Poor / Starvation = < 50% DV (deficient)
*/

  setup(props) {

    const nutrient_short_names = {
      'total carbohydrates': 'total carbs',
    };

    const arrowColor = (name, amount) => {
      const limit = props.limits[name];
      const lower_limit = limit * .75;
      const upper_limit = limit * 1.25;

      // deficient: down red arrow
      // over-consumed: up red arrow
      // good coverage: none

      if (good_nutrients.includes(name)) { // use adequate criteria
        if (amount < lower_limit) {
          return 'red'; 
        } else if (amount >= lower_limit && amount <= upper_limit) {
          return ''; 
        } else if (amount > upper_limit) {
          return 'red'; 
        }
      }

      if (bad_nutrients.includes(name)) { // use excessive criteria
        const bufferAmount = limit * 1.25; 

        if (amount > bufferAmount) {
          return 'red'; 
        } else if (amount > limit) {
          return 'orange'; 
        } else {
          return ''; 
        }
      }

      return '';
    }

    const arrow = (name, amount) => {
      const limit = props.limits[name];
      const lower_limit = limit * .75;
      const upper_limit = limit * 1.25;

      // deficient: down red arrow
      // over-consumed: up red arrow
      // good coverage: none

      if (good_nutrients.includes(name)) {
        if (amount < lower_limit) {
          return 'mdi-menu-down'; 
        } else if (amount >= lower_limit && amount <= upper_limit) {
          return ''; 
        } else if (amount > upper_limit) {
          return 'mdi-menu-up'; 
        }
      }

      if (bad_nutrients.includes(name)) {
        const bufferAmount = limit * 1.25; 

        if (amount > bufferAmount) {
          return 'mdi-menu-up'; 
        } else if (amount > limit) {
          return 'mdi-menu-up'; 
        } else {
          return ''; 
        }
      }

      return '';
    }

    const valueColor = (name, amount) => {
      const limit = props.limits[name];
      const lower_limit = limit * .75;
      const upper_limit = limit * 1.25;

      if (good_nutrients.includes(name)) {
        if (amount < lower_limit) {
          return 'text-red'; 
        } else if (amount >= lower_limit && amount <= upper_limit) {
          return 'text-green'; 
        } else if (amount > upper_limit) {
          return 'text-red'; 
        }
      }

      if (bad_nutrients.includes(name)) {
        const bufferAmount = limit * 1.25; 

        if (amount > bufferAmount) {
          return 'text-red'; 
        } else if (amount > limit) {
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
      arrowColor,

      nutrient_short_names,
    }
  },

  data() {
    return {
      wholeNumber
    };
  },
  
}
</script>