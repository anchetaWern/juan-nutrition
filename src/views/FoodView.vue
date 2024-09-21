<template>
  <div class="mt-5" v-if="food">
    
    <div class="pt-3">
        <div class="float-right cursor-pointer">
            <v-chip size="small" variant="outlined" v-if="food.type">
            <span @click="viewCategory(food.type.slug)">{{ food.type.name }}</span> <span @click="viewCategory(food.subtype.slug)" v-if="food.subtype">&nbsp;/ {{ food.subtype.name }}</span>
            </v-chip>
        </div>

        <h1 class="text-h6">{{ food.description }}</h1>
        <span v-if="food.alternate_names != 'N/A'">{{ food.alternate_names }}</span>
    </div>

    <div class="mt-5" v-if="food.nutrients.length === 0 || food.calories === null || food.food_type === null || food.serving_size === null">
        <v-alert 
            density="compact"
            type="warning"
            variant="outlined"
        >
            This food has incomplete data.
        </v-alert>
    </div>  

    <div class="d-flex flex-row justify-space-evenly" v-if="food.type">
        <NutriScore :nutriscore="nutriscore" />
        <NovaRating :currentGrade="food.subtype ? food.subtype.nova_class : food.type.nova_class" />
    </div>

    <div class="mt-3" v-if="hasMacros">
        <div class="text-body2 mb-1 text-center font-weight-medium">Macros</div>
        <div class="mt-1" style="height: 130px;">
            <Pie :data="chartData" :options="chartOptions" />
        </div>
    </div>

    <div class="mt-5 pt-5" v-if="food.nutrients.length > 0">
        <div class="text-body2 text-center font-weight-medium">Nutrition Facts <v-btn variant="text" size="x-small" icon="mdi-help" @click="dvHelp = true"></v-btn></div>
       
        <v-switch 
            v-if="hasValuesPerContainerToggle"
            label="Display values per container" 
            v-model="displayValuesPerContainer" 
            color="success"
            hide-details
            inset
            
        >
        </v-switch>

        <v-table>
            <tbody>
                <tr v-if="food.servings_per_container">
                    <td class="text-grey-darken-3">
                        {{ newServingCount ? newServingCount : food.servings_per_container }} Servings Per Container
                        <v-btn size="x-small" @click="openModifyServingCountModal">Modify</v-btn>
                    </td>
                </tr>
                <tr v-if="food.serving_size">
                    <td class="text-grey-darken-3">
                        Serving Size: {{ servingSize(food.serving_size, newServingSize) }}{{ food.serving_size_unit }} <span v-if="food.custom_serving_size">/ {{ food.custom_serving_size }}</span>
                        <v-btn size="x-small" @click="openModifyServingSizeModal">Modify</v-btn>
                    </td>
                </tr>
                <tr v-if="food.edible_portion && food.edible_portion < 100">
                    <td class="text-grey-darken-3">
                       Edible Portion: {{ food.edible_portion }}%
                    </td>
                </tr>
                <tr v-if="food.calories">
                    <td class="text-grey-darken-3">
                        Calories: {{ formatNumber(amountPerContainer(food.calories, servingsPerContainer, displayValuesPerContainer, newServingSize, newServingCount)) }}{{ food.calories_unit }} / {{ calorie_req_in_kcal }}{{ food.calories_unit }} ({{ formatNumber(calculatePercentage(amountPerContainer(food.calories, servingsPerContainer, displayValuesPerContainer, newServingSize, newServingCount), calorie_req_in_kcal)) }}%)
                        <v-progress-linear 
                            :model-value="calculatePercentage(amountPerContainer(food.calories, servingsPerContainer, displayValuesPerContainer, newServingSize, newServingCount), calorie_req_in_kcal)" 
                            :bg-color="getCalorieBgColor(amountPerContainer(food.calories, servingsPerContainer, displayValuesPerContainer, newServingSize, newServingCount))" 
                            :color="getCalorieColor(amountPerContainer(food.calories, servingsPerContainer, displayValuesPerContainer, newServingSize, newServingCount))">
                        </v-progress-linear>
                    </td>
                </tr>
            </tbody>
        </v-table>
        
        <v-divider></v-divider>

        <div class="mt-3" v-if="elements.length">
            <span class="text-subtitle-2">Elements</span>
            <NutrientsTable 
                :nutrients="elements" 
                :servingsPerContainer="servingsPerContainer" 
                :displayValuesPerContainer="displayValuesPerContainer"
                :recommended_daily_values="recommended_daily_values"
                :newServingSize="newServingSize"
                :newServingCount="newServingCount" />
        </div>

        <div class="mt-3" v-if="macros.length">
            <span class="text-subtitle-2">Macros</span>
            <NutrientsTable 
                :nutrients="macros" 
                :servingsPerContainer="servingsPerContainer" 
                :displayValuesPerContainer="displayValuesPerContainer"
                :recommended_daily_values="recommended_daily_values"
                :newServingSize="newServingSize"
                :newServingCount="newServingCount" />
        </div>

        <div class="mt-3" v-if="vitamins.length">
            <span class="text-subtitle-2">Vitamins</span>
            <NutrientsTable 
                :nutrients="vitamins" 
                :servingsPerContainer="servingsPerContainer" 
                :displayValuesPerContainer="displayValuesPerContainer"
                :recommended_daily_values="recommended_daily_values"
                :newServingSize="newServingSize"
                :newServingCount="newServingCount" />
        </div>

        <div class="mt-3" v-if="minerals.length">
            <span class="text-subtitle-2">Minerals</span>
            <NutrientsTable 
                :nutrients="minerals" 
                :servingsPerContainer="servingsPerContainer" 
                :displayValuesPerContainer="displayValuesPerContainer"
                :recommended_daily_values="recommended_daily_values"
                :newServingSize="newServingSize"
                :newServingCount="newServingCount" />
        </div>

        <div class="mt-3" v-if="others.length">
            <span class="text-subtitle-2">Others</span>
            <NutrientsTable 
                :nutrients="others" 
                :servingsPerContainer="servingsPerContainer" 
                :displayValuesPerContainer="displayValuesPerContainer"
                :recommended_daily_values="recommended_daily_values"
                :newServingSize="newServingSize"
                :newServingCount="newServingCount" />
        </div>
    </div>

    <div class="mt-5 text-center" v-if="food.ingredients">
        <div class="text-body2 mb-1 text-center font-weight-medium">Ingredients</div>

        <p class="text-subtitle2 text-grey-darken-3">
            {{ food.ingredients }}
        </p>

       <v-btn variant="plain" size="x-small" @click="openIngredientsInfoModal" v-if="food.hasIngredientsInfo">
       View More Info
       </v-btn>
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
            v-model="modifyServingSizeDialog"
            width="300"
        >
            <v-card>
                <v-text-field
                    hide-details="auto"
                    label="Serving size in grams"
                    placeholder="50"
                    v-model="newServingSize"
                    autofocus
                ></v-text-field>
            
                <v-btn color="primary" block @click="modifyServingSize" rounded="0">Modify serving size</v-btn>
            </v-card>

        </v-dialog>

        <v-dialog
            v-model="modifyServingCountDialog"
            width="300"
        >
            <v-card>
                <v-text-field
                    hide-details="auto"
                    label="Serving Count"
                    placeholder="5"
                    v-model="newServingCount"
                    autofocus
                ></v-text-field>
            
                <v-btn color="primary" block @click="modifyServingCount" rounded="0">Modify number of servings</v-btn>
            </v-card>

        </v-dialog>

        <v-dialog
            v-model="ingredientsInfoDialog"
            fullscreen
            transition="dialog-bottom-transition"
            v-slot:default="{ isActive }"
        >
            <v-card title="Ingredients Analysis">
                <template v-slot:text>

                    <div v-for="(ingredient, index) in food_ingredients">
                        <div class="mb-5">
                            <div class="text-subtitle-1 font-weight-bold">{{ ingredient.name }}</div>
                            <div class="mb-2 text-grey-darken-4">Score: {{ ingredient.score }} out of 5</div>
                            <p class="text-body-2">{{ ingredient.effects }}</p>
                            <div class="mt-3">
                                <div class="font-weight-medium">Health Risks</div>
                                <p class="text-body-2">{{ ingredient.health_risks }}</p>
                            </div>
                        </div>

                        <v-divider class="mb-5"></v-divider>
                    </div>
                   

                </template>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text="close"
                        variant="flat"
                        @click="isActive.value = false"
                    ></v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>


        <v-dialog
            max-width="400"
            v-model="imageModalVisible"   
        >
            <v-card
                
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

    <div class="mt-5" v-if="food.origin_country && food.origin_country !== 'PH'">
        <div class="text-body2 mb-1">Origin Country: {{ food.origin_country }}</div>
    </div>

  </div>


    <v-dialog
        v-model="dvHelp"
        fullscreen
        transition="dialog-bottom-transition"
    >
        <template v-slot:default="{ isActive }">
            <v-card title="Daily Values">
    
                <template v-slot:text>
                    <div class="text-body-2">
                        <p>
                        The Daily Values are the recommended amounts of nutrients to consume or not to exceed each day. 
                        These values are from the<a href="https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels" target="_blank">
                        U.S. Food and Drug Administration.</a> 
                        5% DV or less of a nutrient per serving is considered low. 20% DV or more of a nutrient is considered high.
                        </p>
                        <p class="mt-2">
                        The values are color coded: <span class="text-blue">blue</span> for low, <span class="text-orange">orange</span> for moderate, <span class="text-red">red</span> for high.
                        </p>
                        <p>
                        For nutrients that are generally good for everyone: protein, dietary fiber, vitamins and minerals. You want to aim for foods that are orange or red color.
                        </p>
                        <p>
                        For nutrients that are generally bad for everyone (when consumed in large amounts): sodium, saturated fat. You want to aim for foods that have blue color.
                        </p>
                        <p class="mt-2">
                        Do note that these values are only meant to serve as a general reference for the nutritional needs of the average person. 
                        Individual needs may vary depending on various factors such as age, gender, activity level, health status, body size and composition, metabolic rate, genetic factors, lifestyle and dietary habits, and environmental factors.
                        </p>

                        <p class="mt-2">These are the reference values for each nutrient:</p>
                        
                    </div>   

                    <div class="pt-3 text-body-2">
                 
                        <v-table density="compact">
                            <thead>
                                <tr>
                                <th class="text-left">
                                    Nutrient
                                </th>
                                <th class="text-left">
                                    Value
                                </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="item in daily_values_table"
                                    :key="item.nutrient"
                                >
                                <td>{{ item.nutrient }}</td>
                                <td>{{ item.value }}</td>
                                </tr>
                            </tbody>
                        </v-table>

                    </div>
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
import { ref, onMounted } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'
import axios from 'axios'
import NutrientsTable from '@/components/NutrientsTable.vue'
import NutriScore from '@/components/NutriScore.vue'
import NovaRating from '@/components/NovaRating.vue'
import { calculatePercentage, formatNumber } from '@/helpers/Numbers';
import { amountPerContainer } from '@/helpers/Nutrients';
import { getSortedByName, findAgeData } from '@/helpers/Arr';
import { nutrientUnit, standardizeVitaminD, standardizeVitaminA, standardizeVitaminE, standardizeVitaminB3, standardizeVitaminB9, servingSize } from '@/helpers/Nutrients';

