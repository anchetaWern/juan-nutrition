<template>
  <v-card class="nutrition-label pa-1 rounded-0" outlined>
 
    <h2 class="header mb-2">Nutrition Facts</h2>

    <Line />
    
    <div>{{ servingsPerContainer }} Servings Per Container</div>
    <div class="bold">Serving Size: {{ servingSize }}</div>
    <Bar />

    <div class="amount-per-serving bold">Amount Per Serving</div>
    <div class="calories-value d-flex justify-space-between">
        <div class="bold">Calories</div>
        <div class="bold">{{ calories }}kcal</div>
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
        <div class="d-flex justify-sm-start">
          <span class="capitalize">{{ item.name }}&nbsp;</span>
          <span>{{ formatNumber(item.amount) }}{{ item.unit }}</span>
        </div>

        <Line />

        <div v-if="item.composition" class="pl-4">
          <div
            v-for="(subItem, subIndex) in item.composition"
            :key="subIndex"
            class="p-0"
          >
            <div class="d-flex justify-sm-start">
              <span class="capitalize">{{ subItem.name }}&nbsp;</span>
              <span>{{ formatNumber(subItem.amount) }}{{ subItem.unit }}</span>
            </div>

            <Line inner />

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

.amount-per-serving {
    font-size: 12px;
}

.capitalize {
    text-transform: capitalize;
}
</style>
