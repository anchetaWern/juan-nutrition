<template>
  <div class="nova-score">
    <img :src="getImageSrc()" />
  </div>
</template>

<script>
import one from '@/assets/images/nova/nova-group-1.svg';
import two from '@/assets/images/nova/nova-group-2.svg';
import three from '@/assets/images/nova/nova-group-3.svg';
import four from '@/assets/images/nova/nova-group-4.svg';

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