import { useRoute } from 'vue-router'; 

const API_BASE_URI = import.meta.env.VITE_API_URI;


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
            title: function(tooltipItem) {
                return null;
            },
            footer: function(tooltipItem) {
                return null;
            },
            beforeLabel: function(tooltipItem) {
                return null;
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
    NutrientsTable,
    NutriScore,
    NovaRating
  },
    
  data: () => ({
    chartOptions,
    imageModalVisible,
    dvHelp: false,
    displayValuesPerContainer: false,
    
  }),


  setup() {

    const route = useRoute();

    const food = ref(null);
    const images = ref([]);

    const hasMacros = ref(true);
    const chartData = ref(null);

    const calorie_req_in_kcal = ref(2000);

    const recommended_daily_values = ref(null);

    const daily_values_table = ref(null);

    const servingsPerContainer = ref(1);
    const hasValuesPerContainerToggle = ref(false);

    const modifyServingSizeDialog = ref(false);

    const modifyServingCountDialog = ref(false);

    const ingredientsInfoDialog = ref(false);

    const newServingSize = ref(null);

    const newServingCount = ref(null);

    const food_ingredients = ref(null);

    const nutriscore = ref(null);

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

    const openModifyServingCountModal = () => {
        modifyServingCountDialog.value = true;
    }

    const openModifyServingSizeModal = () => {
        modifyServingSizeDialog.value = true;
    }

     const openIngredientsInfoModal = () => {
        // todo:
        const food_slug = route.params.food;
        axios.get(`${API_BASE_URI}/food-ingredients/${food_slug}`)
            .then(async (res) => {
                console.log('res: ', res.data);
                food_ingredients.value = res.data;
            });

        ingredientsInfoDialog.value = true;
    }

    const modifyServingSize = () => {
        modifyServingSizeDialog.value = false;
    }

    const modifyServingCount = () => {
        modifyServingCountDialog.value = false;
    }

    const fetchData = async () => {
      
        // fda daily values (for adults)
        let fda_daily_nutrient_dv = null;
        if (localStorage.getItem('fda_daily_nutrient_dv')) {
            fda_daily_nutrient_dv = JSON.parse(localStorage.getItem('fda_daily_nutrient_dv'));
        } else {
            const fda_daily_nutrient_values_res = await axios.get(`${API_BASE_URI}/fda-daily-nutrient-values`);
            fda_daily_nutrient_dv = fda_daily_nutrient_values_res.data;
            localStorage.setItem('fda_daily_nutrient_dv', JSON.stringify(fda_daily_nutrient_dv));
        }
        //

        const food_slug = route.params.food;

        axios.get(`${API_BASE_URI}/nutriscore/${food_slug}`)
            .then(async (res) => {
                nutriscore.value = res.data;
                console.log('nutriscore: ', res.data);
            });

        axios.get(`${API_BASE_URI}/foods/${food_slug}`)
            .then(async (res) => {

                const fda_daily_nutrient_values_arr = fda_daily_nutrient_dv.map((itm) => {
                    return {
                        [itm.nutrient]: itm.daily_value,
                    }
                });
                const fda_daily_nutrient_values = Object.assign({}, ...fda_daily_nutrient_values_arr);
               
                
                recommended_daily_values.value = fda_daily_nutrient_values;
               
                const dv_table = Object.keys(fda_daily_nutrient_values).map((key) => {
                    const val = fda_daily_nutrient_values[key];
                    const unit = nutrientUnit(key);
                    return {
                        nutrient: key, 
                        value: `${val}${unit}`
                   }
                });
                
                daily_values_table.value = dv_table;
                //
               
                food.value = res.data;
                if (res.data.servings_per_container) {
                    servingsPerContainer.value = res.data.servings_per_container;

                    if (res.data.servings_per_container > 1) {
                        hasValuesPerContainerToggle.value = true;
                    }
                }
                
            
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
                     
                        const standard_unit = nutrientUnit(itm.name);
                        let updated_itm = itm;
                        if (itm.name === 'vitamin d') {
                            const standard_amount = standardizeVitaminD(itm.amount, itm.unit);
                            updated_itm = {...itm, amount: standard_amount, unit: standard_unit};
                        } else if (itm.name === 'vitamin a') {
                            const standard_amount = standardizeVitaminA(itm.amount, itm.unit);
                            updated_itm = {...itm, amount: standard_amount, unit: standard_unit};
                        } else if (itm.name === 'vitamin e') {
                            const standard_amount = standardizeVitaminE(itm.amount, itm.unit);
                            updated_itm = {...itm, amount: standard_amount, unit: standard_unit};
                        } else if (itm.name === 'vitamin b3') {
                            const standard_amount = standardizeVitaminB3(itm.amount, itm.unit);
                            updated_itm = {...itm, amount: standard_amount, unit: standard_unit};
                        } else if (itm.name === 'vitamin b9') {
                            const standard_amount = standardizeVitaminB9(itm.amount, itm.unit);
                            updated_itm = {...itm, amount: standard_amount, unit: standard_unit};
                        }

                        vitamins_items.push(updated_itm);
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

        daily_values_table,
        servingsPerContainer,
        hasValuesPerContainerToggle,

        calculatePercentage,
        formatNumber,

        getCalorieBgColor,
        getCalorieColor,

        amountPerContainer,

        openModifyServingCountModal,

        openModifyServingSizeModal,
        modifyServingSizeDialog,

        modifyServingSize,
        newServingSize,

        modifyServingCountDialog,
        newServingCount,

        modifyServingCount,
        
        servingSize,

        openIngredientsInfoModal,
        ingredientsInfoDialog,
        food_ingredients,
        nutriscore,
    }

  },

  

  methods: {
      viewCategory(slug) {
          this.$router.push(`/search?category=${slug}`);
      },
      
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