<template>
  <v-card class="nutrition-label pa-1 rounded-0" outlined>
 
    <h2 class="header mb-2">Nutrition Facts</h2>

    <Line />
    
    <div>{{ servingsPerContainer }} Servings Per Container</div>
    <div class="bold">Serving Size: {{ servingSize }}g</div>
    <Bar />

    <div class="amount-per-serving bold">Amount Per Serving</div>
    <div class="calories-value d-flex justify-space-between">
        <div class="bold">Calories</div>
        <div class="bold">{{ calories }}</div>
    </div>
      

    <Bar />

    <div class="text-right bold small-text">% Daily Value*</div>

    <Line />
    
    <div v-if="nutrientsWithPercentage">
      <div
        v-for="(item, index) in nutrientsWithPercentage"
        :key="index"
        class="p-0"
      >
        <div class="d-flex justify-space-between">
          <div class="d-flex justify-sm-start" v-if="showNutrient(item.name)">
            <span :class="['capitalize', highlightNutrient(item.name, 'bold')]">{{ item.name }}&nbsp;</span>
            <span>{{ formatNumber(item.amount) }}{{ item.unit }}</span>
          </div>
          <div v-if="showNutrient(item.name) && item.hasRecommendedDailyValues && showDailyValue(item.name)">{{ formatNumber(item.percentage) }}%</div>
        </div>

        <Line v-if="showNutrient(item.name) && item.name !== 'protein'" />

        <div v-if="item.composition && showNutrient(item.name)" class="pl-4">
          <div
            v-for="(subItem, subIndex) in item.composition"
            :key="subIndex"
            class="p-0"
          >
            <div class="d-flex justify-space-between">
              <div class="d-flex justify-sm-start" v-if="showNutrient(subItem.name)">
                <span :class="['capitalize', highlightNutrient(subItem.name, 'semi-bold')]">{{ subItem.name }}&nbsp;</span>
                <span>{{ formatNumber(subItem.amount) }}{{ subItem.unit }}</span>
              </div>
              
              <div v-if="showNutrient(subItem.name) && subItem.hasRecommendedDailyValues && showDailyValue(subItem.name)">{{ formatNumber(subItem.percentage) }}%</div>
            </div>

            <Line v-if="showNutrient(subItem.name)" inner />

          </div>
        </div>

        <Bar v-if="item.name === 'protein'" />

      </div>
    </div>

    <div v-if="ingredients">
        <div class="bold small-text">Ingredients:</div> 
        <div class="tiny-text">
        {{ ingredients }}
        </div>
    </div>
   
  </v-card>
</template>

<script>
import { computed } from 'vue';
import Line from '@/components/Line.vue'
import Bar from '@/components/Bar.vue'
import { calculatePercentage, formatNumber } from '@/helpers/Numbers';
import { amountPerContainer, sortNutrients } from '@/helpers/Nutrients';

const showNutrients = [
    'total fat', 'saturated fat', 'cholesterol', 'unsaturated fat',
    'protein', 
    'total carbohydrates', 'dietary fiber', 'sugar',
    'vitamin a', 'vitamin c', 
    'vitamin b1', 'vitamin b2', 'vitamin b3', 'vitamin b6', 'vitamin b12',
    'calcium', 'iron',
    'vitamin d', 'vitamin e',
    'potassium', 'magnesium', 'zinc', 
];

const highlightedNutrients = [
  'total fat', 'saturated fat', 'cholesterol', 'sodium', 
  'total carbohydrates', 'dietary fiber', 'sugar',
  'protein', 
  'vitamin a', 'vitamin c', 
  'calcium', 'iron'
];

export default {
  name: "NutritionLabel",
  components: {
      Line,
      Bar
  },
  props: {
    servingsPerContainer: {
      type: String,
      required: true,
    },
    servingSize: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    nutritionData: {
      type: Array,
      required: true,
    },
    ingredients: {
        type: String,
        required: false,
    },
    recommended_daily_values: {
        type: Object,
        required: true,
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


      const nutrientsWithPercentage = computed(() => {
       
        return sortNutrients(props.nutritionData).map(nutrient => {
          
          const total_amount = amountPerContainer(nutrient.amount, props.servingsPerContainer, false, props.servingSize, props.servingSize, 1); // nutrient.amount * multiplier;
          const percentage = calculateNutrientPercentage(nutrient.name, total_amount);

          const hasRecommendedDailyValues = nutrients_with_recommended_daily_values.indexOf(nutrient.name) !== -1;

          let processedNutrient = {
            ...nutrient,
            percentage,
            hasRecommendedDailyValues,
            dailyLimit: hasRecommendedDailyValues && props.recommended_daily_values[nutrient.name] 
              ? props.recommended_daily_values[nutrient.name].toFixed(0) 
              : null
          };

       
          if (nutrient.composition && Array.isArray(nutrient.composition)) {
            processedNutrient.composition = nutrient.composition.map(sub_item => {
              const sub_total_amount = amountPerContainer(
                sub_item.amount, 
                props.servingsPerContainer, 
                false, 
                props.servingSize, 
                props.servingSize, 
                1
              );

              return {
                ...sub_item,
                percentage: calculateNutrientPercentage(sub_item.name, sub_total_amount),
                hasRecommendedDailyValues: nutrients_with_recommended_daily_values.includes(sub_item.name),
                dailyLimit: nutrients_with_recommended_daily_values.includes(sub_item.name) && props.recommended_daily_values[sub_item.name]
                  ? props.recommended_daily_values[sub_item.name].toFixed(0)
                  : null
              };
            });
          }

          return processedNutrient;

        });
      });


      return {
          formatNumber,
          nutrientsWithPercentage
      }
  },

  methods: {
      showNutrient(nutrient) {
        return showNutrients.indexOf(nutrient) !== -1;
      },

      highlightNutrient(nutrient, classname) {
        if (highlightedNutrients.indexOf(nutrient) !== -1) {
          return classname;
        }
        return '';
      },

      showDailyValue(nutrient) {
        if (highlightedNutrients.indexOf(nutrient) !== -1) {
          return true;
        }
        return false;
      }
  }
};
</script>

<style scoped>
.header {
    font-size: 1.5rem;
    font-weight: 1000;
}

.nutrition-label {
  border: 1px solid #000 !important;
  max-width: 400px;
  background: #fff;
}

.calories-value {
  font-size: 1.5rem;
  line-height: 1.5rem;
}

.bold {
    font-weight: 1000;
}

.semi-bold {
    font-weight: 800;
}

.amount-per-serving {
    font-size: 12px;
}

.capitalize {
    text-transform: capitalize;
}
</style>
