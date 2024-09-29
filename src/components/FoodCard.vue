<template>
  <v-card
    class="mx-auto"
    max-width="400"
  >
    <div class="d-flex justify-space-between">
      <div class="flex-grow-1" style="flex-basis: 33%;">
        <v-img
          class="align-end text-white"
          height="100"
          :src="food.title_image"
          cover
        >
        </v-img>
      </div>

      <div class="flex-grow-1" style="flex-basis: 67%;">

        <div class="d-flex justify-space-between">
          <v-card-text>
            <div class="text-body-2">
              <a :href="`/food/${food.description_slug}`">{{ limit(food.description) }}</a>

            </div>
          </v-card-text>

          <div>
            <v-btn size="x-small" icon="mdi-trash-can" color="red" variant="text" @click="removeFood(food.description_slug)"></v-btn>
          </div>
        </div>

        <div class="px-3 d-flex w-50">
          <v-text-field 
              v-model="localServingSize"
              @input="onInput"
              hide-details
              placeholder="Serving size" 
              variant="underlined" 
              dense 
              :suffix="food.serving_size_unit"
              height="10px"
              width="50px"
              single-line class="shrink">
          </v-text-field>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import { limit } from '@/helpers/Str';

export default {
  props: {
    food: {
      type: Object,
      required: true
    },

    removeFood: {
      type: Function,
      required: true
    },

    initialServingSize: {
      type: String,
      required: true
    }
    
  },

  data() {
    return {
      limit,
      localServingSize: this.initialServingSize 
    };
  },

  methods: {
    onInput() {
      this.$emit('update-serving-size', this.food.description_slug, this.localServingSize); 
    }
  }
}
</script>

<style scoped>
 .v-text-field .v-input__control .v-input__slot {
    min-height: auto !important;
    display: flex !important;
    align-items: center !important;
    font-size: 10px !important;
  }
</style>