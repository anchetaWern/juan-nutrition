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
    
    <div>
      <div
        v-for="(item, index) in nutritionData"
        :key="index"
        class="p-0"
      >
        <div class="d-flex justify-sm-start" v-if="showNutrient(item.name)">
          <span :class="['capitalize', highlightNutrient(item.name, 'bold')]">{{ item.name }}&nbsp;</span>
          <span>{{ formatNumber(item.amount) }}{{ item.unit }}</span>
        </div>

        <Line v-if="showNutrient(item.name)" />

        <div v-if="item.composition && showNutrient(item.name)" class="pl-4">
          <div
            v-for="(subItem, subIndex) in item.composition"
            :key="subIndex"
            class="p-0"
          >
            <div class="d-flex justify-sm-start" v-if="showNutrient(subItem.name)">
              <span :class="['capitalize', highlightNutrient(subItem.name, 'semi-bold')]">{{ subItem.name }}&nbsp;</span>
              <span>{{ formatNumber(subItem.amount) }}{{ subItem.unit }}</span>
            </div>

            <Line v-if="showNutrient(subItem.name)" inner />

          </div>
        </div>
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
import Line from '@/components/Line.vue'
import Bar from '@/components/Bar.vue'
import { formatNumber } from '@/helpers/Numbers';

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
    }
  },

  setup(props) {
      return {
          formatNumber
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
