<template>
  <div class="nova-score">
    <v-btn variant="text" size="x-small" class="float-end pb-1" icon="mdi-help" @click="novaDialog = true"></v-btn>
    <img :src="getImageSrc()" />
  </div>


    <v-dialog
        v-model="novaDialog"
        fullscreen
        transition="dialog-bottom-transition"
    >
        <template v-slot:default="{ isActive }">
            <v-card title="NOVA">
                <template v-slot:text>

                  <v-alert
                    type="warning"
                    variant="outlined"
                    density="compact"
                  >
                    Note that the NOVA classification is still a work in progress. <span v-if="showNovaAlert">It's based off of the food category and those are AI generated. Ideally, it should be based off of the ingredients and processing method. Since we don't have a complete data on those yet, the developer decided to based it off the food category.</span>
                    <div>
                      <v-btn size="x-small" variant="text" @click="toggleNovaAlert">{{ showNovaAlert ? "Read less" : "Read more" }}</v-btn>
                    </div>
                  </v-alert>

                    <img :src="getImageSrc()" />

                    <div class="text-body-2">
                    The <a href="https://en.wikipedia.org/wiki/Nova_classification" target="_blank">NOVA food classification system</a> categorizes foods based on the extent and purpose of their processing. Developed by researchers at the University of São Paulo, it is widely used in public health and nutrition research. The system includes four categories:
                    </div>

                    <ol class="pt-3 pl-3">
                        <li>
                            <div class="text-body-2 font-weight-medium">Unprocessed or Minimally Processed Foods</div>
                            <div class="text-caption mb-2">Foods that are edible in their natural state or altered slightly to extend their shelf life or enhance their preparation (e.g., fresh fruits, vegetables, grains, meats, and milk).</div>
                        </li>
                        <li>
                            <div class="text-body-2 font-weight-medium">Processed Culinary Ingredients</div>
                            <div class="text-caption mb-2">Substances extracted from minimally processed foods or from nature and used in cooking (e.g., oils, butter, sugar, and salt).</div>
                        </li>
                        <li>
                            <div class="text-body-2 font-weight-medium">Processed Foods</div>
                            <div class="text-caption mb-2">Foods that have been altered by adding salt, sugar, oil, or other substances to make them more durable or palatable (e.g., canned vegetables, cheese, and freshly made bread).</div>
                        </li>
                        <li>
                            <div class="text-body-2 font-weight-medium">Ultra-Processed Foods</div>
                            <div class="text-caption mb-2">Formulations mostly of substances derived from foods and additives, with little or no whole food content. These are often industrially manufactured, designed to be convenient and hyper-palatable (e.g., sugary snacks, soft drinks, instant noodles, and ready-to-eat meals).</div>
                        </li>
                    </ol>


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
import one from '@/assets/images/nova/nova-group-1.svg';
import two from '@/assets/images/nova/nova-group-2.svg';
import three from '@/assets/images/nova/nova-group-3.svg';
import four from '@/assets/images/nova/nova-group-4.svg';

const novaDialog = ref(false);

export default {
  props: {
    currentGrade: {
      type: String,
      required: true,
      validator: function (value) {
        return ['1', '2', '3', '4'].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      novaDialog,
      showNovaAlert: false,
      images: {
        '1': one,
        '2': two,
        '3': three,
        '4': four,
      }
    };
  },
  methods: {
    getImageSrc() {
      return this.images[this.currentGrade];
    },

    toggleNovaAlert() {
      this.showNovaAlert = !this.showNovaAlert;
    }
  }
};
</script>

<style scoped>
.nova-score {
  margin-top: 10px;
  text-align: center;
}

.nova-score img {
  width: 40px;
  height: auto;
}
</style>
