<template>
  <div>
    <v-table density="compact">
      <tbody>
        
        <template v-for="nutrient in nutrientsWithPercentage" :key="nutrient.name">
            <tr>
                <td class="text-grey-darken-3">{{ capitalizeWords(nutrient.name) }}</td>
                <td class="text-grey-darken-3">
                    <span v-if="nutrient.unit">{{ nutrient.amount }}{{ nutrient.unit }}</span> <span v-if="nutrient.unit == null">-</span> <span v-if="nutrient.hasRecommendedDailyValues">/ {{ nutrient.dailyLimit }}{{ nutrient.unit }}</span>
                    <v-progress-linear 
                      v-if="recommended_daily_values && nutrient.hasRecommendedDailyValues" 
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
        'dietary fiber', 'protein', 'total fat', 'saturated fat', 'cholesterol', 'total carbohydrates', 'sugar', 
        'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'zinc', 'selenium', 'phosphorus', 'chloride', 'choline', 'chromium', 'copper',
        'iodine', 'manganese', 'molybdenum',
        'vitamin a', 'vitamin c', 'vitamin d', 'vitamin e', 'vitamin k', 
        'vitamin b1', 'vitamin b2', 'vitamin b3', 'vitamin b5', 'vitamin b6', 'vitamin b9', 'vitamin b12',
      ];

      const calculateReniPercentage = (nutrient_name, nutrient_value) => {
        if (props.recommended_daily_values.hasOwnProperty(nutrient_name)) {
          const reni_limit = props.recommended_daily_values[nutrient_name];
          const percentage = calculatePercentage(nutrient_value, reni_limit);
          return percentage > reni_limit ? reni_limit : percentage;
        }
        return 0; 
      }

      const daily_value_colors = ['blue', 'orange', 'red'];

      const getBackgroundColor = (value, daily_limit) => {
        // DV percentages: 
        /*
        5% and below = blue
        6 to 19% = orange
        20% upwards = red
        */
        const dv_percent = calculatePercentage(value, daily_limit);
        if (dv_percent >= 20) {
          return 'red-darken-1';  
        } else if (dv_percent >= 6 && dv_percent <= 19) {
          return 'orange-darken-1';
        }
        return 'blue-darken-1';
      };

      const getColor = (value, daily_limit) => {
        const dv_percent = calculatePercentage(value, daily_limit);
        if (dv_percent >= 20) {
          return 'red-darken-3';  
        } else if (dv_percent >= 6 && dv_percent <= 19) {
          return 'orange-darken-3';
        }
        return 'blue-darken-3';
      };

      const getReverse = (value, daily_limit) => {
        return value > daily_limit ? true : false;
      }

      const nutrientsWithPercentage = computed(() => {
        return props.nutrients.map(nutrient => {
          
          const daily_limit = props.recommended_daily_values[nutrient.name]
          const percentage = calculateReniPercentage(nutrient.name, nutrient.amount);
          const hasRecommendedDailyValues = nutrients_with_recommended_daily_values.indexOf(nutrient.name) !== -1;

          return {
            ...nutrient,
            percentage,
            bgColor: getBackgroundColor(nutrient.amount, daily_limit),
            color: getColor(nutrient.amount, daily_limit),
            reverse: getReverse(nutrient.amount, daily_limit), 
            hasRecommendedDailyValues: hasRecommendedDailyValues,
            dailyLimit: hasRecommendedDailyValues && props.recommended_daily_values[nutrient.name] ? props.recommended_daily_values[nutrient.name].toFixed(0) : null,
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
