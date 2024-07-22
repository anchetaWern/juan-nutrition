<template>
  <div class="nutri-score">
    <img :src="getImageSrc()" />
  </div>
</template>

<script>
import A from '@/assets/images/nutriscore/nutriscore-A.svg';
import B from '@/assets/images/nutriscore/nutriscore-B.svg';
import C from '@/assets/images/nutriscore/nutriscore-C.svg';
import D from '@/assets/images/nutriscore/nutriscore-D.svg';
import E from '@/assets/images/nutriscore/nutriscore-E.svg';

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
