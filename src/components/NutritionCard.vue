<template>
  <div class="card-container">
  <v-card class="card">
    <template v-slot:title>
      <span :class="`text-body-1 font-weight-bold ${valueColor(nutrient.name, nutrient.amount)}`">{{ formatNumber(nutrient.amount) }}{{ nutrient.unit }}</span>
    </template>

    <v-card-text class="text-body-2">
    {{ nutrient.name }}
    </v-card-text>
  </v-card>
  </div>
</template>


<script>
import { formatNumber } from '@/helpers/Numbers';

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
      valueColor
    }
  },

  data() {
    return {
      formatNumber
    };
  },
  
}
</script>