<template>
  <div class="mt-5" v-if="food">
    
    <div class="pt-3">
        <div class="float-right">
            <v-chip size="small" variant="outlined" v-if="food.food_type">
            {{ food.food_type }}
            </v-chip>
        </div>

        <h1 class="text-h6">{{ food.description }}</h1>
        <span v-if="food.alternate_names != 'N/A'">{{ food.alternate_names }}</span>
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
                <tr v-if="food.servings_per_container">
                    <td class="text-grey-darken-3">
                        {{ food.servings_per_container }} Servings Per Container
                    </td>
                </tr>
                <tr>
                    <td class="text-grey-darken-3">
                        Serving Size: {{ food.serving_size }}{{ food.serving_size_unit }}
                    </td>
                </tr>
                <tr v-if="food.edible_portion < 100">
                    <td class="text-grey-darken-3">
                       Edible Portion: {{ food.edible_portion }}%
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

        <div class="mt-3" v-if="elements.length">
            <span class="text-subtitle-2">Elements</span>
            <NutrientsTable :nutrients="elements" :recommended_daily_values="recommended_daily_values" />
        </div>

        <div class="mt-3" v-if="macros.length">
            <span class="text-subtitle-2">Macros</span>
            <NutrientsTable :nutrients="macros" :recommended_daily_values="recommended_daily_values" />
        </div>

        <div class="mt-3" v-if="vitamins.length">
            <span class="text-subtitle-2">Vitamins</span>
            <NutrientsTable :nutrients="vitamins" :recommended_daily_values="recommended_daily_values" />
        </div>

        <div class="mt-3" v-if="minerals.length">
            <span class="text-subtitle-2">Minerals</span>
            <NutrientsTable :nutrients="minerals" :recommended_daily_values="recommended_daily_values" />
        </div>

        <div class="mt-3" v-if="others.length">
            <span class="text-subtitle-2">Others</span>
            <NutrientsTable :nutrients="others" :recommended_daily_values="recommended_daily_values" />
        </div>
    </div>

    <div class="mt-5" v-if="food.ingredients">
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

    <div class="mt-5" v-if="food.origin_country !== 'PH'">
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
import { getSortedByName } from '@/helpers/Arr';

import { useRoute } from 'vue-router'; 

const API_BASE_URI = import.meta.env.API_BASE_URL;


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
        onClick: null,    
    },

    tooltip: {
        enabled: true,
        callbacks: {
            label: function(tooltipItem) {
                return tooltipItem.formattedValue + "%";
            },
        },
    }
  }
}


ChartJS.register(ArcElement, Tooltip, Legend)

const imageModalVisible = ref(false);

const currentImage = ref(null);

const nutrients = ref(null);

const elements = ref(null);
const macros = ref(null);
const vitamins = ref(null);
const minerals = ref(null);
const others = ref(null);

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
        axios.get(`${API_BASE_URI}/foods/${food_slug}`)
            .then(async (res) => {
                const age = res.data.age;
               
                //
                // calories
                const energy_intake_res = await axios.get(`${API_BASE_URI}/reni-energy-intake?age=${age}`);
                calorie_req_in_kcal.value = energy_intake_res.data.male_energy_req_in_kcal;
                
                // fiber
                const fiber_intake_res = await axios.get(`${API_BASE_URI}/reni-recommended-macro-intake?age=${age}`);
                
                // macros
                const macro_intake_res = await axios.get(`${API_BASE_URI}/reni-macro-intake-distribution?age=${age}`);
            
                // vitamins
                const vitamin_intake_res = await axios.get(`${API_BASE_URI}/reni-recommended-vitamin-intake?age=${age}`);
                
                // minerals
                const mineral_intake_res = await axios.get(`${API_BASE_URI}/reni-recommended-mineral-intake?age=${age}`);

                // fda daily values (for adults)
                const fda_daily_nutrient_values_res = await axios.get(`${API_BASE_URI}/fda-daily-nutrient-values`);
                
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
                    
                ];

                if (res.data.nutrition_label_image) {
                    images_arr.push({
                        title: 'Nutrition label',
                        src: res.data.nutrition_label_image,
                    })
                }

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

                console.log('not: ', macros_percentages);

                chartData.value = {
                    labels: [`Protein: ${macros_percentages.protein}%`, `Fat: ${macros_percentages['total fat']}%`, `Carbs: ${macros_percentages['total carbohydrates']}%`],
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

                const element_names = ['total ash', 'water'];
                const macro_names = ['total carbohydrates', 'total fat', 'protein'];
                const vitamin_names = [
                    'vitamin a', 'vitamin c', 'vitamin d', 
                    'vitamin e', 'vitamin k', 'vitamin b1', 
                    'vitamin b2', 'vitamin b3',
                    'vitamin b5', 'vitamin b6', 'vitamin b7', 
                    'vitamin b9', 'vitamin b12'
                ];
                const mineral_names = [
                    'calcium', 'chloride', 'chromium', 'copper', 
                    'iodine', 'iron', 'magnesium', 'manganese', 'molybdenum', 
                    'phosphorus', 'potassium', 'selenium', 'sodium', 'zinc'
                ];
                const other_names = [
                    'lactose'
                ];

                const elements_items = [];
                const macros_items = [];
                const vitamins_items = [];
                const minerals_items = [];
                const others_items = [];

                res.data.nutrients.forEach((itm) => {
                    if (element_names.indexOf(itm.name) !== -1) {
                        elements_items.push(itm);
                    } else if (macro_names.indexOf(itm.name) !== -1) {
                        macros_items.push(itm);
                    } else if (vitamin_names.indexOf(itm.name) !== -1) {
                        vitamins_items.push(itm);
                    } else if (mineral_names.indexOf(itm.name) !== -1) {
                        minerals_items.push(itm);
                    } else if (other_names.indexOf(itm.name) !== -1) {
                        others_items.push(itm);
                    }
                });
                
                elements.value = getSortedByName(elements_items);
                macros.value = getSortedByName(macros_items);
                vitamins.value = getSortedByName(vitamins_items); 
                minerals.value = getSortedByName(minerals_items);
                others.value = getSortedByName(others_items);
                

            })
            .catch((err) => {
                console.log('err: ', err);
            });
    }

    onMounted(fetchData);

    return {
        food,
        nutrients,
        elements,
        macros,
        vitamins,
        minerals,
        others,

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