<template>
  <div class="mt-5" v-if="food">
    
    <div class="pt-3">
        <h1 class="text-h5 text-center">{{ food.description }}</h1>
        <h6 class="text-body-1 text-center text-grey-darken-3">{{ food.calories }}{{ food.calories_unit }}</h6>
    </div>
    
    <div class="mt-3" v-if="hasMacros">
        <div class="text-body2 mb-1 text-center font-weight-medium">Macros</div>
        <div class="mt-1">
            <Pie :data="chartData" :options="chartOptions" />
        </div>
    </div>

    <div class="mt-5 pt-5">
        <div class="text-body2 mb-1 text-center font-weight-medium">Nutrition Facts</div>

        <v-table>
            <tbody>
                <tr>
                    <td class="text-grey-darken-3">
                        {{ food.servings_per_container }} Servings Per Container
                    </td>
                </tr>
                <tr>
                    <td class="text-grey-darken-3">
                        Serving Size: {{ food.serving_size }}{{ food.serving_size_unit }}
                    </td>
                </tr>
                <tr>
                    <td class="text-grey-darken-3">
                        Calories: {{ food.calories }}{{ food.calories_unit }}
                        <v-progress-linear :model-value="calculatePercentage(food.calories, calorie_req_in_kcal)" color="primary"></v-progress-linear>
                    </td>
                </tr>
            </tbody>
        </v-table>
        
        <v-divider></v-divider>

        <NutrientsTable :nutrients="food.nutrients" :reni_percentages="reni_percentages" />

    </div>

    <div class="mt-5">
        <div class="text-body2 mb-1 text-center font-weight-medium">Ingredients</div>

        <p class="text-subtitle2 text-grey-darken-3">
            {{ food.ingredients }}
        </p>
    </div>


    <div class="mt-5 pt-5 text-center">
        <div class="text-body2 mb-1 font-weight-medium">Images</div>

        <v-row>
            <v-col
                v-for="img in images"
                :key="img"
                class="d-flex child-flex"
                cols="6"
            >
                <v-img
                    :lazy-src="img"
                    :src="img.src"
                    aspect-ratio="1"
                    class="bg-grey-lighten-2"
                    cover
                    @click="openImageModal(img)"
                >
                    <template v-slot:placeholder>
                        <v-row
                            align="center"
                            class="fill-height ma-0"
                            justify="center"
                        >
                            <v-progress-circular
                                color="grey-lighten-5"
                                indeterminate
                            ></v-progress-circular>
                        </v-row>
                    </template>
                </v-img>
            </v-col>
        </v-row>


        <v-dialog
            v-model="imageModalVisible"   
        >
            <v-card
                max-width="400"
                :title="currentImage.title"
                v-if="currentImage"
            >
                <v-img
                    :src="currentImage.src"
                    cover
                ></v-img>

                <template v-slot:actions>
                    <v-btn
                        class="ms-auto"
                        text="Ok"
                        @click="closeImageModal"
                    ></v-btn>
                </template>
            </v-card>
        </v-dialog>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'
import axios from 'axios'
import NutrientsTable from '@/components/NutrientsTable.vue'
import { calculatePercentage } from '@/helpers/Numbers';

import { useRoute } from 'vue-router';


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      onClick: null
    }  
  }
}


ChartJS.register(ArcElement, Tooltip, Legend)

const imageModalVisible = ref(false);

const currentImage = ref(null);

