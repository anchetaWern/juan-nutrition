<template>
  <div>
    <v-table density="compact">
      <tbody>
        
        <template v-for="nutrient in nutrients" :key="nutrient.name">
            <tr>
                <td class="text-grey-darken-3">{{ capitalizeWords(nutrient.name) }}</td>
                <td class="text-grey-darken-3">
                    {{ nutrient.amount }}{{ nutrient.unit }} <span v-if="nutrients_with_reni.indexOf(nutrient.name) !== -1">/ {{ reni_percentages[nutrient.name].toFixed(0) }}{{ nutrient.unit }}</span>
                    <v-progress-linear v-if="reni_percentages && nutrients_with_reni.indexOf(nutrient.name) !== -1" :model-value="calculateReniPercentage(nutrient.name, nutrient.amount)" color="primary"></v-progress-linear>
                </td>
            </tr>

            <tr v-if="nutrient.composition">
                <td colspan="2">
                    <NutrientsTable :nutrients="nutrient.composition" :reni_percentages="reni_percentages" />
                </td>
            </tr>
        </template>

      </tbody>
    </v-table>
    
  </div>
</template>

<script>
import {capitalizeWords} from '@/helpers/Str';
import {calculatePercentage} from '@/helpers/Numbers';

export default {
  props: {
    nutrients: {
      type: Array,
      required: true
    },
    reni_percentages: {
      type: Object,
      required: true,
    }
  },


  setup(props) {
    
      const nutrients_with_reni = [
        'dietary fiber', 'protein', 'total fat', 'total carbohydrates', 'sugar', 
        'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'zinc', 'selenium', 
        'vitamin a', 'vitamin c', 'vitamin d', 'vitamin e', 'vitamin k', 
        'vitamin b1', 'vitamin b2', 'vitamin b3', 'vitamin b6', 'vitamin b9', 'vitamin b12',
      ];

      const calculateReniPercentage = (nutrient_name, nutrient_value) => {
        if (props.reni_percentages.hasOwnProperty(nutrient_name)) {
          const percentage = calculatePercentage(nutrient_value, props.reni_percentages[nutrient_name]);
          return percentage;
        }
        return 0;
        
      }

      return {
          capitalizeWords,
          calculatePercentage,

          calculateReniPercentage,

          nutrients_with_reni,
      }
  }
  
};
</script>
