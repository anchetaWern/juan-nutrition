<template>
  <div>
    <v-table density="compact">
      <tbody>
        
        <template v-for="nutrient in nutrientsWithPercentage" :key="nutrient.name">
            <tr>
                <td class="text-grey-darken-3">{{ capitalizeWords(nutrient.name) }}</td>
                <td class="text-grey-darken-3">
                    {{ nutrient.amount }}{{ nutrient.unit }} <span v-if="nutrient.hasReni">/ {{ nutrient.reniLimit }}{{ nutrient.unit }}</span>
                    <v-progress-linear 
                      v-if="recommended_daily_values && nutrient.hasReni" 
                      :model-value="nutrient.percentage" 
                      :bg-color="nutrient.bgColor" 
                      :color="nutrient.color"
                      :reverse="nutrient.reverse"></v-progress-linear>
                </td>
            </tr>

            <tr v-if="nutrient.composition">
                <td colspan="2">
                    <NutrientsTable :nutrients="nutrient.composition" :recommended_daily_values="recommended_daily_values" />
                </td>
            </tr>
        </template>

      </tbody>
    </v-table>
    
  </div>
</template>

<script>
import { computed } from 'vue';
import { capitalizeWords } from '@/helpers/Str';
import { calculatePercentage } from '@/helpers/Numbers';

export default {
  props: {
    nutrients: {
      type: Array,
      required: true
    },
    recommended_daily_values: {
      type: Object,
      required: true,
    }
  },


  setup(props) {
    
      const nutrients_with_recommended_daily_values = [
        'dietary fiber', 'protein', 'total fat', 'total carbohydrates', 'sugar', 
        'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'zinc', 'selenium', 
        'vitamin a', 'vitamin c', 'vitamin d', 'vitamin e', 'vitamin k', 
        'vitamin b1', 'vitamin b2', 'vitamin b3', 'vitamin b6', 'vitamin b9', 'vitamin b12',
      ];

      const calculateReniPercentage = (nutrient_name, nutrient_value) => {
        if (props.recommended_daily_values.hasOwnProperty(nutrient_name)) {
          const reni_limit = props.recommended_daily_values[nutrient_name];
          const percentage = calculatePercentage(nutrient_value, reni_limit);
          return percentage > reni_limit ? reni_limit : percentage;
        }
        return 0; 
      }

      const getBackgroundColor = (value, reni_percent_value) => {
        return value > reni_percent_value ? 'red-darken-1' : 'blue-darken-1';
      };

      const getColor = (value, reni_percent_value) => {
        return value > reni_percent_value ? 'red-darken-3' : 'blue-darken-3';
      };

      const getReverse = (value, reni_percent_value) => {
        return value > reni_percent_value ? true : false;
      }

      const nutrientsWithPercentage = computed(() => {
        return props.nutrients.map(nutrient => {
          
          const reni_percent_value = props.recommended_daily_values[nutrient.name]
          const percentage = calculateReniPercentage(nutrient.name, nutrient.amount);
          const hasReni = nutrients_with_recommended_daily_values.indexOf(nutrient.name) !== -1;

          return {
            ...nutrient,
            percentage,
            bgColor: getBackgroundColor(nutrient.amount, reni_percent_value),
            color: getColor(nutrient.amount, reni_percent_value),
            reverse: getReverse(nutrient.amount, reni_percent_value), 
            hasReni: hasReni,
            reniLimit: hasReni ? props.recommended_daily_values[nutrient.name].toFixed(0) : null,
          };
        });
      });

      return {
          capitalizeWords,
          
          nutrients_with_recommended_daily_values,
          nutrientsWithPercentage,
      }
  }
  
};
</script>
