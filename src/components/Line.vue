<template>
    <div id="line" :class="{ 'inner': inner }"></div>
</template>

<script>
export default {
  name: "Line",
  props: {
    inner: {
      type: Boolean,
      required: false,
      default: false
    },
  }
};
</script>

<style scoped>
#line {
    border-top: 1px solid #000;
}

.inner {
    margin-left: -16px;
}
</style>