export default {
  name: 'FoodView',
  components: {
    Pie,
    NutrientsTable
  },
    
  data: () => ({
    chartOptions,
    imageModalVisible,
    
  }),

  setup() {

    const route = useRoute();

    const food = ref(null);
    const images = ref([]);

    const hasMacros = ref(true);
    const chartData = ref(null);

    const calorie_req_in_kcal = ref(null);

    const reni_percentages = ref(null);
   
    const fetchData = async () => {
        
        // calories
        const energy_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-energy-intake?age=19`);
        calorie_req_in_kcal.value = energy_intake_res.data.male_energy_req_in_kcal;
        
        // fiber
        const fiber_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-recommended-macro-intake?age=19`);
        
        // macros
        const macro_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-macro-intake-distribution?age=19`);
       
        // vitamins
        const vitamin_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-recommended-vitamin-intake?age=19`);
        
        // minerals
        const mineral_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-recommended-mineral-intake?age=19`);
        
        const calories_per_gram_of_protein = 4;
        const calories_per_gram_of_carbs = 4;
        const calories_per_gram_of_fat = 9;
        const protein_req = energy_intake_res.data.male_energy_req_in_kcal * (macro_intake_res.data.protein_from / 100) / calories_per_gram_of_protein;
       
        const fat_req = energy_intake_res.data.male_energy_req_in_kcal * (macro_intake_res.data.fat_from / 100) / calories_per_gram_of_fat;
       
        const carbs_req = energy_intake_res.data.male_energy_req_in_kcal * (macro_intake_res.data.carbs_from / 100) / calories_per_gram_of_carbs;
       
        const daily_sugar_percentage_limit = 9;
        const sugar_req = energy_intake_res.data.male_energy_req_in_kcal * (daily_sugar_percentage_limit / 100) / calories_per_gram_of_carbs;
       

        const sodium_req = mineral_intake_res.data.sodium;
        const potassium_req = mineral_intake_res.data.potassium;

        reni_percentages.value = {
            'dietary fiber': fiber_intake_res.data.fiber_from_in_grams,
            'protein': protein_req, 
            'total fat': fat_req,
            'total carbohydrates': carbs_req,
            'sugar': sugar_req,
            'sodium': sodium_req,
            'potassium': potassium_req,
        };

        const food_slug = route.params.food;;
        axios.get(`http://pinoy-food-api.test/api/foods/${food_slug}`)
            .then((res) => {
                food.value = res.data;
            
                const images_arr = [
                    {
                        title: 'Food',
                        src: res.data.title_image,
                    },
                    {
                        title: 'Nutrition label',
                        src: res.data.nutrition_label_image,
                    }
                ];

                if (res.data.barcode_image) {
                    images_arr.push({
                        title: 'Barcode',
                        src: res.data.barcode_image,
                    });
                }   

                if (res.data.ingredients_image) {
                    images_arr.push({
                        title: 'Ingredients',
                        src: res.data.ingredients_image,
                    });
                }

                images.value = images_arr;

            
                const macros_keys = ['total carbohydrates', 'protein', 'total fat'];
                
                const macros_data = {};

                res.data.nutrients.forEach((itm) => {
                    if (macros_keys.indexOf(itm.name) !== -1) {
                    macros_data[itm.name] = itm.amount;
                    }
                });

                const macros_numbers = Object.values(macros_data);
                const total = macros_numbers.reduce((sum, num) => sum + num, 0);

                const macros_percentages = {};
                for (const [key, value] of Object.entries(macros_data)) {
                    const percent = calculatePercentage(value, total);
                    macros_percentages[key] = percent.toFixed(2);
                }

                if (Object.values(macros_data).filter(itm => itm).length === 0) {
                    hasMacros.value = false;
                }

                chartData.value = {
                    labels: ['Protein', 'Fat', 'Carbs'],
                    datasets: [
                        {
                            backgroundColor: ['#2ecc71', '#d35400', '#f39c12'],
                            data: [
                                macros_percentages['protein'],
                                macros_percentages['total fat'],
                                macros_percentages['total carbohydrates']
                            ] 
                        }
                    ],
                }

            })
            .catch((err) => {
                console.log('err: ', err);
            });
    }

    onMounted(fetchData);

    return {
        food,
        images,
        currentImage,
        hasMacros,
        chartData,

        calorie_req_in_kcal,
        reni_percentages,

        calculatePercentage
    }

  },

  

  methods: {
      closeImageModal() {
         this.imageModalVisible = false; 
      },

      openImageModal(img) {
          this.imageModalVisible = true;
          currentImage.value = img;
      }
  }
}
</script>