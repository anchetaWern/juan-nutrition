<template>
  <v-app>
    <default-bar :updateItems="updateItems" :ingredientCount="ingredientCount" />

    <default-view 
      :items="items" 
      @update-ingredient-count="updateIngredientCount" 
      @update-serving-size="updateServingSize"
      @update-serving-count="updateServingCount" />
  </v-app>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'

import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'

const router = useRouter();

const ingredientCount = ref(0);

const updateNutrients = (nutrients, original_serving_size, new_serving_size) => {

  return nutrients.map((nutrient) => {
    const new_amount = (new_serving_size / original_serving_size) * nutrient.amount;
    let new_composition = null;
    if (nutrient.composition) {
      new_composition = updateNutrients(nutrient.composition, original_serving_size, new_serving_size);
    }
    const updated_nutrients = {
      ...nutrient,
      amount: new_amount,
    }
    if (new_composition) {
      Object.assign(updated_nutrients, {
        composition: new_composition
      });
    }

    return updated_nutrients;
  });

}

const calculateNutrients = (recipe, serving_sizes) => {
  console.log('SERVING SIZES: ', serving_sizes);
  // todo: go through each food and add up all of its nutrients
  recipe.forEach((food) => {
    const new_serving_size = serving_sizes[food.description_slug];
    // console.log('SLUG: ', food.description_slug, new_serving_size);

    // console.log(food.nutrients);
    const updated_nutrients = updateNutrients(food.nutrients, food.serving_size, new_serving_size);
    console.log('UPDATED NUTRIENTS: '),
    console.log(updated_nutrients);

    // todo: add a text field for entering serving size

    // todo: get the common nutrients in the foods added

    // todo: come up with a single nutrient object by adding the values of the common nutrients

    // todo: pass the nutrients and serving size to the NutrientsTable component
  });
}

onMounted(() => {
  const recipe_data = JSON.parse(localStorage.getItem('recipe'));
  const serving_sizes = JSON.parse(localStorage.getItem('serving_sizes'));
  if (recipe_data && serving_sizes) {
    ingredientCount.value = recipe_data.length;

    calculateNutrients(recipe_data, serving_sizes);
  }
});

const updateIngredientCount = () => {
  const recipe_data = JSON.parse(localStorage.getItem('recipe'));
  if (recipe_data) {
    ingredientCount.value = recipe_data.length;
    calculateNutrients(recipe_data);
  }
}

const updateServingSize = () => {
  console.log('updateServingSize from parent');
  const serving_sizes = JSON.parse(localStorage.getItem('serving_sizes'));
  if (serving_sizes) {
    console.log('serving sizes: ', serving_sizes);
  } 
}

const updateServingCount = (servingCount) => {
  console.log('update serving count: ', servingCount);

  localStorage.setItem('serving_count', servingCount);
}

const currentRoute = computed(() => router.currentRoute.value);

const updateItems = (q) => {
  
  const category = currentRoute.value.query.category;

  router.push({ 
    name: 'Search', 
    query: { 
      category,
      q, 
    }
  });
}
</script>