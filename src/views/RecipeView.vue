<template>
 
    <v-container class="mt-5" id="recipe-container" v-if="recipe">
      <div class="text-h6 mb-2">Estimate recipe nutrients</div>

      <v-text-field
        v-model="servingCount"
        @input="onInput"
        label="Number of servings"
      ></v-text-field>

      <div v-for="food in recipe" :key="food.description_slug" class="mb-3">
        <FoodCard 
          :food="food" 
          :removeFood="removeFood" 
          :initialServingSize="servingSizes[food.description_slug]"
          @update-serving-size="updateServingSize" />
      </div>
      
    </v-container>
 
</template>

<style scoped>
#recipe-container {
  max-width: 450px;
}
</style>

<script>
import FoodCard from '@/components/FoodCard.vue';
import { ref } from 'vue';

const recipe = ref(null);

const servingCount = ref(1);


export default {
    components: {
      FoodCard,  
    },


    setup(props, { emit }) {
      const recipe_data = JSON.parse(localStorage.getItem('recipe'));
      const serving_sizes_data = JSON.parse(localStorage.getItem('serving_sizes'));
      const servingSizes = ref(serving_sizes_data ? serving_sizes_data : {});
     
      recipe.value = recipe_data;

      if (Object.keys(servingSizes).length === 0) {
        recipe_data.forEach(food => {
          servingSizes.value[food.description_slug] = food.serving_size;
        });
      }

      const serving_count = localStorage.getItem('serving_count');
      if (serving_count) {
        servingCount.value = serving_count;
      }


      const removeFood = (slug) => {

        const updated_recipe = recipe_data.filter((food) => {
          return food.description_slug !== slug;
        }); 

        localStorage.setItem('recipe', JSON.stringify(updated_recipe));

        recipe.value = updated_recipe;   

        delete servingSizes.value[slug];             

        localStorage.setItem('serving_sizes', JSON.stringify(servingSizes.value));

        emit('update-ingredient-count-child');
      }

      const updateServingSize = (slug, newServingSize) => {
        servingSizes.value[slug] = newServingSize;
        localStorage.setItem('serving_sizes', JSON.stringify(servingSizes.value));

        // todo: update nutrients when serving size is updated
        // inform the parent component so the updated data can trickle back to the nutrients table
        emit('update-serving-size-child');
      }

      

      return {
        removeFood,

        servingSizes,
        updateServingSize,
      }
    },

    data: () => ({
      recipe,
      servingCount
    }),

    methods: {
      onInput() {
        this.$emit('update-serving-count-child', this.servingCount); 
      }
    }
}
</script>