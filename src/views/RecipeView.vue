<template>
 
    <v-container class="mt-5" id="recipe-container" v-if="recipe">
      <div class="text-h6 mb-2">Estimate recipe nutrients</div>
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


      const removeFood = (slug) => {

        const updated_recipe = recipe_data.filter((food) => {
          return food.description_slug !== slug;
        }); 

        localStorage.setItem('recipe', JSON.stringify(updated_recipe));

        recipe.value = updated_recipe;   

        delete servingSizes.value[slug];             

        localStorage.setItem('serving_sizes', JSON.stringify(servingSizes.value));

        emit('konto-child');
      }

      const updateServingSize = (slug, newServingSize) => {
        servingSizes.value[slug] = newServingSize;
        localStorage.setItem('serving_sizes', JSON.stringify(servingSizes.value));
      }

      return {
        removeFood,

        servingSizes,
        updateServingSize,
      }
    },

    data: () => ({
      recipe,
    }),
}
</script>