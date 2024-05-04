<template>
  <div class="mt-5">
    
    <div class="pt-3">
        <h1 class="text-h5 text-center">{{ $route.params.food }}</h1>
    </div>
    
    <div class="mt-3">
        <div class="text-body2 mb-1 text-center font-weight-medium">Macros</div>
        <div class="mt-1">
            <Pie :data="chartData" :options="chartOptions" />
        </div>
    </div>

   
    <div class="mt-5 pt-5">
        <div class="text-body2 mb-1 text-center font-weight-medium">Nutrition Facts</div>
        <v-table density="compact">
           
            <tbody>
                <tr>
                    <td>
                        Total Carbohydrates
                        
                    </td>
                    <td>100mg</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <v-table density="compact">
                            <tbody>
                                <tr>
                                    <td>Fiber</td>
                                    <td>2.5g</td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <v-table density="compact">
                                            <tbody>
                                                <tr>
                                                    <td>Soluble</td>
                                                    <td>1.5g</td>
                                                </tr>
                                                <tr>
                                                    <td>Insoluble</td>
                                                    <td>1g</td>
                                                </tr>
                                            </tbody>
                                        </v-table>
                                    </td>
                                </tr>

                                <tr>
                                    <td>Sugars</td>
                                    <td>5g</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </td>
                </tr>
            </tbody>
        </v-table>

    </div>


    <div class="mt-5 pt-5 text-center">
        <div class="text-body2 mb-1 font-weight-medium">Images</div>

        <v-row>
            <v-col
                v-for="n in 4"
                :key="n"
                class="d-flex child-flex"
                cols="6"
            >
                <v-img
                    :lazy-src="`https://picsum.photos/10/6?image=${n * 5 + 10}`"
                    :src="`https://picsum.photos/500/300?image=${n * 5 + 10}`"
                    aspect-ratio="1"
                    class="bg-grey-lighten-2"
                    cover
                    @click="openImageModal"
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
                title="Image"
            >
                <v-img
                    height="200px"
                    src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
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
import { ref } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'


const chartData = {
  labels: ['Protein', 'Fat', 'Carbs'],
  datasets: [
    {
      backgroundColor: ['#980000', '#1A6BAD', '#2B5838'],
      data: [40, 20, 80]
    }
  ],

  
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}


ChartJS.register(ArcElement, Tooltip, Legend)

const imageModalVisible = ref(false);


export default {
  name: 'FoodView',
  components: {
    Pie,
  },
  data() {
    return {
        chartData,
        chartOptions,
        imageModalVisible,
       
    }
  },

  methods: {
      closeImageModal() {
         this.imageModalVisible = false; 
      },

      openImageModal() {
          this.imageModalVisible = true;
      }
  }
}
</script>