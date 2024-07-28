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
      <v-card title="Nutri-score" :subtitle="`Grade: ${nutriscore.grade} (${nutriscore.total_negative} - ${nutriscore.total_positive} = ${nutriscore.points} points)`">
        <template v-slot:text>

          <div class="mb-3">
            <v-alert 
              density="compact"
              type="warning"
              variant="outlined"
            >
              Note that the Nutri-score computation is still a work in progress. <span v-if="showNutriScoreAlert"> Specifically, it has a flaw in the computation of points for fruits, vegetables and legumes. Detailed ingredient data is needed to estimate the percentage of fruits, vegetables, and legumes so the developer decided to just set it to 100% if the food belongs to any of those aformentioned categories.</span>
              <div>
                <v-btn size="x-small" variant="text" @click="toggleNutriScoreAlert">{{ showNutriScoreAlert ? "Read less" : "Read more" }}</v-btn>
              </div>
            </v-alert>
          </div>


          <div class="mb-5">
            <div class="mb-2">
              <div class="text-body-1">
              Negative Points <span class="text-subtitle-2 text-grey-darken-1">{{ nutriscore.total_positive }}/40 points</span>
              </div>
            </div>

            <div class="d-flex flex-row align-center justify-space-between mb-2">
              <div>
                <div class="text-body-2">
                Calories
                </div>
                <div class="text-caption text-grey-darken-1">{{ nutriscore.details.negative_points.energy }}/10 points</div>
              </div>

              <div>
                <v-rating
                  v-model="nutriscore.details.negative_points.energy"
                  length="10"
                  readonly
                  empty-icon="mdi-square-outline"
                  full-icon="mdi-square"
                  active-color="red-darken-2"
                  color="red-darken-2"
                  size="x-small"
                  density="compact"
                ></v-rating>
              </div> 
            </div>

            <div class="d-flex flex-row align-center justify-space-between mb-2">
              <div>
                <div class="text-body-2">
                Sugar
                </div>
                <div class="text-caption text-grey-darken-1">{{ nutriscore.details.negative_points.simple_sugars }}/10 points</div>
              </div>

              <div>
                <v-rating
                  v-model="nutriscore.details.negative_points.simple_sugars"
                  length="10"
                  readonly
                  empty-icon="mdi-square-outline"
                  full-icon="mdi-square"
                  active-color="red-darken-2"
                  color="red-darken-2"
                  size="x-small"
                  density="compact"
                ></v-rating>
              </div> 
              
            </div>

            <div class="d-flex flex-row align-center justify-space-between mb-2">
              <div>
                <div class="text-body-2">
                Saturated Fat
                </div>
                <div class="text-caption text-grey-darken-1">
                {{ nutriscore.details.negative_points.saturated_fats }}/10 points
                </div>
              </div>

              <div>
                <v-rating
                  v-model="nutriscore.details.negative_points.saturated_fats"
                  length="10"
                  readonly
                  empty-icon="mdi-square-outline"
                  full-icon="mdi-square"
                  active-color="red-darken-2"
                  color="red-darken-2"
                  size="x-small"
                  density="compact"
                ></v-rating>
              </div> 
              
            </div>

            <div class="d-flex flex-row align-center justify-space-between">
              <div>
                <div class="text-body-2">
                Sodium
                </div>
                <div class="text-caption text-grey-darken-1">
                {{ nutriscore.details.negative_points.salt }}/10 points
                </div>
              </div>

              <div>
                <v-rating
                  v-model="nutriscore.details.negative_points.saturated_fats"
                  length="10"
                  readonly
                  empty-icon="mdi-square-outline"
                  full-icon="mdi-square"
                  active-color="red-darken-2"
                  color="red-darken-2"
                  size="x-small"
                  density="compact"
                ></v-rating>
              </div> 
              
            </div>


            <div class="mb-2 mt-5">
              <div class="text-body-1">
              Positive Points <span class="text-subtitle-2 text-grey-darken-1">{{ nutriscore.total_positive }}/15 points</span>
              </div>
            </div>

            <div class="d-flex flex-row align-center justify-space-between mb-2">
              <div>
                <div class="text-body-2">
                Proteins
                </div>
                <div class="text-caption text-grey-darken-1">
                {{ nutriscore.details.positive_points.protein }}/5 points
                </div>
              </div>

              <div>
                <v-rating
                  v-model="nutriscore.details.positive_points.protein"
                  length="5"
                  readonly
                  empty-icon="mdi-square-outline"
                  full-icon="mdi-square"
                  active-color="green-darken-2"
                  color="green-darken-2"
                  size="x-small"
                  density="compact"
                ></v-rating>
              </div> 
            </div>

            <div class="d-flex flex-row align-center justify-space-between mb-2">
              <div>
                <div class="text-body-2">
                Fiber
                </div>
                <div class="text-caption text-grey-darken-1">{{ nutriscore.details.positive_points.fiber }}/5 points</div>
              </div>

              <div>
                <v-rating
                  v-model="nutriscore.details.positive_points.fiber"
                  length="5"
                  readonly
                  empty-icon="mdi-square-outline"
                  full-icon="mdi-square"
                  active-color="green-darken-2"
                  color="green-darken-2"
                  size="x-small"
                  density="compact"
                ></v-rating>
              </div> 
              
            </div>

            <div class="d-flex flex-row align-center justify-space-between">
              <div>
                <div class="text-body-2">
                Fruits, vegetables, legumes
                </div>
                <div class="text-caption text-grey-darken-1">
                {{ nutriscore.details.positive_points.fruits_vegetables_nuts_legumes }}/5 points
                </div>
              </div>

              <div>
                <v-rating
                  v-model="nutriscore.details.positive_points.fruits_vegetables_nuts_legumes"
                  length="5"
                  readonly
                  empty-icon="mdi-square-outline"
                  full-icon="mdi-square"
                  active-color="green-darken-2"
                  color="green-darken-2"
                  size="x-small"
                  density="compact"
                ></v-rating>
              </div> 
              
            </div>
          </div>


          <v-divider></v-divider>

          <div class="text-body-1 pt-3 mb-3">What is Nutri-score? </div>

          <div class="text-body-2">
          The <a href="https://www.santepubliquefrance.fr/en/nutri-score" target="_blank">Nutri-Score</a>, also known as the 5-Colour Nutrition label or 5-CNL, is a five-colour nutrition label and nutritional rating system, and an attempt to simplify the nutritional rating system demonstrating the overall nutritional value of food products. It assigns products a rating letter from A (best) to E (worst), with associated colors from green to red.
          </div>

          <img :src="getImageSrc()" />
          
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
    nutriscore: {
      type: Object,
      required: true
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
      },

      showNutriScoreAlert: false,
    };
  },
  methods: {
    getImageSrc() {
      return this.images[this.nutriscore.grade];
    },

    toggleNutriScoreAlert() {
      this.showNutriScoreAlert = !this.showNutriScoreAlert;
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