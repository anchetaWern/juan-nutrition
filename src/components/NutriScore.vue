<template>
  <div class="nutri-score">
    <v-btn variant="text" size="x-small" icon="mdi-help" class="float-end pb-1" @click="nutriScoreDialog = true"></v-btn>
    <img :src="getImageSrc()" />
    
  </div>


  <v-dialog
    v-model="nutriScoreDialog"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <template v-slot:default="{ isActive }">
      <v-card title="Nutri-score">
        <template v-slot:text>
          <div class="text-body-2">
          Nutri-Score is a front-of-pack nutritional label designed to help consumers make healthier food choices at a glance. Developed in France, it provides a simple, color-coded system that grades food products based on their nutritional quality. The scale ranges from 'A' to 'E'.
          </div>
          
          <ul class="pt-3 pl-3">
              <li>
                  <div class="text-body-2 font-weight-medium">A (Green)</div>
                  <div class="text-caption mb-2">
                  Foods and beverages in this category are considered the healthiest options. They have high levels of beneficial nutrients and lower levels of detrimental components.
                  High in fiber, protein, vitamins, and minerals; low in saturated fats, sugars, and sodium.
                  Examples include: Fresh fruits and vegetables, whole grains, legumes, lean meats, fish, low-fat dairy products.
                  </div>
              </li>
              <li>
                  <div class="text-body-2 font-weight-medium">B (Light Green)</div>
                  <div class="text-caption mb-2">
                  These items are still good choices but may contain slightly higher levels of less desirable nutrients compared to 'A' rated items.
                  Generally healthy, with a good balance of beneficial nutrients and moderate levels of sugars, fats, or sodium.
                  Examples include: Whole grain bread, low-sugar cereals, lean deli meats, yogurt with moderate fat content.
                  </div>
              </li>
              <li>
                  <div class="text-body-2 font-weight-medium">C (Yellow)</div>
                  <div class="text-caption mb-2">
                  Foods in this category have an average nutritional quality. They may contain both positive and negative nutrient factors in moderate amounts.
                  Contains a balanced mix of nutrients but might have higher levels of saturated fats, sugars, or sodium compared to 'A' and 'B' categories.
                  Examples include: Cheese, sweetened yogurt, processed meats, some breakfast cereals.
                  </div>
              </li>
              <li>
                  <div class="text-body-2 font-weight-medium">D (Orange)</div>
                  <div class="text-caption mb-2">
                  These items have lower nutritional quality and are often higher in less desirable nutrients. 
                  Higher in calories, sugars, saturated fats, and sodium; lower in beneficial nutrients like fiber and protein.
                  Examples include: Sweetened beverages, high-fat processed foods, pastries, sugary snacks.
                  </div>
              </li>
              <li>
                  <div class="text-body-2 font-weight-medium">E (Red)</div>
                  <div class="text-caption mb-2">
                  Foods and beverages in this category are the least healthy options. They are typically high in calories, sugars, saturated fats, and sodium.
                  High in unhealthy nutrients; very low in beneficial components such as fiber, protein, and essential vitamins and minerals.
                  Examples include: Candy, soft drinks, chips, fast food items, processed snacks.
                  </div>
              </li>
              
          </ul>
        </template>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="ok"
            variant="flat"
            @click="isActive.value = false"
          ></v-btn>
        </v-card-actions>

      </v-card>
    </template>
  </v-dialog>

</template>

<script>
import { ref } from 'vue';
import A from '@/assets/images/nutriscore/nutriscore-A.svg';
import B from '@/assets/images/nutriscore/nutriscore-B.svg';
import C from '@/assets/images/nutriscore/nutriscore-C.svg';
import D from '@/assets/images/nutriscore/nutriscore-D.svg';
import E from '@/assets/images/nutriscore/nutriscore-E.svg';

const nutriScoreDialog = ref(false);

export default {
  props: {
    currentGrade: {
      type: String,
      required: true,
      validator: function (value) {
        return ['A', 'B', 'C', 'D', 'E'].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      nutriScoreDialog,
      images: {
        'A': A,
        'B': B,
        'C': C,
        'D': D,
        'E': E,
      }
    };
  },
  methods: {
    getImageSrc() {
      return this.images[this.currentGrade];
    }
  }
};
</script>

<style scoped>
.nutri-score {
  margin-top: 10px;
  text-align: center;
}

.nutri-score img {
  width: 150px;
  height: auto;
}
</style>
