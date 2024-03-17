<template>
  <div class="columnContainer">
    <h1>This is the wishing tree. It is full of candles.</h1>
    <h1>Click and blow out all of them to get 10% off on all our candle shop.</h1>
    <h3>Use ZQSD keyboard keys to move around the tree and the space bar to jump.</h3>
    <SceneController/>
    <canvas id="c"></canvas>
  </div>
</template>

<script>
import {initAndBuildThree} from '@/ThreeJS/canvas/Canvas1.js';
import SceneController from "@/components/SceneController.vue";
import {cleanupThreeJS} from "@/ThreeJS/BasicAndMouse";

export default {
  components: {SceneController},
  mounted() {
    const canvas = this.$el.querySelector('#c');
    const container = canvas.parentElement;
    initAndBuildThree(container);
  },
  methods: {},
  beforeUnmount() {
    cleanupThreeJS() ;
  }
}
</script>

<style scoped>

</style>