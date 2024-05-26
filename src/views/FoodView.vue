<template>
  <div class="mt-5" v-if="food">
    
    <div class="pt-3">
        <h1 class="text-h5 text-center">{{ food.description }}</h1>
        <h6 class="text-body-1 text-center text-grey-darken-3">{{ food.calories }}{{ food.calories_unit }}</h6>
    </div>
    
    <div class="mt-3" v-if="hasMacros">
        <div class="text-body2 mb-1 text-center font-weight-medium">Macros</div>
        <div class="mt-1" style="height: 130px;">
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
                        Calories: {{ food.calories }}{{ food.calories_unit }} / {{ calorie_req_in_kcal }}{{ food.calories_unit }}
                        <v-progress-linear 
                            :model-value="calculatePercentage(food.calories, calorie_req_in_kcal)" 
                            :bg-color="getCalorieBgColor(food.calories)" 
                            :color="getCalorieColor(food.calories)">
                        </v-progress-linear>
                    </td>
                </tr>
            </tbody>
        </v-table>
        
        <v-divider></v-divider>

        <NutrientsTable :nutrients="food.nutrients" :recommended_daily_values="recommended_daily_values" />

    </div>

    <div class="mt-5">
        <div class="text-body2 mb-1 text-center font-weight-medium">Ingredients</div>

        <p class="text-subtitle2 text-grey-darken-3">
            {{ food.ingredients }}
        </p>
    </div>

    <div class="mt-5" v-if="food.allergen_information">
        <div class="text-body2 mb-1 text-center font-weight-medium">Allergen Info</div>

        <p class="text-subtitle2 text-grey-darken-3">
            {{ food.allergen_information }}
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

    <div class="mt-5" v-if="food.origin_country">
        <div class="text-body2 mb-1">Origin Country: {{ food.origin_country }}</div>

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

    const recommended_daily_values = ref(null);

    const getCalorieBgColor = (calories) => {
        if (calories >= 400) {
          return 'red-darken-1';  
        } else if (calories >= 100 && calories <= 200) {
          return 'orange-darken-1';
        }
        return 'blue-darken-1';
    }
   
    const getCalorieColor = (calories) => {
        if (calories >= 400) {
          return 'red-darken-3';  
        } else if (calories >= 100 && calories <= 200) {
          return 'orange-darken-3';
        }
        return 'blue-darken-3';
    }

    const fetchData = async () => {
        
        

        // todo: store in local storage
        // check local storage first before making another request
        // use the value in local storage if there is a value

        const food_slug = route.params.food;;
        axios.get(`http://pinoy-food-api.test/api/foods/${food_slug}`)
            .then(async (res) => {
                const age = res.data.age;
               
                //
                // calories
                const energy_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-energy-intake?age=${age}`);
                calorie_req_in_kcal.value = energy_intake_res.data.male_energy_req_in_kcal;
                
                // fiber
                const fiber_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-recommended-macro-intake?age=${age}`);
                
                // macros
                const macro_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-macro-intake-distribution?age=${age}`);
            
                // vitamins
                const vitamin_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-recommended-vitamin-intake?age=${age}`);
                
                // minerals
                const mineral_intake_res = await axios.get(`http://pinoy-food-api.test/api/reni-recommended-mineral-intake?age=${age}`);

                // fda daily values (for adults)
                const fda_daily_nutrient_values_res = await axios.get(`http://pinoy-food-api.test/api/fda-daily-nutrient-values`);
                
                const calories_per_gram_of_protein = 4;
                const calories_per_gram_of_carbs = 4;
                const calories_per_gram_of_fat = 9;
                const protein_req = energy_intake_res.data.male_energy_req_in_kcal * (macro_intake_res.data.protein_from / 100) / calories_per_gram_of_protein;
            
                const fat_req = energy_intake_res.data.male_energy_req_in_kcal * (macro_intake_res.data.fat_from / 100) / calories_per_gram_of_fat;
            
                const carbs_req = energy_intake_res.data.male_energy_req_in_kcal * (macro_intake_res.data.carbs_from / 100) / calories_per_gram_of_carbs;
            
                const daily_sugar_percentage_limit = 9;
                const sugar_req = energy_intake_res.data.male_energy_req_in_kcal * (daily_sugar_percentage_limit / 100) / calories_per_gram_of_carbs;
            

                const sodium_req = 2300; // american heart health association - no more than 2300mg sodium per day
                const cholesterol_req = 300; // 300mg
                const potassium_req = mineral_intake_res.data.potassium;
                const calcium_req = mineral_intake_res.data.male_calcium;
                const iron_req = mineral_intake_res.data.male_iron;
                const magnesium_req = mineral_intake_res.data.male_magnesium;
                const zinc_req = mineral_intake_res.data.male_zinc;
                const selenium_req = mineral_intake_res.data.male_selenium;

                const vitamin_a_req = vitamin_intake_res.data.male_vitamin_a;
                const vitamin_c_req = vitamin_intake_res.data.male_vitamin_c;
                const vitamin_d_req = vitamin_intake_res.data.male_vitamin_d;
                const vitamin_e_req = vitamin_intake_res.data.male_vitamin_e;
                const vitamin_k_req = vitamin_intake_res.data.male_vitamin_k;

                const vitamin_b1_req = vitamin_intake_res.data.male_thiamin;
                const vitamin_b2_req = vitamin_intake_res.data.male_riboflavin;
                const vitamin_b3_req = vitamin_intake_res.data.male_niacin;
                const vitamin_b6_req = vitamin_intake_res.data.male_pyridoxine;
                const vitamin_b9_req = vitamin_intake_res.data.male_folate;
                const vitamin_b12_req = vitamin_intake_res.data.male_cobalamin;

                // fda daily values
                const fda_daily_nutrient_values_arr = fda_daily_nutrient_values_res.data.map((itm) => {
                    return {
                        [itm.nutrient]: itm.daily_value,
                    }
                });
                const fda_daily_nutrient_values = Object.assign({}, ...fda_daily_nutrient_values_arr);
               
                const reni_daily_nutrient_values = {
                    'dietary fiber': fiber_intake_res.data.fiber_from_in_grams,
                    'protein': protein_req, 
                    'total fat': fat_req,
                    'cholesterol': cholesterol_req,
                    'total carbohydrates': carbs_req,
                    'sugar': sugar_req,
                    
                    // minerals
                    'sodium': sodium_req,
                    'potassium': potassium_req,
                    'calcium': calcium_req,
                    'iron': iron_req,
                    'magnesium': magnesium_req,
                    'zinc': zinc_req,
                    'selenium': selenium_req,

                    // vitamins
                    'vitamin a': vitamin_a_req,
                    'vitamin c': vitamin_c_req,
                    'vitamin d': vitamin_d_req,
                    'vitamin e': vitamin_e_req,
                    'vitamin k': vitamin_k_req,
                    'vitamin b1': vitamin_b1_req,
                    'vitamin b2': vitamin_b2_req,
                    'vitamin b3': vitamin_b3_req,
                    'vitamin b6': vitamin_b6_req,
                
                    'vitamin b9': vitamin_b9_req,
                    'vitamin b12': vitamin_b12_req,
                };
                //

                recommended_daily_values.value = {...reni_daily_nutrient_values, ...fda_daily_nutrient_values};
               
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
        recommended_daily_values,

        calculatePercentage,

        getCalorieBgColor,
        getCalorieColor
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