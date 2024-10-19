<template>
  <div>
    <v-table density="compact">
      <tbody>
        
        <template v-for="nutrient in nutrientsWithPercentage" :key="nutrient.name">
            <tr>
                <td class="text-grey-darken-3">
                  <span class="small-text">{{ capitalizeWords(nutrient.name) }}</span>
                </td>
                <td class="text-grey-darken-3">
                    <span v-if="nutrient.unit" class="tiny-text">{{ formatNumber(amountPerContainer(nutrient.amount, servingsPerContainer, displayValuesPerContainer, newServingSize, newServingCount)) }}{{ nutrient.unit }}</span> <span v-if="nutrient.unit == null" class="tiny-text">-</span> <span v-if="nutrient.hasRecommendedDailyValues" class="tiny-text">/ {{ nutrient.dailyLimit }}{{ nutrient.unit }}</span><span v-if="nutrient.hasRecommendedDailyValues" class="small-text"> ({{ formatNumber(nutrient.percentage) }}%)</span>
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
                    <NutrientsTable 
                      :nutrients="nutrient.composition" 
                      :servingsPerContainer="servingsPerContainer" 
                      :displayValuesPerContainer="displayValuesPerContainer" 
                      :recommended_daily_values="recommended_daily_values"
                      :newServingSize="newServingSize"
                      :newServingCount="newServingCount" />
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
import { calculatePercentage, formatNumber } from '@/helpers/Numbers';
import { amountPerContainer } from '@/helpers/Nutrients';

export default {
  props: {
    nutrients: {
      type: Array,
      required: true
    },
    recommended_daily_values: {
      type: Object,
      required: true,
    },
    servingsPerContainer: {
      type: Number,
      required: false,
      default: 1
    },
    displayValuesPerContainer: {
      type: Boolean,
      required: true,
      default: true,
    },
    newServingSize: {
      type: Number,
      required: false,
      default: null,
    },
    newServingCount: {
      type: Number,
      required: false,
      default: null,
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

      const calculateNutrientPercentage = (nutrient_name, nutrient_value) => {
        if (props.recommended_daily_values.hasOwnProperty(nutrient_name)) {
          const reni_limit = props.recommended_daily_values[nutrient_name];
          const percentage = calculatePercentage(nutrient_value, reni_limit);
          
          return percentage;
          // return percentage > reni_limit ? reni_limit : percentage;
        }
        return 0; 
      }

      const getBackgroundColor = (value, daily_limit) => {
       
        return 'grey-darken-3';
        
      };

      const getColor = (value, daily_limit) => {
        const dv_percent = calculatePercentage(value, daily_limit);
        if (dv_percent >= 20) {
          return 'deep-purple-lighten-3';  
        } else if (dv_percent >= 6 && dv_percent <= 19) {
          return 'deep-purple-darken-1';
        }
        return 'deep-purple-darken-4';
      };

      const getReverse = (value, daily_limit) => {
        return value > daily_limit ? true : false;
      }

      const nutrientsWithPercentage = computed(() => {
       
        return props.nutrients.map(nutrient => {
          
          const daily_limit = props.recommended_daily_values[nutrient.name];
          const multiplier = props.displayValuesPerContainer ? props.servingsPerContainer : 1;
          const total_amount = amountPerContainer(nutrient.amount, props.servingsPerContainer, props.displayValuesPerContainer, props.newServingSize, props.newServingCount); // nutrient.amount * multiplier;
          const percentage = calculateNutrientPercentage(nutrient.name, total_amount);
          const hasRecommendedDailyValues = nutrients_with_recommended_daily_values.indexOf(nutrient.name) !== -1;

          return {
            ...nutrient,
            percentage,
            bgColor: getBackgroundColor(total_amount, daily_limit),
            color: getColor(total_amount, daily_limit),
            reverse: getReverse(total_amount, daily_limit), 
            hasRecommendedDailyValues: hasRecommendedDailyValues,
            dailyLimit: hasRecommendedDailyValues && props.recommended_daily_values[nutrient.name] ? props.recommended_daily_values[nutrient.name].toFixed(0) : null,
          };
        });
      });

      return {
          capitalizeWords,
          formatNumber,
          nutrients_with_recommended_daily_values,
          nutrientsWithPercentage,
          amountPerContainer,
      }
  }
  
};
</script>
