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
                    <span v-if="nutrient.unit" class="tiny-text">
                    {{ formatNumber(amountPerContainer(nutrient.amount, servingsPerContainer, displayValuesPerContainer, originalServingSize, newServingSize, newServingCount)) }}
                    {{ nutrient.unit }}</span> 
                    <span v-if="nutrient.unit == null" class="tiny-text">-</span> 
                    <span v-if="nutrient.hasRecommendedDailyValues" class="tiny-text">/ {{ nutrient.dailyLimit }}{{ nutrient.unit }}</span>
                    <span v-if="nutrient.hasRecommendedDailyValues" class="small-text"> ({{ formatNumber(nutrient.percentage) }}%)</span>

                    <span class="ml-1">
                    <v-chip 
                      size="x-small" 
                      :color="nutrient.fao_claim_color" 
                      density="comfortable" 
                      v-if="nutrient.fao_claim">
                      {{ nutrient.fao_claim }}
                    </v-chip>
                    </span>
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
                      :originalServingSize="originalServingSize"
                      :newServingSize="newServingSize"
                      :newServingCount="newServingCount"
                      :getValueColor="getValueColor"
                      :foodState="foodState"
                      :foodCalories="foodCalories"
                      :faoNutrientContentClaims="faoNutrientContentClaims" />
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
import { amountPerContainer, FAONutrientContentClaim } from '@/helpers/Nutrients';

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
    originalServingSize: {
      type: Number,
      required: false,
      default: null,
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
    },
    getValueColor: {
      type: Function,
      required: true,
    },

    foodState: {
      type: String,
      required: true,
    },

    foodCalories: {
      type: Number,
      required: true,
    },

    faoNutrientContentClaims: {
      type: Array,
      required: false,
    }

  },


  setup(props) {
    
      const nutrients_with_recommended_daily_values = [
        'dietary fiber', 'protein', 'total fat', 'saturated fat', 'cholesterol', 'total carbohydrates', 'sugar', 
        'sodium', 'potassium', 'calcium', 'fluoride', 'iron', 'magnesium', 'zinc', 'selenium', 'phosphorus', 'chloride', 'choline', 'chromium', 'copper',
        'iodine', 'manganese', 'molybdenum',
        'vitamin a', 'vitamin c', 'vitamin d', 'vitamin e', 'vitamin k', 
        'vitamin b1', 'vitamin b2', 'vitamin b3', 'vitamin b5', 'vitamin b6', 'vitamin b9', 'vitamin b12',
      ];

      const calculateNutrientPercentage = (nutrient_name, nutrient_value) => {
        if (props.recommended_daily_values.hasOwnProperty(nutrient_name)) {
          const reni_limit = props.recommended_daily_values[nutrient_name];
          const percentage = calculatePercentage(nutrient_value, reni_limit);
          
          return percentage;
        }
        return 0; 
      }

      const getReverse = (value, daily_limit) => {
        return value > daily_limit ? true : false;
      }

      const getFAOColor = (value) => {
        const fao_colors = {
            'free': 'blue-grey-lighten-1',
            'very low': 'blue-grey-darken-1',
            'low': 'blue',
            'source': 'orange-darken-2',
            'high': 'red'
        };
        return fao_colors[value];
      }

      const nutrientsWithPercentage = computed(() => {
       
        return props.nutrients.map(nutrient => {
          
          const daily_limit = props.recommended_daily_values[nutrient.name]; 
          const multiplier = props.displayValuesPerContainer ? props.servingsPerContainer : 1;
          const total_amount = amountPerContainer(nutrient.amount, props.servingsPerContainer, props.displayValuesPerContainer, props.originalServingSize, props.newServingSize, props.newServingCount); // nutrient.amount * multiplier;
          const total_amount_per_100g = amountPerContainer(nutrient.amount, props.servingsPerContainer, props.displayValuesPerContainer, props.originalServingSize, 100, 1);
          const percentage = calculateNutrientPercentage(nutrient.name, total_amount);

          // todo: update this so it comes from the FAO NRV
          // or leave the calculation to the Nutrients helper
          const percentage_per_100g = calculateNutrientPercentage(nutrient.name, total_amount_per_100g); 
          
          const hasRecommendedDailyValues = nutrients_with_recommended_daily_values.indexOf(nutrient.name) !== -1;

          // issue: saturated fat is nested
          let saturated_fat_value = null;
      
          if (nutrient.name === 'cholesterol') {
            const saturated_fat = props.nutrients.find(itm => itm.name === 'saturated fat');
            saturated_fat_value = saturated_fat ? saturated_fat.amount : null;
          }
          
          let fao_claim = null;
          let fao_claim_color = null;

          if (props.faoNutrientContentClaims) {
            fao_claim = FAONutrientContentClaim(
              nutrient.name, total_amount, percentage_per_100g, 
              props.originalServingSize, props.foodState, 
              props.faoNutrientContentClaims,
              props.foodCalories, saturated_fat_value
            );
            fao_claim_color = getFAOColor(fao_claim);
          }

          return {
            ...nutrient,
            percentage,
            total_amount_per_100g,
            percentage_per_100g,
            bgColor: 'grey-darken-3',
            color: props.getValueColor(total_amount, daily_limit),
            reverse: getReverse(total_amount, daily_limit), 
            hasRecommendedDailyValues: hasRecommendedDailyValues,
            dailyLimit: hasRecommendedDailyValues && props.recommended_daily_values[nutrient.name] ? props.recommended_daily_values[nutrient.name].toFixed(0) : null,
            fao_claim,
            fao_claim_color,
          };
        });
      });

      return {
          capitalizeWords,
          formatNumber,
          nutrients_with_recommended_daily_values,
          nutrientsWithPercentage,
          amountPerContainer,
          FAONutrientContentClaim,
          getFAOColor,
      }
  }
  
};
</script>
